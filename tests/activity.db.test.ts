// Customer activity against a real database: what a row holds, retention,
// the hourly job summaries, job milestones, and deletion. Fake data only.

import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { resetDatabase, skipDb } from "./helpers/db.ts";
import { closePool, exec, one, q } from "../src/server/db/pool.ts";
import { createAccount } from "../src/server/tenants/accounts.ts";
import { maintenance } from "../src/server/jobs/scheduler.ts";
import { noteJobRun, recordActivity } from "../src/server/activity.ts";

let n = 0;
let tenantId = 0;
let userId = 0;

before(async () => {
  if (!skipDb) await resetDatabase();
});
after(async () => {
  if (!skipDb) await closePool();
});
beforeEach(async () => {
  if (skipDb) return;
  n++;
  ({ tenantId, userId } = await createAccount({ email: `a${n}@example.com`, name: "A", password: "a long password", workspace: `A${n}`, ip: "" }));
});

const rows = (type: string, t = tenantId) => q<{ id: number; user_id: number | null; detail: string; ip: string | null; created_at: Date }>(
  "SELECT id, user_id, detail, ip, created_at FROM user_activity WHERE tenant_id = ? AND type = ? ORDER BY id",
  [t, type],
);

test("a row holds the user, workspace, type and a cleaned detail; IP only for sign-in events", { skip: skipDb }, async () => {
  assert.equal(await recordActivity({ type: "auth.signed_in", userId, tenantId, ip: "203.0.113.9" }), true);
  assert.equal(
    await recordActivity({
      type: "onbuy.test_failed",
      userId,
      tenantId,
      ip: "203.0.113.9",
      detail: { secretKey: "FAKE-SECRET", message: "OnBuy refused key sk-FAKE-000000000000000000000000000000000000" },
    }),
    true,
  );
  const [signin] = await rows("auth.signed_in");
  assert.equal(signin.user_id, userId);
  assert.equal(signin.ip, "203.0.113.9");
  const [failed] = await rows("onbuy.test_failed");
  assert.equal(failed.ip, null, "IP is kept only where sign-in already records it");
  assert.ok(!failed.detail.includes("FAKE-SECRET") && !failed.detail.includes("sk-FAKE"));
  assert.match(failed.detail, /OnBuy refused key \[redacted\]/);
});

test("a write the database refuses is logged, not thrown", { skip: skipDb }, async () => {
  const errors = console.error;
  console.error = () => {};
  try {
    assert.equal(await recordActivity({ type: "auth.signed_in", userId: 999_999, tenantId: 999_999 }), false);
  } finally {
    console.error = errors;
  }
});

test("retention: rows older than 12 months go in the hourly maintenance, newer ones stay", { skip: skipDb }, async () => {
  await exec("INSERT INTO user_activity (tenant_id, user_id, type, created_at) VALUES (?, ?, 'auth.signed_in', NOW(3) - INTERVAL 13 MONTH)", [tenantId, userId]);
  await exec("INSERT INTO user_activity (tenant_id, user_id, type, created_at) VALUES (?, ?, 'auth.signed_in', NOW(3) - INTERVAL 12 MONTH - INTERVAL 1 DAY)", [tenantId, userId]);
  await exec("INSERT INTO user_activity (tenant_id, user_id, type, created_at) VALUES (?, ?, 'auth.signed_in', NOW(3) - INTERVAL 11 MONTH)", [tenantId, userId]);
  await recordActivity({ type: "auth.signed_in", userId, tenantId });
  await maintenance();
  const left = await rows("auth.signed_in");
  assert.equal(left.length, 2);
  assert.ok(left.every((r) => Date.now() - new Date(r.created_at).getTime() < 340 * 86400_000));
});

test("hourly summaries: one row per workspace, kind and hour with work, never twice", { skip: skipDb }, async () => {
  const job = await one<{ id: number }>("SELECT id FROM jobs WHERE tenant_id = ? AND kind = 'reprice'", [tenantId]);
  const run = (minsAgo: number, ok: number, c: [number, number, number, number]) =>
    exec(
      `INSERT INTO job_runs (job_id, tenant_id, started_at, finished_at, ok, msg, n_checked, n_changed, n_skipped, n_errors)
       VALUES (?, ?, ?, ?, ?, 'x', ?, ?, ?, ?)`,
      [job!.id, tenantId, new Date(lastHour.getTime() + minsAgo * 60_000), new Date(lastHour.getTime() + minsAgo * 60_000 + 1000), ok, ...c],
    );
  // Two runs with work and one failure in the previous clock hour; idle runs in the hour before.
  const lastHour = new Date(Math.floor(Date.now() / 3600_000) * 3600_000 - 3600_000);
  await run(5, 1, [200, 12, 3, 0]);
  await run(20, 1, [150, 4, 0, 1]);
  await run(40, 0, [0, 0, 0, 0]);
  await run(-30, 1, [0, 0, 0, 0]); // the hour before: nothing done, no summary

  await maintenance();
  await maintenance(); // a second process, or the next hour: no duplicate
  const sums = await rows("reprice.hourly");
  assert.equal(sums.length, 1);
  assert.deepEqual(JSON.parse(sums[0].detail), { runs: 3, failedRuns: 1, checked: 350, changed: 16, skipped: 3, errors: 1 });
  assert.equal(new Date(sums[0].created_at).getTime(), lastHour.getTime() + 3600_000, "stamped with the hour's end");
  assert.equal(sums[0].user_id, null);
});

test("job runs note when repricing starts failing, recovers, and the first success and price change", { skip: skipDb }, async () => {
  const base = { tenantId, kind: "reprice", msg: "Read 20 listings: 2 changed, 0 out of stock" };
  await noteJobRun({ ...base, ok: false, msg: "Amazon call failed: timeout", prevOk: true });
  await noteJobRun({ ...base, ok: false, msg: "Amazon call failed: timeout", prevOk: false }); // still failing: not again
  await noteJobRun({ ...base, ok: true, prevOk: false, stats: { checked: 20, changed: 2, skipped: 0, errors: 0, priceChanged: 2 } });
  await noteJobRun({ ...base, ok: true, prevOk: true, stats: { checked: 20, changed: 5, skipped: 0, errors: 0, priceChanged: 5 } });
  assert.equal((await rows("reprice.failing")).length, 1);
  assert.equal((await rows("reprice.recovered")).length, 1);
  assert.equal((await rows("reprice.first_success")).length, 1);
  assert.equal((await rows("reprice.first_price_change")).length, 1);
  const t = await one<{ first_reprice_at: Date | null; first_price_change_at: Date | null }>("SELECT first_reprice_at, first_price_change_at FROM tenants WHERE id = ?", [tenantId]);
  assert.ok(t?.first_reprice_at && t.first_price_change_at);

  // OnBuy sync has its own failing / recovered pair and no milestones.
  await noteJobRun({ tenantId, kind: "push", ok: false, msg: "OnBuy rate limit reached", prevOk: null });
  assert.equal((await rows("stock_sync.failing")).length, 1);
});

test("free access that ends is noted before the sweep clears it", { skip: skipDb }, async () => {
  await exec("UPDATE tenants SET plan = 'growth', plan_status = 'active', comp_until = NOW(3) - INTERVAL 1 MINUTE WHERE id = ?", [tenantId]);
  await maintenance();
  const ended = await rows("billing.free_access_ended");
  assert.equal(ended.length, 1);
  assert.deepEqual(JSON.parse(ended[0].detail), { plan: "growth" });
  assert.equal((await one<{ plan_status: string }>("SELECT plan_status FROM tenants WHERE id = ?", [tenantId]))?.plan_status, "expired");
});
