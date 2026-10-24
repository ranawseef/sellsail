// Accounts, sessions and rate limits against a real database.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { resetDatabase, skipDb } from "./helpers/db.ts";
import { closePool, exec, one, q } from "../src/server/db/pool.ts";
import { checkLogin, createAccount, EmailTakenError } from "../src/server/tenants/accounts.ts";
import { createSession, deleteSession, hashToken, lookupSession } from "../src/server/auth/sessions.ts";
import { hit, limitKey } from "../src/server/auth/rate-limit.ts";
import { DEFAULT_BAND_LIMITS } from "../src/lib/pricing.ts";

before(async () => {
  if (!skipDb) await resetDatabase();
});
after(async () => {
  if (!skipDb) await closePool();
});

test("signup creates a trial workspace with owner, settings and default bands", { skip: skipDb }, async () => {
  const { userId, tenantId } = await createAccount({
    email: "  Seller@Example.com ",
    name: "Sam",
    password: "a long password",
    workspace: "Sam's Shop",
    ip: "1.2.3.4",
  });
  const user = await one<{ email: string; password_hash: string }>("SELECT email, password_hash FROM users WHERE id = ?", [userId]);
  assert.equal(user?.email, "seller@example.com");
  assert.ok(user?.password_hash.startsWith("scrypt$"));

  const t = await one<{ plan: string; plan_status: string; days: number }>(
    "SELECT plan, plan_status, TIMESTAMPDIFF(HOUR, NOW(3), trial_ends_at) / 24 AS days FROM tenants WHERE id = ?",
    [tenantId],
  );
  assert.equal(t?.plan, "trial");
  assert.equal(t?.plan_status, "trialing");
  assert.ok(Number(t?.days) > 13.9 && Number(t?.days) <= 14);

  const m = await one<{ role: string }>("SELECT role FROM memberships WHERE tenant_id = ? AND user_id = ?", [tenantId, userId]);
  assert.equal(m?.role, "owner");
  const bands = await q<{ up_to: number }>("SELECT up_to FROM pricing_bands WHERE tenant_id = ? ORDER BY up_to", [tenantId]);
  assert.deepEqual(bands.map((b) => Number(b.up_to)), [...DEFAULT_BAND_LIMITS]);
  assert.ok(await one("SELECT 1 FROM repricer_settings WHERE tenant_id = ?", [tenantId]));
  assert.ok(await one("SELECT 1 FROM audit_log WHERE tenant_id = ? AND action = 'account.signup'", [tenantId]));

  await assert.rejects(
    createAccount({ email: "seller@example.com", name: "X", password: "a long password", workspace: "Y", ip: "" }),
    EmailTakenError,
  );
  // The failed signup left nothing behind.
  const tenants = await one<{ n: number }>("SELECT COUNT(*) AS n FROM tenants");
  assert.equal(Number(tenants?.n), 1);
});

test("login checks the password and ignores email case", { skip: skipDb }, async () => {
  assert.ok(await checkLogin("SELLER@example.com", "a long password"));
  assert.equal(await checkLogin("seller@example.com", "wrong password"), null);
  assert.equal(await checkLogin("nobody@example.com", "a long password"), null);
});

test("sessions store only a hash, resolve the workspace, and end on logout", { skip: skipDb }, async () => {
  const who = await checkLogin("seller@example.com", "a long password");
  assert.ok(who);
  const token = await createSession(who.userId, who.tenantId, "1.2.3.4", "test");
  assert.equal(await one("SELECT 1 FROM sessions WHERE id = ?", [token]), null);
  assert.ok(await one("SELECT 1 FROM sessions WHERE id = ?", [hashToken(token)]));

  const s = await lookupSession(token);
  assert.equal(s?.tenantId, who.tenantId);
  assert.equal(s?.role, "owner");
  assert.equal(await lookupSession(token + "x"), null);
  assert.equal(await lookupSession(undefined), null);

  // Expired sessions don't count.
  await exec("UPDATE sessions SET expires_at = NOW(3) - INTERVAL 1 SECOND WHERE id = ?", [hashToken(token)]);
  assert.equal(await lookupSession(token), null);
  await exec("UPDATE sessions SET expires_at = NOW(3) + INTERVAL 1 DAY WHERE id = ?", [hashToken(token)]);

  await deleteSession(token);
  assert.equal(await lookupSession(token), null);
});

test("removing a membership takes the workspace away on the next request", { skip: skipDb }, async () => {
  const other = await createAccount({ email: "two@example.com", name: "Two", password: "a long password", workspace: "Two", ip: "" });
  const first = await checkLogin("seller@example.com", "a long password");
  assert.ok(first);
  // Seller is invited into workspace Two as a member, and the session points there.
  await exec("INSERT INTO memberships (tenant_id, user_id, role) VALUES (?, ?, 'member')", [other.tenantId, first.userId]);
  const token = await createSession(first.userId, other.tenantId, "", "");
  assert.equal((await lookupSession(token))?.role, "member");

  await exec("DELETE FROM memberships WHERE tenant_id = ? AND user_id = ?", [other.tenantId, first.userId]);
  const s = await lookupSession(token);
  assert.equal(s?.tenantId, first.tenantId); // back to their own workspace, never Two
});

test("rate limit counts per key and resets after the window", { skip: skipDb }, async () => {
  const key = limitKey("login:email", "Someone@Example.com");
  assert.ok(!key.includes("someone")); // emails are hashed
  const limit = { max: 3, windowSec: 60 };
  assert.equal(await hit(key, limit), true);
  assert.equal(await hit(key, limit), true);
  assert.equal(await hit(key, limit), true);
  assert.equal(await hit(key, limit), false);
  await exec("UPDATE rate_limits SET window_start = NOW(3) - INTERVAL 61 SECOND WHERE k = ?", [key]);
  assert.equal(await hit(key, limit), true);
  assert.equal(Number((await one<{ hits: number }>("SELECT hits FROM rate_limits WHERE k = ?", [key]))?.hits), 1);
});
