"use server";

// Signup, login and logout. Server actions are public POST endpoints: Next
// checks the Origin header against the Host, and every input is validated
// here with zod before it touches the database.

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { createSession, deleteSession, deleteUserSessions } from "../auth/sessions.ts";
import { hit, LIMITS, limitKey, resetLimit } from "../auth/rate-limit.ts";
import { hashPassword, passwordProblem, PASSWORD_MAX } from "../auth/password.ts";
import { consumeCode, issueCode } from "../auth/email-codes.ts";
import { sendCodeEmail } from "../mail/send.ts";
import { exec, one } from "../db/pool.ts";
import { checkLogin, createAccount, EmailTakenError } from "../tenants/accounts.ts";
import { audit } from "../audit.ts";
import { primaryTenantOf, recordActivity } from "../activity.ts";
import { clearSessionCookie, getAuth, readSessionToken, requestInfo, setSessionCookie } from "../auth/context.ts";

export type FormState =
  | { error?: string; notice?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }
  | undefined;

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(190);

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  workspace: z.string().trim().min(1, "Enter a business or workspace name.").max(120),
  email,
  password: z.string().max(PASSWORD_MAX),
  terms: z.literal("on", { error: "Please accept the terms to continue." }),
});

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    out[k] ??= issue.message;
  }
  return out;
}

/** A local path to return to after login; anything else goes to the dashboard. */
function safeNext(raw: FormDataEntryValue | null): string {
  const v = typeof raw === "string" ? raw : "";
  return /^\/app(\/[A-Za-z0-9/_-]*)?(\?[A-Za-z0-9=&_-]*)?$/.test(v) ? v : "/app/overview";
}

export async function signupAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { name: String(form.get("name") ?? ""), workspace: String(form.get("workspace") ?? ""), email: String(form.get("email") ?? "") };
  // Honeypot: a field people never see. Bots fill it; pretend all is well.
  if (String(form.get("company_website") ?? "") !== "") redirect("/login");

  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const pwProblem = passwordProblem(parsed.data.password);
  if (pwProblem) return { fieldErrors: { password: pwProblem }, values };

  const { ip, userAgent } = await requestInfo();
  if (!(await hit(limitKey("signup:ip", ip || "unknown"), LIMITS.signupPerIp))) {
    return { error: "Too many signups from this network. Please try again in an hour.", values };
  }

  let ids;
  try {
    ids = await createAccount({ ...parsed.data, ip });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { fieldErrors: { email: "That email already has an account. Log in instead." }, values };
    }
    throw err;
  }
  const token = await createSession(ids.userId, ids.tenantId, ip, userAgent);
  await setSessionCookie(token);
  await recordActivity({ type: "auth.signed_up", userId: ids.userId, tenantId: ids.tenantId, ip });
  // The code is sent now; if the mail server is down the verify page offers a resend.
  await hit(limitKey("code:user", String(ids.userId)), LIMITS.codeEmailPerUser);
  await sendCodeEmail(parsed.data.email, "verify", await issueCode(ids.userId, "verify"));
  redirect("/verify-email");
}

// ---- Email verification -------------------------------------------------

const codeSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from the email.");

export async function verifyEmailAction(_prev: FormState, form: FormData): Promise<FormState> {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  if (auth.emailVerified) redirect("/app/onboarding");

  const parsed = codeSchema.safeParse(String(form.get("code") ?? "").replace(/\s+/g, ""));
  if (!parsed.success) return { fieldErrors: { code: parsed.error.issues[0].message } };

  const { ip } = await requestInfo();
  if (!(await hit(limitKey("code:check", ip || "unknown"), LIMITS.codeCheckPerIp))) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const result = await consumeCode(auth.userId, "verify", parsed.data);
  if (result !== "ok") {
    // A seller stuck on this step shows up in their activity.
    await recordActivity({ type: "error.shown", userId: auth.userId, tenantId: auth.tenantId, detail: { action: "auth.verify_email", errorCode: result === "wrong" ? "wrong_code" : "code_expired" } });
  }
  if (result === "wrong") return { fieldErrors: { code: "That code isn't right. Check the email and try again." } };
  if (result === "expired") return { error: "That code has expired or was used too many times. Send a new one below." };

  await exec("UPDATE users SET email_verified_at = NOW(3) WHERE id = ? AND email_verified_at IS NULL", [auth.userId]);
  await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "auth.email_verified", ip });
  await recordActivity({ type: "auth.email_verified", userId: auth.userId, tenantId: auth.tenantId, ip, detail: { by: "code" } });
  redirect("/app/onboarding");
}

export async function resendVerifyCodeAction(_prev: FormState): Promise<FormState> {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  if (auth.emailVerified) redirect("/app/onboarding");

  if (!(await hit(limitKey("code:user", String(auth.userId)), LIMITS.codeEmailPerUser))) {
    return { error: "We've sent several codes already. Please wait an hour before asking for another." };
  }
  const sent = await sendCodeEmail(auth.email, "verify", await issueCode(auth.userId, "verify"));
  if (!sent) return { error: "We couldn't send the email just now. Please try again in a few minutes." };
  return { notice: `A new code is on its way to ${auth.email}.` };
}

