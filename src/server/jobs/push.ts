// Push: send changed prices and stock to OnBuy.
//
// Up to 1000 needs_push listings per request (OnBuy's batch limit), a few
// requests per run. A listing counts as pushed only when OnBuy names it
// without an error, and then exactly the values sent are recorded as
// pushed: a price that changed while the request was in flight stays pending.
// SKUs OnBuy says don't exist are moved to archived_skus so they stop looping.

import { PUSH_BATCH_MAX, updateListingsBySku, onbuyErrorText, OnBuyError } from "../integrations/onbuy/client.ts";
import { isAuthFailure, isMissingSkuError, splitPushResults } from "../integrations/onbuy/results.ts";
import { EgressBlockedError } from "../net/egress.ts";
import { exec, one, q, tx } from "../db/pool.ts";
import { logEvent } from "../audit.ts";
import { recordActivity } from "../activity.ts";
import { routeForTenant, reportProxyError } from "../connections/proxy.ts";
import { markOnBuyStatus, onbuyTokens } from "../connections/onbuy.ts";
import { getSettings } from "../repos/pricing.ts";
import { timeLeft, type JobCtx, type RunResult } from "./types.ts";

export const BATCHES_PER_RUN = 5;

/** The network edge of this job, swapped out in tests. */
export const pushDeps = { routeForTenant, onbuyTokens, updateListingsBySku };
/** Listings with no fresh Amazon price for this long are taken out of stock. */
export const STALE_HOURS = 24;

type Row = {
  id: number;
  sku: string;
  price: number;
  stock: number;
  source_ref: string;
  title: string | null;
  pushed_price: number | null;
  pushed_stock: number | null;
};

/**
 * Brake: if Amazon prices stop arriving (account broken, shard unassigned),
 * a listing must not keep selling at an old price. Out of stock it goes.
 */
async function stopStaleListings(tenantId: number): Promise<number> {
  const stale = await q<{ id: number; price: number | null; stock: number; source_price: number | null }>(
    `SELECT id, price, stock, source_price FROM products
      WHERE tenant_id = ? AND stock > 0 AND priced_at < NOW(3) - INTERVAL ? HOUR LIMIT 5000`,
    [tenantId, STALE_HOURS],
  );
  if (stale.length === 0) return 0;
  await tx(async (t) => {
    const ids = stale.map((s) => s.id);
    await t.exec(
      `UPDATE products SET stock = 0, source_error = 'No fresh Amazon price for ${STALE_HOURS}h' WHERE tenant_id = ? AND id IN (?)`,
      [tenantId, ids],
    );
    const values = stale.map(() => "(?, ?, ?, ?, ?, ?, 0)").join(", ");
    await t.exec(
      `INSERT INTO price_history (tenant_id, product_id, source_price, old_price, new_price, old_stock, new_stock) VALUES ${values}`,
      stale.flatMap((s) => [tenantId, s.id, s.source_price, s.price, s.price, s.stock]),
    );
  });
  await logEvent(tenantId, "warn", "stale", `${stale.length} listing(s) had no fresh Amazon price for ${STALE_HOURS}h and were set out of stock.`);
  await recordActivity({ type: "stock_sync.stale_out_of_stock", tenantId, detail: { listings: stale.length, hours: STALE_HOURS } });
  return stale.length;
}

