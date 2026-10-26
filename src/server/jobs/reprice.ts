// Reprice: read Amazon offers for a workspace's products and set each
// listing's price and stock.
//
// Up to 10 batches of 20 ASINs per run, oldest-priced first. The Amazon calls
// use SellSail's own app keys (connections/amazon.ts), shared by every
// workspace: each batch reserves whichever app is free next, so workspaces
// take turns on the pool and no seller needs Amazon keys of their own.

import { readItemOfferResponse, type ItemOfferResult } from "../integrations/amazon/offers.ts";
import { AmazonError, batchResponses, itemOffersBatch, OFFERS_BATCH_MAX } from "../integrations/amazon/spapi.ts";
import { EgressBlockedError, ProxyFailureError } from "../net/egress.ts";
import { one, q, tx } from "../db/pool.ts";
import {
  amazonAppToken,
  amazonRoute,
  backOffAmazonApp,
  configuredApps,
  markAmazonApp,
  reserveAmazonApp,
} from "../connections/amazon.ts";
import { getRepriceConfig } from "../repos/pricing.ts";
import { batchLooksBroken, decide, listingChanged, type ProductState } from "./decide.ts";
import { timeLeft, type JobCtx, type RunResult } from "./types.ts";

export const BATCHES_PER_RUN = 10;

/** The network edge of this job, swapped out in tests. */
export const repriceDeps = { reserveAmazonApp, amazonAppToken, itemOffersBatch, amazonRoute, configuredApps, markAmazonApp, backOffAmazonApp };
/** A product is not re-read sooner than this after its last price. */
export const MIN_REPRICE_AGE_S = 10 * 60;

type Product = {
  id: number;
  source_ref: string;
  source_price: number | null;
  price: number | null;
  stock: number | null;
  source_fails: number;
  compete: number;
  competitor_price: number | null;
  competitor_seen_at: Date | null;
};

export async function runReprice(ctx: JobCtx): Promise<RunResult> {
  const { tenantId } = ctx;

  if (repriceDeps.configuredApps().length === 0) {
    return { ok: true, quiet: true, msg: "Waiting for Amazon pricing to start", nextInS: 900 };
  }
  const { route, reason } = repriceDeps.amazonRoute();
  if (!route) return { ok: false, msg: `Nothing sent: ${reason}`, nextInS: 900 };

  const cfg = await getRepriceConfig(tenantId);
  let read = 0;
  let changed = 0;
  let oos = 0;
  let retry = 0;
  let batches = 0;
  const tried = new Set<string>();

  while (batches < BATCHES_PER_RUN && timeLeft(ctx) > 25_000) {
    if (await ctx.shouldStop()) break;

    // Oldest-priced first; several SKUs can share one ASIN. An ASIN is read
    // at most once per run, so a throttled item waits for the next run rather
    // than using up its three strikes in a few seconds.
    const candidates = await q<{ source_ref: string }>(
      `SELECT source_ref FROM products
        WHERE tenant_id = ? AND source = 'amazon' AND priced_at < NOW(3) - INTERVAL ? SECOND
          ${tried.size ? "AND source_ref NOT IN (?)" : ""}
        ORDER BY priced_at LIMIT 100`,
      tried.size ? [tenantId, MIN_REPRICE_AGE_S, [...tried]] : [tenantId, MIN_REPRICE_AGE_S],
    );
    const asins = [...new Set(candidates.map((c) => c.source_ref))].slice(0, OFFERS_BATCH_MAX);
    if (asins.length === 0) break;
    for (const a of asins) tried.add(a);

    // Wait for a free app only briefly: when every app is backing off after an
    // error, give the worker back instead of sleeping through the run.
    const app = await repriceDeps.reserveAmazonApp(
      (wait) => wait <= 30_000 && timeLeft(ctx) > wait + 20_000,
      (ms) => ctx.sleep(ms),
    );
    if (!app) break; // no app free soon enough: the next run carries on
    batches++;

    let res;
    try {
      let token = await repriceDeps.amazonAppToken(app, route);
      res = await repriceDeps.itemOffersBatch(route, token, asins);
      if (res.status === 401 || res.status === 403) {
        // Possibly a stale token: renew once and repeat on the same reserved slot.
        token = await repriceDeps.amazonAppToken(app, route, true);
        res = await repriceDeps.itemOffersBatch(route, token, asins);
      }
    } catch (err) {
      if (err instanceof EgressBlockedError || err instanceof ProxyFailureError) {
        return { ok: false, msg: `Amazon call not sent: ${(err as Error).message}`, nextInS: 300 };
      }
      if (err instanceof AmazonError && [400, 401, 403].includes(err.status)) {
        // The token refresh was refused, so this key set is broken. It sits
        // out for a while and the run carries on with the other apps.
        await repriceDeps.markAmazonApp(app.slot, false, err.message);
        for (const a of asins) tried.delete(a);
        continue;
      }
      return { ok: false, msg: `Amazon call failed: ${(err as Error).message}`, nextInS: 120 };
    }

    if (res.status === 401 || res.status === 403) {
      await repriceDeps.markAmazonApp(app.slot, false, `Pricing call refused (HTTP ${res.status}); the app needs the Pricing role`);
      for (const a of asins) tried.delete(a);
      continue;
    }
    if (res.status === 429) {
      await repriceDeps.backOffAmazonApp(app.slot, 60);
      for (const a of asins) tried.delete(a); // not read: try them again on another app
      continue;
    }
    if (res.status === 200) await repriceDeps.markAmazonApp(app.slot, true);

    const results = new Map<string, ItemOfferResult>();
    const list = res.status === 200 ? batchResponses(res) : null;
    for (const entry of list ?? []) {
      const r = readItemOfferResponse(entry);
      if (r) results.set(r.asin.toUpperCase(), r);
    }

    const products = await q<Product>(
      `SELECT id, source_ref, source_price, price, stock, source_fails, compete, competitor_price, competitor_seen_at FROM products
        WHERE tenant_id = ? AND source = 'amazon' AND source_ref IN (?)`,
      [tenantId, asins],
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
          compete: Boolean(p.compete),
          competitor: { price: p.competitor_price === null ? null : Number(p.competitor_price), seenAt: p.competitor_seen_at },
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

  // Backlog of never-failed items only: items waiting on a retry come back at
  // the normal interval, not seconds later.
  const pending = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM products WHERE tenant_id = ? AND source = 'amazon' AND source_fails = 0 AND priced_at < NOW(3) - INTERVAL ? SECOND",
    [tenantId, MIN_REPRICE_AGE_S],
  );
  const backlog = Number(pending?.n ?? 0);
  const msg =
    read === 0
      ? batches > 0 || backlog > 0
        ? "Waiting for Amazon; trying again shortly"
        : "Nothing due for repricing"
      : `Read ${read} listing${read === 1 ? "" : "s"}: ${changed} changed, ${oos} out of stock${retry ? `, ${retry} to retry` : ""}`;
  return {
    ok: read > 0 || backlog === 0,
    msg,
    // Keep going straight away while there is a backlog and Amazon is
    // answering; otherwise wait a minute rather than spin.
    nextInS: backlog > 0 ? (read > 0 ? 5 : 60) : undefined,
    progress: { done: read, total: read + backlog, note: `${batches} batch${batches === 1 ? "" : "es"}` },
  };
}
