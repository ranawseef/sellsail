// The scheduler and the reprice / push / import jobs against a real database.
// Only the network edge (routes, tokens, OnBuy and Amazon calls) is faked; all
// SQL runs for real, including the shared Amazon app pool's slot reservations.

import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { resetDatabase, skipDb } from "./helpers/db.ts";
import { closePool, exec, one, q } from "../src/server/db/pool.ts";
import { createAccount } from "../src/server/tenants/accounts.ts";
import { claim, dueJobs, execute } from "../src/server/jobs/scheduler.ts";
import { ensureJob, REPRICE_TARGET } from "../src/server/jobs/registry.ts";
import { pushDeps } from "../src/server/jobs/push.ts";
import { repriceDeps } from "../src/server/jobs/reprice.ts";
import { importDeps, newImportState } from "../src/server/jobs/import.ts";
import { getRepriceConfig } from "../src/server/repos/pricing.ts";
import { marketplacePrice } from "../src/lib/pricing.ts";
import { DIRECT, type EgressResponse } from "../src/server/net/egress.ts";

// SellSail's own Amazon key set, as the pool reads it from env.
process.env.SPAPI_1_CLIENT_ID = "amzn1.application-oa2-client.test";
process.env.SPAPI_1_CLIENT_SECRET = "test-secret";
process.env.SPAPI_1_REFRESH_TOKEN = "Atzr|test-refresh-token";
const tokens = { get: async () => "t", renew: async () => "t2" };
const response = (status: number, json: unknown): EgressResponse => ({ status, json, text: JSON.stringify(json), headers: new Headers() });

let tenantId = 0;
let onbuyId = 0;
let n = 0;

before(async () => {
  if (skipDb) return;
  await resetDatabase();
  pushDeps.routeForTenant = async () => ({ route: DIRECT, reason: "" });
  pushDeps.onbuyTokens = () => tokens;
  repriceDeps.amazonAppToken = async () => "amz";
  importDeps.routeForTenant = async () => ({ route: DIRECT, reason: "" });
  importDeps.onbuyTokens = () => tokens;
});
after(async () => {
  if (!skipDb) await closePool();
});

beforeEach(async () => {
  if (skipDb) return;
  n++;
  ({ tenantId } = await createAccount({ email: `s${n}@example.com`, name: "S", password: "a long password", workspace: `W${n}`, ip: "" }));
  onbuyId = (
    await exec("INSERT INTO marketplace_accounts (tenant_id, marketplace, credentials_enc, status) VALUES (?, 'onbuy', 'x', 'connected')", [tenantId])
  ).insertId;
  // A fast pace for the shared app, so tests don't wait 10 s per batch.
  await exec(
    `INSERT INTO amazon_apps (slot, rate_interval_ms, next_allowed_at) VALUES (1, 20, NOW(3))
     ON DUPLICATE KEY UPDATE rate_interval_ms = 20, next_allowed_at = NOW(3), status = 'untested'`,
  );
});

async function addProduct(sku: string, p: { price?: number | null; stock?: number | null; pushedPrice?: number | null; pushedStock?: number | null; sourcePrice?: number | null; pricedHoursAgo?: number } = {}) {
  const res = await exec(
    `INSERT INTO products (tenant_id, marketplace, sku, source, source_ref, price, stock, pushed_price, pushed_stock, source_price, priced_at)
     VALUES (?, 'onbuy', ?, 'amazon', ?, ?, ?, ?, ?, ?, NOW(3) - INTERVAL ? HOUR)`,
    [
      tenantId,
      sku,
      sku.replace(/^SK/, ""),
      p.price ?? null,
      p.stock ?? null,
      p.pushedPrice ?? null,
      p.pushedStock ?? null,
      p.sourcePrice ?? null,
      p.pricedHoursAgo ?? 1,
    ],
  );
  return res.insertId;
}

async function runJob(kind: "push" | "reprice" | "import", targetId: number) {
  await exec("UPDATE jobs SET next_run_at = NOW(3) - INTERVAL 1 SECOND WHERE tenant_id = ?", [tenantId]);
  const job = (await dueJobs(50)).find((j) => j.tenant_id === tenantId && j.kind === kind && j.target_id === targetId);
  assert.ok(job, `${kind} job should be due`);
  assert.ok(await claim(job.id, "test-owner"));
  return execute(job, "test", "test-owner", 60_000);
}