export async function runPush(ctx: JobCtx): Promise<RunResult> {
  const { tenantId, targetId: accountId } = ctx;
  const account = await one<{ id: number }>("SELECT id FROM marketplace_accounts WHERE id = ? AND tenant_id = ? AND marketplace = 'onbuy'", [
    accountId,
    tenantId,
  ]);
  if (!account) return { ok: false, msg: "OnBuy account was removed", disable: true };

  await stopStaleListings(tenantId);

  const pendingAtStart = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND needs_push = 1",
    [tenantId],
  );
  if (Number(pendingAtStart?.n ?? 0) === 0) return { ok: true, msg: "Nothing to push", progress: { done: 0, total: 0, note: "" } };

  const { route, reason } = await pushDeps.routeForTenant(tenantId);
  if (!route) return { ok: false, msg: `Nothing sent: ${reason}`, nextInS: 300 };

  const settings = await getSettings(tenantId);
  const tokens = pushDeps.onbuyTokens(tenantId, route);
  let applied = 0;
  let rejected = 0;
  let archived = 0;
  let batches = 0;
  const attempted: number[] = [];
  // Counts for job_runs and the activity summaries; see migration 013.
  const stats = () => ({ checked: attempted.length, changed: applied, skipped: archived, errors: rejected });

  while (batches < BATCHES_PER_RUN && timeLeft(ctx) > 30_000) {
    if (await ctx.shouldStop()) break;
    // Fewest failed attempts first, so a few stubborn SKUs can't block the
    // rest. Each listing is sent at most once per run: a rejected or
    // unconfirmed one waits for the next run instead of using up OnBuy's
    // hourly write limit now.
    const rows = await q<Row>(
      `SELECT id, sku, price, stock, source_ref, title, pushed_price, pushed_stock FROM products
        WHERE tenant_id = ? AND marketplace = 'onbuy' AND needs_push = 1 ${attempted.length ? "AND id NOT IN (?)" : ""}
        ORDER BY push_attempts, id LIMIT ?`,
      attempted.length ? [tenantId, attempted, PUSH_BATCH_MAX] : [tenantId, PUSH_BATCH_MAX],
    );
    if (rows.length === 0) break;
    attempted.push(...rows.map((r) => r.id));
    batches++;
    const sent = rows.map((r) => ({ sku: r.sku, price: Number(r.price), stock: Number(r.stock) }));

    let res;
    try {
      res = await pushDeps.updateListingsBySku(route, tokens, sent, settings.boostPct);
    } catch (err) {
      if (await reportProxyError(tenantId, err)) return { ok: false, msg: "Proxy failed mid-run; stopped", nextInS: 300, stats: stats() };
      if (err instanceof EgressBlockedError) return { ok: false, msg: err.message, nextInS: 300, stats: stats() };
      if (err instanceof OnBuyError) {
        // The token request itself was refused: keys revoked or wrong.
        await markOnBuyStatus(tenantId, false, err.message);
        await logEvent(tenantId, "error", "onbuy", `OnBuy login failed: ${err.message}`);
        return { ok: false, msg: err.message, nextInS: 900, stats: stats() };
      }
      return { ok: false, msg: `OnBuy call failed: ${(err as Error).message}`, nextInS: 120, stats: stats() };
    }

    if (isAuthFailure(res.status, res.json)) {
      // Still refused after one token renewal.
      const msg = `OnBuy refused the update after a fresh login (${onbuyErrorText(res)}). Check the keys, and if you use a proxy, that its IP is stable.`;
      await markOnBuyStatus(tenantId, false, msg);
      await logEvent(tenantId, "error", "onbuy", msg);
      return { ok: false, msg, nextInS: 900, stats: stats() };
    }
    if (res.status === 429) {
      return { ok: false, msg: "OnBuy rate limit reached; will try again later", nextInS: 900, stats: stats() };
    }

    const outcome = splitPushResults(res.status === 200 ? res.json : null, sent.map((s) => s.sku));
    const bySku = new Map(rows.map((r) => [r.sku, r]));
    const sentBySku = new Map(sent.map((s) => [s.sku, s]));

    await tx(async (t) => {
      for (const sku of outcome.applied) {
        const s = sentBySku.get(sku)!;
        await t.exec(
          `UPDATE products SET pushed_price = ?, pushed_stock = ?, pushed_at = NOW(3), push_error = NULL, push_attempts = 0, push_requested = 0
            WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku = ?`,
          [s.price, s.stock, tenantId, sku],
        );
      }
      for (const [sku, why] of outcome.rejected) {
        const row = bySku.get(sku)!;
        if (isMissingSkuError(why)) {
          await t.exec(
            `INSERT INTO archived_skus (tenant_id, marketplace, sku, reason, row_json) VALUES (?, 'onbuy', ?, ?, ?)
             ON DUPLICATE KEY UPDATE reason = VALUES(reason), row_json = VALUES(row_json), archived_at = NOW(3)`,
            [tenantId, sku, why.slice(0, 255), JSON.stringify({ asin: row.source_ref, title: row.title, price: row.price, stock: row.stock })],
          );
          await t.exec("DELETE FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku = ?", [tenantId, sku]);
          archived++;
        } else {
          await t.exec(
            "UPDATE products SET push_error = ?, push_attempts = push_attempts + 1 WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku = ?",
            [why.slice(0, 255), tenantId, sku],
          );
          rejected++;
        }
      }
      if (outcome.unconfirmed.length) {
        const note = res.status === 200 ? "Not confirmed by OnBuy" : onbuyErrorText(res);
        await t.exec(
          "UPDATE products SET push_error = ?, push_attempts = push_attempts + 1 WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku IN (?)",
          [note.slice(0, 255), tenantId, outcome.unconfirmed],
        );
      }
    });
    applied += outcome.applied.length;

    if (res.status !== 200) {
      await logEvent(tenantId, "warn", "onbuy", `Price update not accepted: ${onbuyErrorText(res)}`);
      return { ok: false, msg: onbuyErrorText(res), nextInS: 300, stats: stats() };
    }
    if (!(await ctx.heartbeat())) break;
  }

  await markOnBuyStatus(tenantId, true);
  if (archived) await logEvent(tenantId, "warn", "archive", `${archived} SKU(s) don't exist on OnBuy and were archived.`);
  if (rejected) await logEvent(tenantId, "warn", "onbuy", `OnBuy rejected ${rejected} update(s). See Products for the reasons.`);

  const left = await one<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND needs_push = 1", [tenantId]);
  return {
    ok: true,
    msg: `Pushed ${applied} update${applied === 1 ? "" : "s"} to OnBuy${rejected ? `, ${rejected} rejected` : ""}${archived ? `, ${archived} archived` : ""}`,
    progress: { done: applied, total: applied + Number(left?.n ?? 0), note: `${batches} request${batches === 1 ? "" : "s"}` },
    // Rejected rows stay pending; only hurry back when real work is queued.
    nextInS: Number(left?.n ?? 0) > rejected ? 60 : undefined,
    stats: stats(),
  };
}

/** Ask for every listing to be sent again on the next push (e.g. after reconnecting). */
export async function requestFullPush(tenantId: number): Promise<number> {
  const res = await exec("UPDATE products SET push_requested = 1 WHERE tenant_id = ? AND price IS NOT NULL AND stock IS NOT NULL", [tenantId]);
  return res.affectedRows;
}
