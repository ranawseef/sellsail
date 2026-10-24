"use server";

// Signup, login and logout. Server actions are public POST endpoints: Next
// checks the Origin header against the Host, and every input is validated
// here with zod before it touches the database.

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession } from "../auth/sessions.ts";
import { hit, LIMITS, limitKey, resetLimit } from "../auth/rate-limit.ts";
import { passwordProblem, PASSWORD_MAX } from "../auth/password.ts";
import { checkLogin, createAccount, EmailTakenError } from "../tenants/accounts.ts";
import { audit } from "../audit.ts";
import { clearSessionCookie, getAuth, readSessionToken, requestInfo, setSessionCookie } from "../auth/context.ts";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

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
  redirect("/app/onboarding");
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
    return { error: "Too many login attempts. Please wait 15 minutes and try again.", values };
  }

  const who = await checkLogin(parsed.data.email, parsed.data.password);
  if (!who) return { error: "That email and password don't match an account.", values };

  await resetLimit(emailKey);
  const token = await createSession(who.userId, who.tenantId, ip, userAgent);
  await setSessionCookie(token);
  await audit({ tenantId: who.tenantId, userId: who.userId, action: "auth.login", ip });
  redirect(safeNext(form.get("next")));
}

export async function logoutAction(): Promise<void> {
  const auth = await getAuth();
  await deleteSession(await readSessionToken());
  await clearSessionCookie();
  if (auth) {
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "auth.logout", ip });
  }
  redirect("/login");
}
