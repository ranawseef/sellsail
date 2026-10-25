// Compete: ask OnBuy who is winning each listing and undercut the leader.
//
// Up to 10 requests of 100 SKUs per run (OnBuy's check-winning limit), the
// listings checked longest ago first. Only in-stock, priced listings with
// competition switched on are checked: an out-of-stock listing has nothing to
// win. For each answer the leader's price is stored and the listing's price
// recomputed from the Amazon price we already hold (no Amazon call), so the
// push job sends any change on its next run.

import { marketplacePrice } from "../../lib/pricing.ts";
import { CHECK_WINNING_MAX, checkWinning, onbuyErrorText, OnBuyError, readWinningResults } from "../integrations/onbuy/client.ts";
import { isAuthFailure } from "../integrations/onbuy/results.ts";
import { EgressBlockedError } from "../net/egress.ts";
import { one, q, tx } from "../db/pool.ts";
import { routeForTenant, reportProxyError } from "../connections/proxy.ts";
import { markOnBuyStatus, onbuyTokens } from "../connections/onbuy.ts";
import { getRepriceConfig } from "../repos/pricing.ts";
import { planFor } from "../../config/plans.ts";
import { listPrice, type ProductState } from "./decide.ts";
import { timeLeft, type JobCtx, type RunResult } from "./types.ts";

export const BATCHES_PER_RUN = 10;

/** The network edge of this job, swapped out in tests. */
export const competeDeps = { routeForTenant, onbuyTokens, checkWinning };

type Row = {
  id: number;
  sku: string;
  source_price: number;
  price: number;
  stock: number;
  competitor_price: number | null;
  competitor_seen_at: Date | null;
};

