// The signed-in user and workspace for this request. Every page, server
// action and route handler under /app gets the tenant id from here, never
// from a form field, URL or request body.

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { lookupSession, roleAtLeast, SESSION_MAX_DAYS, type Role, type SessionInfo } from "./sessions.ts";
import { site } from "../../lib/site.ts";

const PROD = process.env.NODE_ENV === "production";
// __Host- makes the browser refuse the cookie unless it is Secure, path=/ and
// has no Domain, so a sibling subdomain can't set or read it.
export const SESSION_COOKIE = PROD ? "__Host-ss_session" : "ss_session";

/** The current session, looked up once per request. */
export const getAuth = cache(async (): Promise<SessionInfo | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return lookupSession(token);
});

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** For pages: the session, or a redirect to /login. */
export async function requireAuth(min: Role = "member"): Promise<SessionInfo> {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  // The dashboard opens only once the account's email is confirmed.
  if (!auth.emailVerified) redirect("/verify-email");
  if (!roleAtLeast(auth.role, min)) throw new ForbiddenError();
  return auth;
}

/**
 * For server actions: the session, or an error the form can show. Actions are
 * public POST endpoints, so each one checks this itself; the page that
 * rendered the form being protected is not enough.
 */
export async function authForAction(min: Role = "member"): Promise<SessionInfo> {
  const auth = await getAuth();
  if (!auth) throw new ForbiddenError("Your session has ended. Please log in again.");
  if (!auth.emailVerified) throw new ForbiddenError("Please confirm your email address first.");
  if (!roleAtLeast(auth.role, min)) throw new ForbiddenError(`Only a workspace ${min} or owner can do that.`);
  return auth;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_DAYS * 24 * 3600,
  });
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Client IP and user agent. Hostinger's front proxy appends the real client
 * address to X-Forwarded-For, so the right-most entry is the one to trust; the
 * left-most can be anything the client sent.
 */
export async function requestInfo(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  const xff = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ip = h.get("x-real-ip")?.trim() || xff[xff.length - 1] || "";
  return { ip: ip.slice(0, 45), userAgent: (h.get("user-agent") ?? "").slice(0, 255) };
}

/** Base URL of this site, for links we hand to Stripe and Amazon. */
export function appUrl(): string {
  return (process.env.APP_URL || site.appUrl).replace(/\/+$/, "");
}
