// Reprice: read Amazon offers for one Amazon account's share of products and
// set each listing's price and stock.
//
// Up to 10 batches of 20 ASINs per run, oldest-priced first. Amazon allows
// this endpoint 0.1 requests/second per account, so batches are paced by
// source_accounts.next_allowed_at: a slot is reserved with one conditional
// UPDATE, which also keeps two workers from sharing an account's budget.

import { readItemOfferResponse, type ItemOfferResult } from "../integrations/amazon/offers.ts";
import { AmazonError, batchResponses, itemOffersBatch, OFFERS_BATCH_MAX } from "../integrations/amazon/spapi.ts";
import { EgressBlockedError } from "../net/egress.ts";
import { exec, one, q, tx } from "../db/pool.ts";
import { logEvent } from "../audit.ts";
import { proxyForJob, reportProxyError } from "../connections/proxy.ts";
import { amazonAccessToken, markAmazonStatus } from "../connections/amazon.ts";
import { getRepriceConfig } from "../repos/pricing.ts";
import { batchLooksBroken, decide, listingChanged, type ProductState } from "./decide.ts";
import { timeLeft, type JobCtx, type RunResult } from "./types.ts";

export const BATCHES_PER_RUN = 10;

/** The network edge of this job, swapped out in tests. */
export const repriceDeps = { proxyForJob, amazonAccessToken, itemOffersBatch };
/** A product is not re-read sooner than this after its last price. */
export const MIN_REPRICE_AGE_S = 10 * 60;

type Product = { id: number; source_ref: string; source_price: number | null; price: number | null; stock: number | null; source_fails: number };

/** Waits for, and reserves, this account's next Amazon call. False if the deadline comes first. */
async function reserveSlot(ctx: JobCtx, accountId: number): Promise<boolean> {
  for (;;) {
    const res = await exec(
      `UPDATE source_accounts SET next_allowed_at = NOW(3) + INTERVAL (rate_interval_ms * 1000) MICROSECOND
        WHERE id = ? AND tenant_id = ? AND next_allowed_at <= NOW(3)`,
      [accountId, ctx.tenantId],
    );
    if (res.affectedRows === 1) return true;
    const row = await one<{ wait_ms: number }>(
      "SELECT GREATEST(0, TIMESTAMPDIFF(MICROSECOND, NOW(3), next_allowed_at) / 1000) AS wait_ms FROM source_accounts WHERE id = ? AND tenant_id = ?",
      [accountId, ctx.tenantId],
    );
    const wait = Math.min(Number(row?.wait_ms ?? 1000) + 50, 15_000);
    if (timeLeft(ctx) < wait + 20_000) return false;
    await ctx.sleep(wait);
  }
}

async function pushBack(accountId: number, tenantId: number, seconds: number): Promise<void> {
  await exec("UPDATE source_accounts SET next_allowed_at = NOW(3) + INTERVAL ? SECOND WHERE id = ? AND tenant_id = ?", [seconds, accountId, tenantId]);
}

