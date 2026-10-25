// Sign-in for SellSail staff at /admin. Separate from seller accounts: an
// admin is an email address listed in ADMIN_EMAILS (default hello@sellsail.io),
// proven by a 6-digit code sent to that inbox. No password to leak or reuse.
//
// Codes: HMAC only, 10 minutes, 5 wrong tries, one use.
// Sessions: random token in a __Host- cookie, sha256 in admin_sessions,
// 12 hours from sign-in with no extension. Removing an address from
// ADMIN_EMAILS locks it out on its next request.

import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { exec, one } from "../db/pool.ts";

const PROD = process.env.NODE_ENV === "production";
export const ADMIN_COOKIE = PROD ? "__Host-ss_admin" : "ss_admin";
export const ADMIN_SESSION_HOURS = 12;
export const ADMIN_CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim() || "hello@sellsail.io";
  return raw
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

function codeHash(email: string, code: string): string {
  const key = process.env.APP_ENCRYPTION_KEY || "sellsail-dev-only";
  return createHmac("sha256", key).update(`admin:${email}:${code}`).digest("hex");
}

const tokenHash = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");

/** A fresh code for an admin address (older ones retired). Only for the email. */
export async function issueAdminCode(email: string): Promise<string> {
  const e = email.trim().toLowerCase();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await exec("UPDATE admin_codes SET used_at = NOW(3) WHERE email = ? AND used_at IS NULL", [e]);
  await exec("INSERT INTO admin_codes (email, code_hash, expires_at) VALUES (?, ?, NOW(3) + INTERVAL ? MINUTE)", [e, codeHash(e, code), ADMIN_CODE_TTL_MIN]);
  return code;
}

export async function consumeAdminCode(email: string, code: string): Promise<"ok" | "wrong" | "expired"> {
  const e = email.trim().toLowerCase();
  const clean = code.replace(/\s+/g, "");
  const row = await one<{ id: number; code_hash: string; attempts: number; expired: number }>(
    `SELECT id, code_hash, attempts, expires_at <= NOW(3) AS expired FROM admin_codes
      WHERE email = ? AND used_at IS NULL ORDER BY id DESC LIMIT 1`,
    [e],
  );
  if (!row || row.expired || row.attempts >= MAX_ATTEMPTS) return "expired";
  const want = Buffer.from(row.code_hash, "hex");
  const got = Buffer.from(codeHash(e, /^\d{6}$/.test(clean) ? clean : "x"), "hex");
  if (!/^\d{6}$/.test(clean) || want.length !== got.length || !timingSafeEqual(want, got)) {
    await exec("UPDATE admin_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return "wrong";
  }
  const res = await exec("UPDATE admin_codes SET used_at = NOW(3) WHERE id = ? AND used_at IS NULL", [row.id]);
  return res.affectedRows === 1 ? "ok" : "expired";
}

export async function startAdminSession(email: string, ip: string, userAgent: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await exec(
    "INSERT INTO admin_sessions (id, email, expires_at, ip, user_agent) VALUES (?, ?, NOW(3) + INTERVAL ? HOUR, ?, ?)",
    [tokenHash(token), email.trim().toLowerCase(), ADMIN_SESSION_HOURS, ip.slice(0, 45), userAgent.slice(0, 255)],
  );
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, secure: PROD, sameSite: "strict", path: "/", maxAge: ADMIN_SESSION_HOURS * 3600 });
}

export type AdminSession = { id: string; email: string; createdAt: Date; expiresAt: Date };

export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = await one<{ id: string; email: string; created_at: Date; expires_at: Date; last_seen_at: Date }>(
    "SELECT id, email, created_at, expires_at, last_seen_at FROM admin_sessions WHERE id = ? AND expires_at > NOW(3)",
    [tokenHash(token)],
  );
  if (!row || !isAdminEmail(row.email)) return null;
  if (Date.now() - new Date(row.last_seen_at).getTime() > 300_000) {
    await exec("UPDATE admin_sessions SET last_seen_at = NOW(3) WHERE id = ?", [row.id]);
  }
  return { id: row.id, email: row.email, createdAt: row.created_at, expiresAt: row.expires_at };
});

/** For admin pages: the session, or off to /admin/login. */
export async function requireAdmin(): Promise<AdminSession> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export class AdminForbiddenError extends Error {
  constructor() {
    super("Your admin session has ended. Sign in again.");
    this.name = "AdminForbiddenError";
  }
}

/** For admin actions, which are public POST endpoints like any other. */
export async function adminForAction(): Promise<AdminSession> {
  const a = await getAdmin();
  if (!a) throw new AdminForbiddenError();
  return a;
}

export async function endAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) await exec("DELETE FROM admin_sessions WHERE id = ?", [tokenHash(token)]);
  jar.delete(ADMIN_COOKIE);
}

export async function adminAudit(email: string, action: string, tenantId: number | null, detail: string, ip: string): Promise<void> {
  await exec("INSERT INTO admin_audit (email, action, tenant_id, detail, ip) VALUES (?, ?, ?, ?, ?)", [
    email,
    action.slice(0, 64),
    tenantId,
    detail.slice(0, 500),
    ip.slice(0, 45),
  ]);
}
