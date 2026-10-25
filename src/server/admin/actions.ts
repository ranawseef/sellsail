"use server";

// Admin panel actions. Each one checks the admin session itself (actions are
// public POST endpoints), validates its fields, and writes to admin_audit.

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requestInfo } from "../auth/context.ts";
import { hit, limitKey, LIMITS } from "../auth/rate-limit.ts";
import { exec, one, q, tx } from "../db/pool.ts";
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

const grantSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  kind: z.enum(["plan", "trial"]),
  plan: z.enum(["starter", "growth", "pro"]),
  days: z.coerce.number().int().min(1).max(3650).optional(),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().max(255),
});

/**
 * Free access for a set period: either a paid plan at no charge ("plan") or a
 * free trial ("trial", the trial plan's limits). Ends by itself on the date.
 */
export async function grantFreeAccessAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  return attempt(async () => {
    const admin = await adminForAction();
    const p = grantSchema.safeParse({
      tenantId: str(form, "tenantId"),
      kind: str(form, "kind"),
      plan: str(form, "plan") || "starter",
      days: str(form, "days") || undefined,
      until: str(form, "until") || undefined,
      note: str(form, "note").trim(),
    });
    if (!p.success) return { error: "Check the period: a number of days (1 to 3650) or a date." };
    const d = p.data;
    let end: Date;
    if (d.until) end = new Date(`${d.until}T23:59:59Z`);
    else if (d.days) end = new Date(Date.now() + d.days * 86400_000);
    else return { error: "Give a number of days or an end date." };
    if (!(end.getTime() > Date.now() + 60_000) || end.getTime() > Date.now() + 3650 * 86400_000) return { error: "The end date must be in the future, within 10 years." };

    const t = await one<{ stripe_subscription_id: string | null; plan_status: string }>("SELECT stripe_subscription_id, plan_status FROM tenants WHERE id = ?", [d.tenantId]);
    if (!t) return { error: "Workspace not found." };
    if (t.stripe_subscription_id && (t.plan_status === "active" || t.plan_status === "past_due")) {
      return { error: "This workspace pays through Stripe. Cancel or pause that subscription in Stripe first, or give a discount there." };
    }
    if (d.kind === "plan") {
      await exec("UPDATE tenants SET plan = ?, plan_status = 'active', comp_until = ?, comp_note = ?, trial_ends_at = NULL WHERE id = ?", [d.plan, end, d.note || null, d.tenantId]);
    } else {
      await exec("UPDATE tenants SET plan = 'trial', plan_status = 'trialing', trial_ends_at = ?, comp_until = NULL, comp_note = ? WHERE id = ?", [end, d.note || null, d.tenantId]);
    }
    const until = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
    const what = d.kind === "plan" ? `Free ${PLANS[d.plan].name}` : "Free trial";
    const { ip } = await requestInfo();
    await adminAudit(admin.email, d.kind === "plan" ? "tenant.free_plan" : "tenant.free_trial", d.tenantId, `${what} until ${until}${d.note ? ` (${d.note})` : ""}`, ip);
    revalidatePath(`/admin/workspaces/${d.tenantId}`);
    return { ok: true, message: `${what} until ${until}.` };
  });
}

export async function endFreeAccessAction(form: FormData): Promise<void> {
  const admin = await adminForAction();
  const tenantId = Number(str(form, "tenantId"));
  if (!Number.isInteger(tenantId) || tenantId <= 0) return;
  const res = await exec("UPDATE tenants SET plan_status = 'expired', comp_until = NULL, comp_note = NULL WHERE id = ? AND comp_until IS NOT NULL", [tenantId]);
  if (res.affectedRows) {
    const { ip } = await requestInfo();
    await adminAudit(admin.email, "tenant.free_end", tenantId, "", ip);
  }
  revalidatePath(`/admin/workspaces/${tenantId}`);
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

/** Deletes a workspace and everything in it. Only admins can do this. */
export async function deleteTenantAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  let done = false;
  const state = await attempt(async () => {
    const admin = await adminForAction();
    const tenantId = Number(str(form, "tenantId"));
    if (!Number.isInteger(tenantId) || tenantId <= 0) return { error: "Workspace not found." };
    const t = await one<{ name: string; plan_status: string; stripe_subscription_id: string | null }>(
      "SELECT name, plan_status, stripe_subscription_id FROM tenants WHERE id = ?",
      [tenantId],
    );
    if (!t) return { error: "Workspace not found." };
    if (str(form, "confirm").trim() !== t.name) return { error: "Type the workspace name exactly as shown." };
    if (t.stripe_subscription_id && (t.plan_status === "active" || t.plan_status === "past_due")) {
      return { error: "This workspace still has a Stripe subscription. Cancel it in Stripe first so they aren't charged." };
    }
    const members = await q<{ user_id: number }>("SELECT user_id FROM memberships WHERE tenant_id = ?", [tenantId]);
    await tx(async (c) => {
      // Every seller table cascades from tenants.
      await c.exec("DELETE FROM tenants WHERE id = ?", [tenantId]);
      if (members.length) {
        await c.exec("DELETE FROM users WHERE id IN (?) AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = users.id)", [members.map((m) => m.user_id)]);
      }
    });
    const { ip } = await requestInfo();
    await adminAudit(admin.email, "tenant.delete", null, `#${tenantId} ${t.name}`, ip);
    done = true;
    return { ok: true };
  });
  if (done) redirect("/admin/workspaces");
  return state;
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
