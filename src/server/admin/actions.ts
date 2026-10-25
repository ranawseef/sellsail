"use server";

// Admin panel actions. Each one checks the admin session itself (actions are
// public POST endpoints), validates its fields, and writes to admin_audit.

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requestInfo } from "../auth/context.ts";
import { hit, limitKey, LIMITS } from "../auth/rate-limit.ts";
import { exec, one } from "../db/pool.ts";
import { sendCodeEmail } from "../mail/send.ts";
import { PLANS, type PlanId } from "../../config/plans.ts";
import { AdminForbiddenError, adminAudit, adminForAction, consumeAdminCode, endAdminSession, isAdminEmail, issueAdminCode, startAdminSession } from "./auth.ts";

export type AdminState = { ok?: boolean; message?: string; error?: string; step?: "code"; email?: string } | undefined;

async function attempt(fn: () => Promise<AdminState>): Promise<AdminState> {
  try {
    return await fn();
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof AdminForbiddenError) return { error: err.message };
    console.error("[admin] action failed:", err);
    return { error: "Something went wrong. Check the server log." };
  }
}

const str = (form: FormData, k: string) => String(form.get(k) ?? "");

// ---- sign-in ----------------------------------------------------------------------

export async function requestAdminCodeAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  return attempt(async () => {
    const email = str(form, "email").trim().toLowerCase().slice(0, 190);
    const { ip } = await requestInfo();
    if (!(await hit(limitKey("admin-code-ip", ip), LIMITS.adminCodePerIp))) return { error: "Too many tries. Wait 15 minutes." };
    if (!z.email().safeParse(email).success) return { error: "Enter an email address." };
    // Same answer whether or not the address is an admin.
    if (isAdminEmail(email) && (await hit(limitKey("admin-code", email), LIMITS.codeEmailPerUser))) {
      const code = await issueAdminCode(email);
      const sent = await sendCodeEmail(email, "admin", code);
      if (!sent) return { error: "The code email couldn't be sent. Check the SMTP settings." };
    }
    return { step: "code", email, message: "If that address can sign in here, a 6-digit code is on its way. It works for 10 minutes." };
  });
}

export async function verifyAdminCodeAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  let ok = false;
  const state = await attempt(async () => {
    const email = str(form, "email").trim().toLowerCase().slice(0, 190);
    const { ip, userAgent } = await requestInfo();
    if (!(await hit(limitKey("admin-check-ip", ip), LIMITS.codeCheckPerIp))) return { step: "code", email, error: "Too many tries. Wait 15 minutes." };
    if (!isAdminEmail(email)) return { step: "code", email, error: "That code isn't right, or it has expired." };
    const r = await consumeAdminCode(email, str(form, "code"));
    if (r !== "ok") return { step: "code", email, error: r === "wrong" ? "That code isn't right." : "That code has expired. Ask for a new one." };
    await startAdminSession(email, ip, userAgent);
    await adminAudit(email, "admin.signin", null, userAgent.slice(0, 200), ip);
    ok = true;
    return { ok: true };
  });
  if (ok) redirect("/admin");
  return state;
}

export async function adminLogoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

// ---- workspaces -------------------------------------------------------------------

const STATUSES = ["trialing", "active", "past_due", "canceled", "expired"] as const;

const planSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  plan: z.enum(Object.keys(PLANS) as [PlanId, ...PlanId[]]),
  status: z.enum(STATUSES),
});

export async function setTenantPlanAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  return attempt(async () => {
    const admin = await adminForAction();
    const p = planSchema.safeParse({ tenantId: str(form, "tenantId"), plan: str(form, "plan"), status: str(form, "status") });
    if (!p.success) return { error: "Choose a plan and a status." };
    const { tenantId, plan, status } = p.data;
    const res = await exec("UPDATE tenants SET plan = ?, plan_status = ? WHERE id = ?", [plan, status, tenantId]);
    if (res.affectedRows === 0) return { error: "Workspace not found." };
    const { ip } = await requestInfo();
    await adminAudit(admin.email, "tenant.plan", tenantId, `${plan} / ${status}`, ip);
    revalidatePath(`/admin/workspaces/${tenantId}`);
    return { ok: true, message: `Plan set to ${PLANS[plan].name}, ${status.replace("_", " ")}.` };
  });
}