// ---- Password reset -----------------------------------------------------

export async function forgotPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message }, values };

  const { ip } = await requestInfo();
  if (!(await hit(limitKey("reset:ip", ip || "unknown"), LIMITS.resetPerIp))) {
    return { error: "Too many reset requests from this network. Please try again in an hour.", values };
  }

  // Same answer whether or not the account exists, so this page can't be used
  // to find out who has an account.
  const user = await one<{ id: number }>("SELECT id FROM users WHERE email = ?", [parsed.data]);
  if (user && (await hit(limitKey("code:user", String(user.id)), LIMITS.codeEmailPerUser))) {
    const code = await issueCode(user.id, "reset");
    // Sent after the response, so how long the page takes doesn't give it away either.
    after(async () => {
      await sendCodeEmail(parsed.data, "reset", code);
      await recordActivity({ type: "auth.password_reset_requested", userId: user.id, tenantId: await primaryTenantOf(user.id), ip });
    });
  }
  redirect(`/reset-password?email=${encodeURIComponent(parsed.data)}`);
}

const resetSchema = z.object({ email, code: codeSchema, password: z.string().max(PASSWORD_MAX) });

export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = resetSchema.safeParse({
    email: form.get("email"),
    code: String(form.get("code") ?? "").replace(/\s+/g, ""),
    password: form.get("password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const pwProblem = passwordProblem(parsed.data.password);
  if (pwProblem) return { fieldErrors: { password: pwProblem }, values };

  const { ip } = await requestInfo();
  if (!(await hit(limitKey("code:check", ip || "unknown"), LIMITS.codeCheckPerIp))) {
    return { error: "Too many attempts. Please wait 15 minutes and try again.", values };
  }

  const bad = { error: "That code isn't right, or it has expired. Check the email or ask for a new code.", values };
  const user = await one<{ id: number }>("SELECT id FROM users WHERE email = ?", [parsed.data.email]);
  if (!user) return bad;
  if ((await consumeCode(user.id, "reset", parsed.data.code)) !== "ok") return bad;

  // Receiving the code proves the address too.
  await exec("UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, NOW(3)) WHERE id = ?", [
    await hashPassword(parsed.data.password),
    user.id,
  ]);
  await deleteUserSessions(user.id); // signed out everywhere, including any attacker
  const m = await one<{ tenant_id: number }>("SELECT tenant_id FROM memberships WHERE user_id = ? ORDER BY created_at LIMIT 1", [
    user.id,
  ]);
  if (m) await audit({ tenantId: m.tenant_id, userId: user.id, action: "auth.password_reset", ip });
  await recordActivity({ type: "auth.password_reset", userId: user.id, tenantId: m?.tenant_id ?? null, ip });
  await resetLimit(limitKey("login:email", parsed.data.email));
  redirect("/login?reset=1");
}

const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password.").max(PASSWORD_MAX) });

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const { ip, userAgent } = await requestInfo();
  // Throttle by account as well as by IP: credential stuffing spreads over many IPs.
  const emailKey = limitKey("login:email", parsed.data.email);
  const okIp = await hit(limitKey("login:ip", ip || "unknown"), LIMITS.loginPerIp);
  const okEmail = await hit(emailKey, LIMITS.loginPerEmail);
  if (!okIp || !okEmail) {
    noteFailedSignIn(parsed.data.email, ip, "rate_limited");
    return { error: "Too many login attempts. Please wait 15 minutes and try again.", values };
  }

  const who = await checkLogin(parsed.data.email, parsed.data.password);
  if (!who) {
    noteFailedSignIn(parsed.data.email, ip, "wrong_password");
    return { error: "That email and password don't match an account.", values };
  }

  await resetLimit(emailKey);
  const token = await createSession(who.userId, who.tenantId, ip, userAgent);
  await setSessionCookie(token);
  await audit({ tenantId: who.tenantId, userId: who.userId, action: "auth.login", ip });
  await recordActivity({ type: "auth.signed_in", userId: who.userId, tenantId: who.tenantId, ip });
  redirect(safeNext(form.get("next")));
}

/**
 * A failed sign-in to an existing account, recorded after the response so
 * the page takes as long whether or not the address has an account. Nothing
 * is kept for addresses with no account.
 */
function noteFailedSignIn(email: string, ip: string, reason: "wrong_password" | "rate_limited"): void {
  after(async () => {
    const user = await one<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]).catch(() => null);
    if (!user) return;
    await recordActivity({ type: "auth.sign_in_failed", userId: user.id, tenantId: await primaryTenantOf(user.id), ip, detail: { reason } });
  });
}

export async function logoutAction(): Promise<void> {
  const auth = await getAuth();
  await deleteSession(await readSessionToken());
  await clearSessionCookie();
  if (auth) {
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "auth.logout", ip });
    await recordActivity({ type: "auth.signed_out", userId: auth.userId, tenantId: auth.tenantId, ip });
  }
  redirect("/login");
}
