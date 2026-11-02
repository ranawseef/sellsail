// Creating users and workspaces, and checking logins.

import { DEFAULT_BANDS } from "../../lib/pricing.ts";
import { TRIAL_DAYS } from "../../config/plans.ts";
import { exec, one, tx } from "../db/pool.ts";
import { audit } from "../audit.ts";
import { dummyPasswordHash, hashPassword, verifyPassword } from "../auth/password.ts";
import { ensureRepriceJob } from "../jobs/registry.ts";

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class EmailTakenError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailTakenError";
  }
}

export type NewAccount = { email: string; name: string; password: string; workspace: string; ip: string };

/**
 * Signup: the user, their workspace (14-day trial), owner membership, default
 * repricer settings and pricing bands, all or nothing.
 */
export async function createAccount(a: NewAccount): Promise<{ userId: number; tenantId: number }> {
  const email = normaliseEmail(a.email);
  const passwordHash = await hashPassword(a.password);
  try {
    return await tx(async (t) => {
      const u = await t.exec("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)", [
        email,
        a.name.trim(),
        passwordHash,
      ]);
      const userId = u.insertId;
      const tn = await t.exec(
        "INSERT INTO tenants (name, plan, plan_status, trial_ends_at) VALUES (?, 'trial', 'trialing', NOW(3) + INTERVAL ? DAY)",
        [a.workspace.trim(), TRIAL_DAYS],
      );
      const tenantId = tn.insertId;
      await t.exec("INSERT INTO memberships (tenant_id, user_id, role) VALUES (?, ?, 'owner')", [tenantId, userId]);
      await t.exec("INSERT INTO repricer_settings (tenant_id) VALUES (?)", [tenantId]);
      // Amazon prices come from SellSail's own keys, so repricing needs no setup.
      await ensureRepriceJob(tenantId, t);
      for (const b of DEFAULT_BANDS) {
        await t.exec(
          "INSERT INTO pricing_bands (tenant_id, up_to, profit_pct, fixed_profit, min_profit) VALUES (?, ?, ?, ?, ?)",
          [tenantId, b.upTo, b.profitPct, b.fixedProfit, b.minProfit],
        );
      }
      await audit({ tenantId, userId, action: "account.signup", detail: `Workspace created, ${TRIAL_DAYS}-day trial`, ip: a.ip }, t);
      return { userId, tenantId };
    });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") throw new EmailTakenError();
    throw err;
  }
}

/** The user and their first workspace when the password is right, else null. */
export async function checkLogin(email: string, password: string): Promise<{ userId: number; tenantId: number } | null> {
  const user = await one<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = ?", [
    normaliseEmail(email),
  ]);
  // Hash even when the email is unknown so response time doesn't reveal it.
  const ok = await verifyPassword(password, user?.password_hash ?? (await dummyPasswordHash()));
  if (!user || !ok) return null;

  const m = await one<{ tenant_id: number }>(
    "SELECT tenant_id FROM memberships WHERE user_id = ? ORDER BY created_at LIMIT 1",
    [user.id],
  );
  if (!m) return null;
  await exec("UPDATE users SET last_login_at = NOW(3) WHERE id = ?", [user.id]);
  return { userId: user.id, tenantId: m.tenant_id };
}

/**
 * Closes a workspace for good: everything in it (listings, keys, tokens,
 * price history, logs, activity: every seller table cascades from tenants),
 * and each member who belongs to no other workspace, with that user's
 * sessions and activity (they cascade from users).
 */
export async function deleteWorkspace(tenantId: number): Promise<void> {
  await tx(async (c) => {
    const members = await c.q<{ user_id: number }>("SELECT user_id FROM memberships WHERE tenant_id = ?", [tenantId]);
    await c.exec("DELETE FROM tenants WHERE id = ?", [tenantId]);
    if (members.length) {
      await c.exec("DELETE FROM users WHERE id IN (?) AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = users.id)", [members.map((m) => m.user_id)]);
    }
  });
}

export async function changePassword(userId: number, current: string, next: string): Promise<boolean> {
  const user = await one<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [userId]);
  if (!user || !(await verifyPassword(current, user.password_hash))) return false;
  const hash = await hashPassword(next);
  await exec("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);
  return true;
}