const product = (sku: string) =>
  one<{ price: number; stock: number; pushed_price: number | null; pushed_stock: number | null; needs_push: number; push_error: string | null; push_attempts: number; source_error: string | null; source_fails: number }>(
    "SELECT price, stock, pushed_price, pushed_stock, needs_push, push_error, push_attempts, source_error, source_fails FROM products WHERE tenant_id = ? AND sku = ?",
    [tenantId, sku],
  );

test("only one worker can claim a job, and paused or lapsed workspaces are skipped", { skip: skipDb }, async () => {
  await ensureJob(tenantId, "push", onbuyId);
  const job = (await dueJobs(50)).find((j) => j.tenant_id === tenantId);
  assert.ok(job);
  assert.equal(await claim(job.id, "w1"), true);
  assert.equal(await claim(job.id, "w2"), false);
  assert.ok(!(await dueJobs(50)).some((j) => j.id === job.id)); // leased

  // An expired lease (crashed worker) frees the job.
  await exec("UPDATE jobs SET lease_until = NOW(3) - INTERVAL 1 SECOND WHERE id = ?", [job.id]);
  assert.ok((await dueJobs(50)).some((j) => j.id === job.id));

  await exec("UPDATE tenants SET paused = 1 WHERE id = ?", [tenantId]);
  assert.ok(!(await dueJobs(50)).some((j) => j.tenant_id === tenantId));
  await exec("UPDATE tenants SET paused = 0, trial_ends_at = NOW(3) - INTERVAL 1 DAY WHERE id = ?", [tenantId]);
  assert.ok(!(await dueJobs(50)).some((j) => j.tenant_id === tenantId));
  await exec("UPDATE tenants SET plan_status = 'active' WHERE id = ?", [tenantId]);
  assert.ok((await dueJobs(50)).some((j) => j.tenant_id === tenantId));
});

test("push records only confirmed SKUs, archives dead ones, keeps mid-push changes pending", { skip: skipDb }, async () => {
  await ensureJob(tenantId, "push", onbuyId);
  await addProduct("SKA000000001", { price: 10, stock: 3, pushedPrice: 9, pushedStock: 3 });
  await addProduct("SKA000000002", { price: 11, stock: 3 });
  await addProduct("SKA000000003", { price: 0.01, stock: 3 });
  await addProduct("SKA000000004", { price: 12, stock: 0 });
  await addProduct("SKA000000005", { price: 5, stock: 3, pushedPrice: 5, pushedStock: 3 }); // already in sync

  const calls: string[][] = [];
  pushDeps.updateListingsBySku = async (_p, _t, updates) => {
    calls.push(updates.map((u) => u.sku));
    // The repricer changes SKU 1 while the request is in flight.
    await exec("UPDATE products SET price = 10.5 WHERE tenant_id = ? AND sku = 'SKA000000001'", [tenantId]);
    return response(200, {
      success: true,
      results: [
        { sku: "SKA000000001", product_listing_id: "1" },
        { sku: "SKA000000002", error: "SKU does not exist" },
        { sku: "SKA000000003", error: "Price must be a positive float value" },
      ],
    });
  };
  const r = await runJob("push", onbuyId);
  assert.equal(r.ok, true, r.msg);
  // One request; rejected and unconfirmed SKUs are not re-sent in the same run.
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].sort(), ["SKA000000001", "SKA000000002", "SKA000000003", "SKA000000004"]);

  const p1 = await product("SKA000000001");
  assert.equal(Number(p1?.pushed_price), 10); // what was sent and confirmed
  assert.equal(p1?.needs_push, 1); // 10.5 still to go

  assert.equal(await product("SKA000000002"), null);
  assert.ok(await one("SELECT 1 FROM archived_skus WHERE tenant_id = ? AND sku = 'SKA000000002'", [tenantId]));

  const p3 = await product("SKA000000003");
  assert.match(p3?.push_error ?? "", /positive float/);
  assert.equal(p3?.push_attempts, 1);
  const p4 = await product("SKA000000004");
  assert.equal(p4?.push_attempts, 1); // OnBuy never mentioned it: unconfirmed, retried
  assert.equal(p4?.needs_push, 1);

  const run = await one<{ ok: number }>("SELECT ok FROM job_runs WHERE tenant_id = ? ORDER BY id DESC LIMIT 1", [tenantId]);
  assert.equal(run?.ok, 1);
});

