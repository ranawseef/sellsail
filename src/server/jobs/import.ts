// Import: bring the seller's OnBuy listings into SellSail.
//
// Pages through GET /v2/listings 500 at a time while offset < total_rows.
// OnBuy can return a short page in the middle of the list, so the offset
// always advances by the page size, never by the number of rows received.
// The position is kept in the job's state, so an import of 50,000 listings
// carries on across runs and restarts.

import { browseListings, BROWSE_PAGE, OnBuyError } from "../integrations/onbuy/client.ts";
import { skuImportReason, skuToAsin } from "../../lib/sku.ts";
import { EgressBlockedError } from "../net/egress.ts";
import { exec, one, q, tx } from "../db/pool.ts";
import { logEvent } from "../audit.ts";
import { proxyForJob, reportProxyError } from "../connections/proxy.ts";
import { markOnBuyStatus, onbuyTokens } from "../connections/onbuy.ts";
import { getRepriceConfig } from "../repos/pricing.ts";
import { ensureJob, rebalanceShards } from "./registry.ts";
import { planFor } from "../../config/plans.ts";
import { timeLeft, type JobCtx, type RunResult } from "./types.ts";

/** The network edge of this job, swapped out in tests. */
export const importDeps = { proxyForJob, onbuyTokens, browseListings };

export type ImportState = {
  offset: number;
  total: number;
  imported: number;
  skipped: number;
  overLimit: number;
  includeArchived: boolean;
  skipReasons: Record<string, number>;
};

export function newImportState(includeArchived: boolean): ImportState {
  return { offset: 0, total: 0, imported: 0, skipped: 0, overLimit: 0, includeArchived, skipReasons: {} };
}

export async function startOnBuyImport(tenantId: number, marketplaceAccountId: number, includeArchived: boolean): Promise<void> {
  await ensureJob(tenantId, "import", marketplaceAccountId, { runNow: true, enabled: true, state: newImportState(includeArchived) });
}

export type ImportRow = { sku: string; asin: string; title: string; opc: string; price: number | null; stock: number | null };

/**
 * Upserts listings, honouring archived SKUs and the plan's SKU limit.
 * Existing products keep their prices; only descriptive fields are refreshed.
 * Shared by the OnBuy import and the CSV upload.
 */