export async function extendTrialAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  return attempt(async () => {
    const admin = await adminForAction();
    const tenantId = Number(str(form, "tenantId"));
    const days = Number(str(form, "days"));
    if (!Number.isInteger(tenantId) || tenantId <= 0 || !Number.isInteger(days) || days < 1 || days > 90) return { error: "Days must be 1 to 90." };
    const res = await exec(
      `UPDATE tenants SET plan_status = 'trialing', plan = 'trial',
         trial_ends_at = GREATEST(COALESCE(trial_ends_at, NOW(3)), NOW(3)) + INTERVAL ? DAY
       WHERE id = ? AND plan_status NOT IN ('active','past_due')`,
      [days, tenantId],
    );
    if (res.affectedRows === 0) return { error: "Only workspaces without a paid subscription can get trial days." };
    const { ip } = await requestInfo();
    await adminAudit(admin.email, "tenant.trial", tenantId, `+${days} days`, ip);
    revalidatePath(`/admin/workspaces/${tenantId}`);
    return { ok: true, message: `Trial extended by ${days} day${days === 1 ? "" : "s"}.` };
  });
}

export async function setTenantPausedAction(form: FormData): Promise<void> {
  const admin = await adminForAction();
  const tenantId = Number(str(form, "tenantId"));
  if (!Number.isInteger(tenantId) || tenantId <= 0) return;
  const paused = str(form, "paused") === "1";
  await exec("UPDATE tenants SET paused = ? WHERE id = ?", [paused ? 1 : 0, tenantId]);
  const { ip } = await requestInfo();
  await adminAudit(admin.email, paused ? "tenant.pause" : "tenant.resume", tenantId, "", ip);
  revalidatePath(`/admin/workspaces/${tenantId}`);
}

export async function runTenantJobAction(form: FormData): Promise<void> {
  const admin = await adminForAction();
  const tenantId = Number(str(form, "tenantId"));
  const jobId = Number(str(form, "jobId"));
  if (!Number.isInteger(tenantId) || !Number.isInteger(jobId)) return;
  const res = await exec("UPDATE jobs SET run_now = 1, enabled = 1 WHERE id = ? AND tenant_id = ?", [jobId, tenantId]);
  if (res.affectedRows) {
    const { ip } = await requestInfo();
    await adminAudit(admin.email, "job.run", tenantId, `job ${jobId}`, ip);
  }
  revalidatePath(`/admin/workspaces/${tenantId}`);
}

// ---- users ------------------------------------------------------------------------

export async function verifyUserEmailAction(form: FormData): Promise<void> {
  const admin = await adminForAction();
  const userId = Number(str(form, "userId"));
  if (!Number.isInteger(userId) || userId <= 0) return;
  const u = await one<{ email: string }>("SELECT email FROM users WHERE id = ?", [userId]);
  if (!u) return;
  await exec("UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW(3)) WHERE id = ?", [userId]);
  const { ip } = await requestInfo();
  await adminAudit(admin.email, "user.verify", null, u.email, ip);
  revalidatePath("/admin/users");
}

export async function signOutUserAction(form: FormData): Promise<void> {
  const admin = await adminForAction();
  const userId = Number(str(form, "userId"));
  if (!Number.isInteger(userId) || userId <= 0) return;
  const u = await one<{ email: string }>("SELECT email FROM users WHERE id = ?", [userId]);
  if (!u) return;
  await exec("DELETE FROM sessions WHERE user_id = ?", [userId]);
  const { ip } = await requestInfo();
  await adminAudit(admin.email, "user.signout", null, u.email, ip);
  revalidatePath("/admin/users");
}