test("push: a refused token after renewal marks OnBuy as failing and logs it", { skip: skipDb }, async () => {
  await ensureJob(tenantId, "push", onbuyId);
  await addProduct("SKB000000001", { price: 10, stock: 3 });
  pushDeps.updateListingsBySku = async () => response(401, { error: { message: "Bad token" } });
  const r = await runJob("push", onbuyId);
  assert.equal(r.ok, false);
  const acc = await one<{ status: string }>("SELECT status FROM marketplace_accounts WHERE id = ?", [onbuyId]);
  assert.equal(acc?.status, "error");
  assert.ok(await one("SELECT 1 FROM events WHERE tenant_id = ? AND level = 'error'", [tenantId]));
});

test("push takes listings with no fresh Amazon price for 24h out of stock first", { skip: skipDb }, async () => {
  await ensureJob(tenantId, "push", onbuyId);
  await addProduct("SKC000000001", { price: 20, stock: 3, pushedPrice: 20, pushedStock: 3, sourcePrice: 15, pricedHoursAgo: 25 });
  let pushed: { sku: string; stock: number }[] = [];
  pushDeps.updateListingsBySku = async (_p, _t, updates) => {
    pushed = updates.map((u) => ({ sku: u.sku, stock: u.stock }));
    return response(200, { results: updates.map((u) => ({ sku: u.sku })) });
  };
  await runJob("push", onbuyId);
  assert.deepEqual(pushed, [{ sku: "SKC000000001", stock: 0 }]);
  assert.equal((await product("SKC000000001"))?.stock, 0);
  assert.ok(await one("SELECT 1 FROM price_history WHERE tenant_id = ? AND new_stock = 0", [tenantId]));
});

test("every new workspace gets one reprice job, with no Amazon setup", { skip: skipDb }, async () => {
  const jobs = await q<{ target_id: number; enabled: number }>("SELECT target_id, enabled FROM jobs WHERE tenant_id = ? AND kind = 'reprice'", [tenantId]);
  assert.deepEqual(jobs.map((j) => [j.target_id, j.enabled]), [[REPRICE_TARGET, 1]]);
});

test("reprice prices FBA offers, takes unknown ASINs out of stock, writes history, paces SellSail's app", { skip: skipDb }, async () => {
  await addProduct("SKD000000001", { pricedHoursAgo: 2 });
  await addProduct("SKD000000002", { price: 30, stock: 3, sourcePrice: 20, pricedHoursAgo: 2 });
  await addProduct("SKD000000003", { pricedHoursAgo: 2 });
  const offer = (amount: number) => ({
    IsFulfilledByAmazon: true,
    ShippingTime: { maximumHours: 24, availabilityType: "NOW" },
    ListingPrice: { Amount: amount },
    Shipping: { Amount: 0 },
  });
  const asked: (readonly string[])[] = [];
  repriceDeps.itemOffersBatch = async (_p, _t, asins) => {
    asked.push(asins);
    return response(200, {
      responses: [
        { status: { statusCode: 200 }, request: { Asin: "D000000001" }, body: { payload: { Offers: [offer(12.5)] } } },
        { status: { statusCode: 404 }, request: { Asin: "D000000002" } },
        { status: { statusCode: 429 }, request: { Asin: "D000000003" } },
      ],
    });
  };
  const r = await runJob("reprice", REPRICE_TARGET);
  assert.equal(r.ok, true, r.msg);
  assert.equal(asked.length, 1); // the throttled ASIN is not re-read in the same run
  assert.equal(asked[0].length, 3);

  const cfg = await getRepriceConfig(tenantId);
  const p1 = await product("SKD000000001");
  assert.equal(Number(p1?.price), marketplacePrice(12.5, cfg.bands, cfg.fees));
  assert.equal(p1?.stock, cfg.inStockQty);
  assert.equal(p1?.needs_push, 1);

  const p2 = await product("SKD000000002");
  assert.equal(p2?.stock, 0);
  assert.equal(Number(p2?.price), cfg.outOfStockPrice);

  const p3 = await product("SKD000000003");
  assert.equal(p3?.source_fails, 1); // throttled: retried later, nothing changed
  assert.equal(p3?.stock, null);

  const hist = await q("SELECT product_id FROM price_history WHERE tenant_id = ?", [tenantId]);
  assert.equal(hist.length, 2);
  const app = await one<{ ahead: number; status: string }>(
    "SELECT next_allowed_at > NOW(3) - INTERVAL 1 SECOND AS ahead, status FROM amazon_apps WHERE slot = 1",
  );
  assert.equal(Number(app?.ahead), 1); // the call slot was reserved
  assert.equal(app?.status, "ok");
});