export async function upsertListings(
  tenantId: number,
  rows: readonly ImportRow[],
  opts: { includeArchived: boolean; maxSkus: number },
): Promise<{ imported: number; archivedSkipped: number; overLimit: number }> {
  if (rows.length === 0) return { imported: 0, archivedSkipped: 0, overLimit: 0 };
  const skus = rows.map((r) => r.sku);
  const archived = new Set(
    (await q<{ sku: string }>("SELECT sku FROM archived_skus WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku IN (?)", [tenantId, skus])).map((r) =>
      r.sku.toLowerCase(),
    ),
  );
  const existing = new Set(
    (await q<{ sku: string }>("SELECT sku FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku IN (?)", [tenantId, skus])).map((r) =>
      r.sku.toLowerCase(),
    ),
  );
  const count = Number((await one<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE tenant_id = ?", [tenantId]))?.n ?? 0);
  let room = Math.max(0, opts.maxSkus - count);

  let archivedSkipped = 0;
  let overLimit = 0;
  const keep: ImportRow[] = [];
  for (const r of rows) {
    const key = r.sku.toLowerCase();
    if (archived.has(key) && !opts.includeArchived) {
      archivedSkipped++;
      continue;
    }
    if (!existing.has(key)) {
      if (room <= 0) {
        overLimit++;
        continue;
      }
      room--;
    }
    keep.push(r);
  }
  if (keep.length === 0) return { imported: 0, archivedSkipped, overLimit };

  await tx(async (t) => {
    if (opts.includeArchived) {
      await t.exec("DELETE FROM archived_skus WHERE tenant_id = ? AND marketplace = 'onbuy' AND sku IN (?)", [tenantId, keep.map((k) => k.sku)]);
    }
    const values = keep.map(() => "(?, 'onbuy', ?, 'amazon', ?, ?, ?, ?, ?)").join(", ");
    await t.exec(
      `INSERT INTO products (tenant_id, marketplace, sku, source, source_ref, opc, title, pushed_price, pushed_stock)
       VALUES ${values}
       ON DUPLICATE KEY UPDATE source_ref = VALUES(source_ref),
         opc = COALESCE(NULLIF(VALUES(opc), ''), opc),
         title = COALESCE(NULLIF(VALUES(title), ''), title)`,
      keep.flatMap((k) => [tenantId, k.sku, k.asin, k.opc || null, k.title || null, k.price, k.stock]),
    );
  });
  return { imported: keep.length, archivedSkipped, overLimit };
}

export async function runImport(ctx: JobCtx): Promise<RunResult> {
  const { tenantId, targetId: accountId } = ctx;
  const state = { ...newImportState(false), ...(ctx.state as Partial<ImportState>) } as ImportState;
  const account = await one<{ id: number }>("SELECT id FROM marketplace_accounts WHERE id = ? AND tenant_id = ? AND marketplace = 'onbuy'", [
    accountId,
    tenantId,
  ]);
  if (!account) return { ok: false, msg: "OnBuy account was removed", disable: true };

  const { proxy, reason } = await importDeps.proxyForJob(tenantId);
  if (!proxy) return { ok: false, msg: `Nothing sent: ${reason}`, nextInS: 300, state };

  const cfg = await getRepriceConfig(tenantId);
  const tenant = await one<{ plan: string }>("SELECT plan FROM tenants WHERE id = ?", [tenantId]);
  const maxSkus = planFor(tenant?.plan).maxSkus;
  const tokens = importDeps.onbuyTokens(tenantId, proxy);

  while (timeLeft(ctx) > 30_000) {
    if (await ctx.shouldStop()) break;
    let page;
    try {
      page = await importDeps.browseListings(proxy, tokens, state.offset, BROWSE_PAGE);
    } catch (err) {
      if (await reportProxyError(tenantId, err)) return { ok: false, msg: "Proxy failed; import paused", nextInS: 300, state };
      if (err instanceof EgressBlockedError) return { ok: false, msg: err.message, nextInS: 300, state };
      if (err instanceof OnBuyError && (err.status === 401 || err.status === 403)) {
        await markOnBuyStatus(tenantId, false, err.message);
      }
      return { ok: false, msg: `Import paused: ${(err as Error).message}`, nextInS: 300, state };
    }
    state.total = page.totalRows;

    const rows: ImportRow[] = [];
    for (const l of page.listings) {
      const why = skuImportReason(l.sku, cfg.prefixes, cfg.settings.prefixedOnly);
      if (why) {
        state.skipped++;
        state.skipReasons[why] = (state.skipReasons[why] ?? 0) + 1;
        continue;
      }
      rows.push({ sku: l.sku, asin: skuToAsin(l.sku, cfg.prefixes).toUpperCase(), title: l.name, opc: l.opc, price: l.price, stock: l.stock });
    }
    const res = await upsertListings(tenantId, rows, { includeArchived: state.includeArchived, maxSkus });
    state.imported += res.imported;
    state.overLimit += res.overLimit;
    if (res.archivedSkipped) {
      state.skipped += res.archivedSkipped;
      state.skipReasons["archived (OnBuy said the SKU doesn't exist)"] = (state.skipReasons["archived (OnBuy said the SKU doesn't exist)"] ?? 0) + res.archivedSkipped;
    }

    state.offset += BROWSE_PAGE;
    await ctx.heartbeat();
    if (state.offset >= state.total) break;
  }

  await markOnBuyStatus(tenantId, true);
  const done = state.offset >= state.total;
  const progress = { done: Math.min(state.offset, state.total), total: state.total, note: `${state.imported} imported, ${state.skipped} skipped` };
  if (!done) return { ok: true, msg: `Importing: ${progress.done} of ${state.total} listings read`, nextInS: 2, state, progress };

  await rebalanceShards(tenantId);
  await exec("UPDATE tenants SET onboarded_at = COALESCE(onboarded_at, NOW(3)) WHERE id = ?", [tenantId]);
  const limitNote = state.overLimit ? ` ${state.overLimit} not imported: your plan allows ${maxSkus} SKUs.` : "";
  await logEvent(tenantId, state.overLimit ? "warn" : "info", "import", `OnBuy import finished: ${state.imported} listings imported, ${state.skipped} skipped.${limitNote}`);
  return { ok: true, msg: `Import finished: ${state.imported} imported, ${state.skipped} skipped${state.overLimit ? `, ${state.overLimit} over plan limit` : ""}`, disable: true, state, progress };
}