export async function runReprice(ctx: JobCtx): Promise<RunResult> {
  const { tenantId, targetId: accountId } = ctx;
  const account = await one<{ status: string }>("SELECT status FROM source_accounts WHERE id = ? AND tenant_id = ? AND source = 'amazon'", [
    accountId,
    tenantId,
  ]);
  if (!account) return { ok: false, msg: "Amazon account was removed", disable: true };

  const { proxy, reason } = await repriceDeps.proxyForJob(tenantId);
  if (!proxy) return { ok: false, msg: `Nothing sent: ${reason}`, nextInS: 300 };

  // An account in error has no products assigned; check whether it recovered.
  if (account.status !== "connected") {
    try {
      await repriceDeps.amazonAccessToken(tenantId, accountId, proxy, true);
      await markAmazonStatus(tenantId, accountId, true);
      await logEvent(tenantId, "info", "amazon", "Amazon account is working again.");
    } catch (err) {
      if (await reportProxyError(tenantId, err)) return { ok: false, msg: "Proxy failed", nextInS: 300 };
      return { ok: false, msg: `Amazon login still failing: ${(err as Error).message}`, nextInS: 900 };
    }
  }

  const cfg = await getRepriceConfig(tenantId);
  let read = 0;
  let changed = 0;
  let oos = 0;
  let retry = 0;
  let batches = 0;
  let authRetried = false;
  const tried = new Set<string>();

  while (batches < BATCHES_PER_RUN && timeLeft(ctx) > 25_000) {
    if (await ctx.shouldStop()) break;

    // Oldest-priced first; several SKUs can share one ASIN. An ASIN is read
    // at most once per run, so a throttled item waits for the next run rather
    // than using up its three strikes in a few seconds.
    const candidates = await q<{ source_ref: string }>(
      `SELECT source_ref FROM products
        WHERE tenant_id = ? AND source_account_id = ? AND source = 'amazon' AND priced_at < NOW(3) - INTERVAL ? SECOND
          ${tried.size ? "AND source_ref NOT IN (?)" : ""}
        ORDER BY priced_at LIMIT 100`,
      tried.size ? [tenantId, accountId, MIN_REPRICE_AGE_S, [...tried]] : [tenantId, accountId, MIN_REPRICE_AGE_S],
    );
    const asins = [...new Set(candidates.map((c) => c.source_ref))].slice(0, OFFERS_BATCH_MAX);
    if (asins.length === 0) break;
    for (const a of asins) tried.add(a);

    if (!(await reserveSlot(ctx, accountId))) break;
    batches++;

    let token: string;
    let res;
    try {
      token = await repriceDeps.amazonAccessToken(tenantId, accountId, proxy);
      res = await repriceDeps.itemOffersBatch(proxy, token, asins);
      if ((res.status === 401 || res.status === 403) && !authRetried) {
        authRetried = true;
        token = await repriceDeps.amazonAccessToken(tenantId, accountId, proxy, true);
        if (!(await reserveSlot(ctx, accountId))) break;
        res = await repriceDeps.itemOffersBatch(proxy, token, asins);
      }
    } catch (err) {
      if (await reportProxyError(tenantId, err)) return { ok: false, msg: "Proxy failed mid-run; stopped", nextInS: 300 };
      if (err instanceof EgressBlockedError) return { ok: false, msg: err.message, nextInS: 300 };
      if (!(err instanceof AmazonError) || ![400, 401, 403].includes(err.status)) {
        return { ok: false, msg: `Amazon call failed: ${(err as Error).message}`, nextInS: 120 };
      }
      // Token refresh refused: the refresh token was revoked or the app removed.
      await markAmazonStatus(tenantId, accountId, false, (err as Error).message);
      await logEvent(tenantId, "error", "amazon", `Amazon login failed: ${(err as Error).message}`);
      return { ok: false, msg: (err as Error).message, nextInS: 900 };
    }

    if (res.status === 401 || res.status === 403) {
      const msg = `Amazon refused the pricing call (HTTP ${res.status}). Reconnect the account or check the app's Pricing role.`;
      await markAmazonStatus(tenantId, accountId, false, msg);
      await logEvent(tenantId, "error", "amazon", msg);
      return { ok: false, msg, nextInS: 900 };
    }
    if (res.status === 429) {
      await pushBack(accountId, tenantId, 60);
      break;
    }

    const results = new Map<string, ItemOfferResult>();
    const list = res.status === 200 ? batchResponses(res) : null;
    for (const entry of list ?? []) {
      const r = readItemOfferResponse(entry);
      if (r) results.set(r.asin.toUpperCase(), r);
    }

    const products = await q<Product>(
      `SELECT id, source_ref, source_price, price, stock, source_fails FROM products
        WHERE tenant_id = ? AND source_account_id = ? AND source_ref IN (?)`,
      [tenantId, accountId, asins],
    );
    const ordered = asins.map((a) => results.get(a.toUpperCase()));
    const inStock = asins.map((a) => products.some((p) => p.source_ref === a && (p.stock ?? 0) > 0));
    const broken = !list || batchLooksBroken(ordered, inStock);

    await tx(async (t) => {
      for (const p of products) {
        const state: ProductState = {
          sourcePrice: p.source_price === null ? null : Number(p.source_price),
          price: p.price === null ? null : Number(p.price),
          stock: p.stock,
          sourceFails: p.source_fails,
        };
        const result = broken ? { asin: p.source_ref, kind: "temporary" as const, status: res.status === 200 ? 0 : res.status } : results.get(p.source_ref.toUpperCase());
        const d = decide(state, result, cfg);
        read++;
        if (d.kind === "retry") {
          retry++;
          // priced_at is left alone so the item stays first in line.
          await t.exec("UPDATE products SET source_fails = ?, source_error = ? WHERE id = ? AND tenant_id = ?", [d.fails, d.error.slice(0, 120), p.id, tenantId]);
          continue;
        }
        if (d.kind === "oos") oos++;
        await t.exec(
          `UPDATE products SET source_price = ?, price = ?, stock = ?, source_fails = ?, source_error = ?, priced_at = NOW(3)
            WHERE id = ? AND tenant_id = ?`,
          [d.sourcePrice, d.price, d.stock, d.fails, d.error ? d.error.slice(0, 120) : null, p.id, tenantId],
        );
        if (listingChanged(state, d)) {
          changed++;
          await t.exec(
            "INSERT INTO price_history (tenant_id, product_id, source_price, old_price, new_price, old_stock, new_stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [tenantId, p.id, d.sourcePrice, state.price, d.price, state.stock, d.stock],
          );
        }
      }
    });

    if (!(await ctx.heartbeat())) break;
  }

  if (batches > 0) await markAmazonStatus(tenantId, accountId, true);
  // Backlog of never-failed items only: items waiting on a retry come back at
  // the normal interval, not seconds later.
  const pending = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM products WHERE tenant_id = ? AND source_account_id = ? AND source_fails = 0 AND priced_at < NOW(3) - INTERVAL ? SECOND",
    [tenantId, accountId, MIN_REPRICE_AGE_S],
  );
  const msg =
    read === 0
      ? "Nothing due for repricing"
      : `Read ${read} listing${read === 1 ? "" : "s"}: ${changed} changed, ${oos} out of stock${retry ? `, ${retry} to retry` : ""}`;
  return {
    ok: true,
    msg,
    // Keep going straight away while there is a backlog.
    nextInS: Number(pending?.n ?? 0) > 0 ? 5 : undefined,
    progress: { done: read, total: read + Number(pending?.n ?? 0), note: `${batches} batch${batches === 1 ? "" : "es"}` },
  };
}
