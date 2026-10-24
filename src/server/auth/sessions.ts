// Login sessions, stored in the database.
//
// The browser holds a random 32-byte token. The database holds only its
// sha256, so a leaked sessions table can't be replayed as cookies. Logging out
// deletes the row, which ends the session everywhere at once.
//
// Expiry slides: each use (at most once an hour) pushes expires_at to 30 days
// ahead, but never past 90 days after login.

import { createHash, randomBytes } from "node:crypto";
import { exec, one, q } from "../db/pool.ts";

export const SESSION_IDLE_DAYS = 30;
export const SESSION_MAX_DAYS = 90;

export type Role = "owner" | "admin" | "member";
const RANK: Record<Role, number> = { member: 1, admin: 2, owner: 3 };
export function roleAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

export type SessionInfo = {
  sessionId: string;
  userId: number;
  email: string;
  name: string;
  tenantId: number;
  role: Role;
  tenantName: string;
  plan: string;
  planStatus: string;
  trialEndsAt: Date | null;
  paused: boolean;
  onboardedAt: Date | null;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Creates a session and returns the token for the cookie (never stored). */
export async function createSession(userId: number, tenantId: number, ip: string, userAgent: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await exec(
    `INSERT INTO sessions (id, user_id, tenant_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, NOW(3) + INTERVAL ? DAY, ?, ?)`,
    [hashToken(token), userId, tenantId, SESSION_IDLE_DAYS, ip.slice(0, 45), userAgent.slice(0, 255)],
  );
  return token;
}

type Row = {
  id: string;
  user_id: number;
  tenant_id: number | null;
  last_seen_at: Date;
  email: string;
  name: string;
  role: Role | null;
  m_tenant_id: number | null;
  tenant_name: string | null;
  plan: string | null;
  plan_status: string | null;
  trial_ends_at: Date | null;
  paused: number | null;
  onboarded_at: Date | null;
};

/**
 * The session for a cookie token, or null. The workspace and role always come
 * from the memberships table, so a user removed from a workspace loses access
 * on their next request rather than when the session expires.
 */
export async function lookupSession(token: string | undefined | null): Promise<SessionInfo | null> {
  if (!token || token.length > 100) return null;
  const id = hashToken(token);
  const row = await one<Row>(
    `SELECT s.id, s.user_id, s.tenant_id, s.last_seen_at, u.email, u.name,
            m.role, m.tenant_id AS m_tenant_id, t.name AS tenant_name, t.plan, t.plan_status,
            t.trial_ends_at, t.paused, t.onboarded_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN memberships m ON m.user_id = s.user_id AND m.tenant_id = s.tenant_id
       LEFT JOIN tenants t ON t.id = m.tenant_id
      WHERE s.id = ? AND s.expires_at > NOW(3)`,
    [id],
  );
  if (!row) return null;

  if (row.m_tenant_id === null) {
    // No longer a member of the session's workspace: fall back to another one.
    const other = await one<{ tenant_id: number }>(
      "SELECT tenant_id FROM memberships WHERE user_id = ? ORDER BY created_at LIMIT 1",
      [row.user_id],
    );
    if (!other) {
      await exec("DELETE FROM sessions WHERE id = ?", [id]);
      return null;
    }
    await exec("UPDATE sessions SET tenant_id = ? WHERE id = ?", [other.tenant_id, id]);
    return lookupSession(token);
  }

  if (Date.now() - new Date(row.last_seen_at).getTime() > 3600_000) {
    await exec(
      `UPDATE sessions
          SET last_seen_at = NOW(3),
              expires_at = LEAST(NOW(3) + INTERVAL ? DAY, created_at + INTERVAL ? DAY)
        WHERE id = ?`,
      [SESSION_IDLE_DAYS, SESSION_MAX_DAYS, id],
    );
  }

  return {
    sessionId: id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    tenantId: row.m_tenant_id,
    role: (row.role ?? "member") as Role,
    tenantName: row.tenant_name ?? "",
    plan: row.plan ?? "trial",
    planStatus: row.plan_status ?? "trialing",
    trialEndsAt: row.trial_ends_at,
    paused: Boolean(row.paused),
    onboardedAt: row.onboarded_at,
  };
}

export async function deleteSession(token: string | undefined | null): Promise<void> {
  if (!token) return;
  await exec("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
}

/** Ends every session of a user, e.g. after a password change. */
export async function deleteUserSessions(userId: number, exceptSessionId?: string): Promise<void> {
  await exec("DELETE FROM sessions WHERE user_id = ? AND id <> ?", [userId, exceptSessionId ?? ""]);
}

export async function listUserSessions(userId: number) {
  return q<{ id: string; created_at: Date; last_seen_at: Date; ip: string; user_agent: string }>(
    "SELECT id, created_at, last_seen_at, ip, user_agent FROM sessions WHERE user_id = ? AND expires_at > NOW(3) ORDER BY last_seen_at DESC LIMIT 20",
    [userId],
  );
}