export async function runCompete(ctx: JobCtx): Promise<RunResult> {
  const { tenantId, targetId: accountId } = ctx;
  const account = await one<{ id: number }>("SELECT id FROM marketplace_accounts WHERE id = ? AND tenant_id = ? AND marketplace = 'onbuy'", [
    accountId,
    tenantId,
  ]);
  if (!account) return { ok: false, msg: "OnBuy account was removed", disable: true };

  const cfg = await getRepriceConfig(tenantId);
  if (!cfg.compete) return { ok: true, msg: "Competition is switched off", nextInS: 3600, progress: { done: 0, total: 0, note: "" } };

  const tenant = await one<{ plan: string }>("SELECT plan FROM tenants WHERE id = ?", [tenantId]);
  const recheckS = planFor(tenant?.plan).competeIntervalS;

  const { route, reason } = await competeDeps.routeForTenant(tenantId);
  if (!route) return { ok: false, msg: `Nothing sent: ${reason}`, nextInS: 300 };
  const tokens = competeDeps.onbuyTokens(tenantId, route);

  let checked = 0;
  let winning = 0;
  let losing = 0;
  let changed = 0;
  let batches = 0;

  while (batches < BATCHES_PER_RUN && timeLeft(ctx) > 20_000) {
    if (await ctx.shouldStop()) break;
    const rows = await q<Row>(
      `SELECT id, sku, source_price, price, stock, competitor_price, competitor_seen_at FROM products
        WHERE tenant_id = ? AND marketplace = 'onbuy' AND compete = 1 AND stock > 0 AND price IS NOT NULL AND source_price > 0
          AND (compete_checked_at IS NULL OR compete_checked_at < NOW(3) - INTERVAL ? SECOND)
        ORDER BY compete_checked_at IS NOT NULL, compete_checked_at, id LIMIT ?`,
      [tenantId, recheckS, CHECK_WINNING_MAX],
    );
    if (rows.length === 0) break;
    batches++;

    let res;
    try {
      res = await competeDeps.checkWinning(route, tokens, rows.map((r) => r.sku));
    } catch (err) {
      if (await reportProxyError(tenantId, err)) return { ok: false, msg: "Proxy failed mid-run; stopped", nextInS: 300 };
      if (err instanceof EgressBlockedError) return { ok: false, msg: err.message, nextInS: 300 };
      if (err instanceof OnBuyError) {
        await markOnBuyStatus(tenantId, false, err.message);
        return { ok: false, msg: err.message, nextInS: 900 };
      }
      return { ok: false, msg: `OnBuy call failed: ${(err as Error).message}`, nextInS: 300 };
    }
    if (isAuthFailure(res.status, res.json)) {
      return { ok: false, msg: `OnBuy refused the competition check (${onbuyErrorText(res)})`, nextInS: 900 };
    }
    if (res.status === 429) return { ok: false, msg: "OnBuy rate limit reached; will try again later", nextInS: 900 };
    if (res.status !== 200) {
      // Don't retry the same SKUs in a tight loop: mark them checked.
      await tx(async (t) => {
        await t.exec("UPDATE products SET compete_checked_at = NOW(3) WHERE tenant_id = ? AND id IN (?)", [tenantId, rows.map((r) => r.id)]);
      });
      return { ok: false, msg: `Competition check failed: ${onbuyErrorText(res)}`, nextInS: 600 };
    }

    const answers = new Map(readWinningResults(res.json).map((r) => [r.sku.toLowerCase(), r]));
    const now = new Date();

    await tx(async (t) => {
      for (const r of rows) {
        const a = answers.get(r.sku.toLowerCase());
        checked++;
        if (!a) {
          await t.exec("UPDATE products SET compete_checked_at = NOW(3) WHERE id = ? AND tenant_id = ?", [r.id, tenantId]);
          continue;
        }
        // Losing with a known leader: remember the leader's price. Winning: keep
        // the last leader price (still fresh for a while) so we stay under it.
        let competitorPrice = r.competitor_price === null ? null : Number(r.competitor_price);
        let seenAt = r.competitor_seen_at;
        if (a.winning) winning++;
        else {
          losing++;
          if (a.leadPrice !== null) {
            competitorPrice = a.leadPrice;
            seenAt = now;
          }
        }

        const source = Number(r.source_price);
        const band = marketplacePrice(source, cfg.bands, cfg.fees);
        const oldPrice = Number(r.price);
        let newPrice = oldPrice;
        if (band !== null) {
          const state: ProductState = {
            sourcePrice: source,
            price: oldPrice,
            stock: r.stock,
            sourceFails: 0,
            compete: true,
            competitor: { price: competitorPrice, seenAt },
          };
          newPrice = listPrice(band, source, state, cfg, now);
        }

        await t.exec(
          `UPDATE products SET winning = ?, competitor_price = ?, competitor_seen_at = ?, compete_checked_at = NOW(3), price = ?
            WHERE id = ? AND tenant_id = ?`,
          [a.winning ? 1 : 0, competitorPrice, seenAt, newPrice, r.id, tenantId],
        );
        if (newPrice !== oldPrice) {
          changed++;
          await t.exec(
            "INSERT INTO price_history (tenant_id, product_id, source_price, old_price, new_price, old_stock, new_stock, reason) VALUES (?, ?, ?, ?, ?, ?, ?, 'compete')",
            [tenantId, r.id, source, oldPrice, newPrice, r.stock, r.stock],
          );
        }
      }
    });
    if (!(await ctx.heartbeat())) break;
  }

  const due = await one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM products
      WHERE tenant_id = ? AND marketplace = 'onbuy' AND compete = 1 AND stock > 0 AND price IS NOT NULL AND source_price > 0
        AND (compete_checked_at IS NULL OR compete_checked_at < NOW(3) - INTERVAL ? SECOND)`,
    [tenantId, recheckS],
  );
  const backlog = Number(due?.n ?? 0);
  return {
    ok: true,
    msg: checked === 0 ? "No listings due for a competition check" : `Checked ${checked}: winning ${winning}, losing ${losing}, ${changed} repriced`,
    nextInS: backlog > 0 ? 30 : 120,
    progress: { done: checked, total: checked + backlog, note: `${batches} request${batches === 1 ? "" : "s"}` },
  };
}