test("reprice: a key set Amazon refuses sits out, and nothing is priced from it", { skip: skipDb }, async () => {
  await addProduct("SKF000000001", { pricedHoursAgo: 2 });
  repriceDeps.itemOffersBatch = async () => response(403, { errors: [{ code: "Unauthorized", message: "Access to requested resource is denied." }] });
  const r = await runJob("reprice", REPRICE_TARGET);
  assert.equal(r.ok, false);
  const app = await one<{ status: string; backing_off: number }>(
    "SELECT status, next_allowed_at > NOW(3) + INTERVAL 10 MINUTE AS backing_off FROM amazon_apps WHERE slot = 1",
  );
  assert.equal(app?.status, "error");
  assert.equal(Number(app?.backing_off), 1);
  assert.equal((await product("SKF000000001"))?.stock, null);
});

test("reprice without SellSail's Amazon keys sends nothing", { skip: skipDb }, async () => {
  const saved = repriceDeps.configuredApps;
  repriceDeps.configuredApps = () => [];
  try {
    const r = await runJob("reprice", REPRICE_TARGET);
    assert.equal(r.ok, false);
    assert.match(r.msg, /not set up/);
  } finally {
    repriceDeps.configuredApps = saved;
  }
});

test("import pages by offset until total_rows, skipping non-ASIN and archived SKUs", { skip: skipDb }, async () => {
  await exec("INSERT INTO archived_skus (tenant_id, marketplace, sku, reason) VALUES (?, 'onbuy', 'B0ARCHIVED1', 'gone')", [tenantId]);
  const offsets: number[] = [];
  importDeps.browseListings = async (_p, _t, offset) => {
    offsets.push(offset);
    // A short first page that is not the end.
    if (offset === 0) return { totalRows: 600, listings: [{ sku: "B0AAAAAAA1", name: "One", price: 9.99, stock: 2, opc: "P1" }, { sku: "HELLO-WORLD", name: "x", price: 1, stock: 1, opc: "" }] };
    return { totalRows: 600, listings: [{ sku: "B0ARCHIVED1", name: "Old", price: 1, stock: 0, opc: "" }, { sku: "b0aaaaaaa2", name: "Two", price: null, stock: null, opc: "" }] };
  };
  await ensureJob(tenantId, "import", onbuyId, { runNow: true, state: newImportState(false) });
  const r = await runJob("import", onbuyId);
  assert.equal(r.ok, true, r.msg);
  assert.equal(r.disable, true);
  assert.deepEqual(offsets, [0, 500]);

  const rows = await q<{ sku: string; source_ref: string; pushed_price: number | null }>(
    "SELECT sku, source_ref, pushed_price FROM products WHERE tenant_id = ? ORDER BY sku",
    [tenantId],
  );
  assert.deepEqual(rows.map((r) => r.sku), ["B0AAAAAAA1", "b0aaaaaaa2"]);
  assert.equal(rows[1].source_ref, "B0AAAAAAA2");
  assert.equal(Number(rows[0].pushed_price), 9.99); // what OnBuy shows now
  const job = await one<{ enabled: number }>("SELECT enabled FROM jobs WHERE tenant_id = ? AND kind = 'import'", [tenantId]);
  assert.equal(job?.enabled, 0);
});
