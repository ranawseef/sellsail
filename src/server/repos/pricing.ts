// Repricer settings and pricing bands for a workspace. Every function takes
// the tenant id first and filters on it.

import { marketplacePrice, validateBands, validateFees, type PricingBand, type PricingFees } from "../../lib/pricing.ts";
import { validateCompete, type CompeteSettings, type CompeteStrategy } from "../../lib/competition.ts";
import { parsePrefixes } from "../../lib/sku.ts";
import { exec, one, q, tx } from "../db/pool.ts";
import { listPrice, type RepriceConfig } from "../jobs/decide.ts";

export type RepricerSettings = {
  fees: PricingFees;
  inStockQty: number;
  outOfStockPrice: number;
  boostPct: number | null;
  skuPrefixes: string;
  prefixedOnly: boolean;
  compete: CompeteSettings;
};

export async function getBands(tenantId: number): Promise<PricingBand[]> {
  const rows = await q<{ up_to: number; profit_pct: number; fixed_profit: number; min_profit: number }>(
    "SELECT up_to, profit_pct, fixed_profit, min_profit FROM pricing_bands WHERE tenant_id = ? ORDER BY up_to",
    [tenantId],
  );
  return rows.map((r) => ({ upTo: Number(r.up_to), profitPct: Number(r.profit_pct), fixedProfit: Number(r.fixed_profit), minProfit: Number(r.min_profit) }));
}

export async function getSettings(tenantId: number): Promise<RepricerSettings> {
  const r = await one<{
    marketplace_fee_pct: number;
    payment_fee_pct: number;
    payment_fixed_fee: number;
    in_stock_qty: number;
    out_of_stock_price: number;
    boost_pct: number | null;
    sku_prefixes: string;
    prefixed_only: number;
    compete_enabled: number;
    compete_strategy: string;
    compete_beat_by: number;
    compete_max_undercut: number;
    compete_min_profit: number;
    compete_max_loss: number;
  }>("SELECT * FROM repricer_settings WHERE tenant_id = ?", [tenantId]);
  if (!r) throw new Error("Repricer settings missing for this workspace");
  return {
    fees: { marketplaceFeePct: Number(r.marketplace_fee_pct), paymentFeePct: Number(r.payment_fee_pct), paymentFixedFee: Number(r.payment_fixed_fee) },
    inStockQty: Number(r.in_stock_qty),
    outOfStockPrice: Number(r.out_of_stock_price),
    boostPct: r.boost_pct === null ? null : Number(r.boost_pct),
    skuPrefixes: r.sku_prefixes,
    prefixedOnly: Boolean(r.prefixed_only),
    compete: {
      enabled: Boolean(r.compete_enabled),
      strategy: (r.compete_strategy === "aggressive" ? "aggressive" : "profit") as CompeteStrategy,
      beatBy: Number(r.compete_beat_by),
      maxUndercut: Number(r.compete_max_undercut),
      minProfit: Number(r.compete_min_profit),
      maxLoss: Number(r.compete_max_loss),
    },
  };
}

export async function saveCompete(tenantId: number, c: CompeteSettings): Promise<string[]> {
  const errors = validateCompete(c);
  if (errors.length) return errors;
  await exec(
    `UPDATE repricer_settings SET compete_enabled = ?, compete_strategy = ?, compete_beat_by = ?, compete_max_undercut = ?,
       compete_min_profit = ?, compete_max_loss = ? WHERE tenant_id = ?`,
    [c.enabled ? 1 : 0, c.strategy, c.beatBy, c.maxUndercut, c.minProfit, c.maxLoss, tenantId],
  );
  return [];
}

export async function getRepriceConfig(tenantId: number): Promise<RepriceConfig & { settings: RepricerSettings; prefixes: string[] }> {
  const [bands, settings] = await Promise.all([getBands(tenantId), getSettings(tenantId)]);
  return {
    bands,
    fees: settings.fees,
    inStockQty: settings.inStockQty,
    outOfStockPrice: settings.outOfStockPrice,
    compete: settings.compete.enabled ? settings.compete : undefined,
    settings,
    prefixes: parsePrefixes(settings.skuPrefixes),
  };
}

/** Replaces the band list. Returns problems instead of saving when it is invalid. */
export async function saveBands(tenantId: number, bands: PricingBand[]): Promise<string[]> {
  const errors = validateBands(bands);
  if (errors.length) return errors;
  await tx(async (t) => {
    await t.exec("DELETE FROM pricing_bands WHERE tenant_id = ?", [tenantId]);
    for (const b of [...bands].sort((a, z) => a.upTo - z.upTo)) {
      await t.exec("INSERT INTO pricing_bands (tenant_id, up_to, profit_pct, fixed_profit, min_profit) VALUES (?, ?, ?, ?, ?)", [
        tenantId,
        b.upTo,
        b.profitPct,
        b.fixedProfit,
        b.minProfit,
      ]);
    }
  });
  return [];
}

export function validateSettings(s: Omit<RepricerSettings, "compete">): string[] {
  const errors = validateFees(s.fees);
  if (!Number.isInteger(s.inStockQty) || s.inStockQty < 1 || s.inStockQty > 999) errors.push("Stock to show must be a whole number from 1 to 999.");
  if (!(s.outOfStockPrice >= 1 && s.outOfStockPrice <= 99999)) errors.push("Out-of-stock price must be between £1 and £99,999.");
  if (s.boostPct !== null && (!Number.isInteger(s.boostPct) || s.boostPct < 1 || s.boostPct > 50)) errors.push("Boost must be a whole number from 1 to 50, or empty.");
  if (s.skuPrefixes.length > 255) errors.push("SKU prefixes are too long.");
  return errors;
}

export async function saveSettings(tenantId: number, s: Omit<RepricerSettings, "compete">): Promise<string[]> {
  const errors = validateSettings(s);
  if (errors.length) return errors;
  await exec(
    `UPDATE repricer_settings SET marketplace_fee_pct = ?, payment_fee_pct = ?, payment_fixed_fee = ?, in_stock_qty = ?,
       out_of_stock_price = ?, boost_pct = ?, sku_prefixes = ?, prefixed_only = ? WHERE tenant_id = ?`,
    [
      s.fees.marketplaceFeePct,
      s.fees.paymentFeePct,
      s.fees.paymentFixedFee,
      s.inStockQty,
      s.outOfStockPrice,
      s.boostPct,
      parsePrefixes(s.skuPrefixes).join(", "),
      s.prefixedOnly ? 1 : 0,
      tenantId,
    ],
  );
  return [];
}

/**
 * After bands, fees or competition settings change, re-price every in-stock listing from the Amazon
 * price we already hold, without calling Amazon. Out-of-stock listings are
 * left for their next Amazon read, which decides whether they can come back.
 * Returns how many listings changed price.
 */
export async function repriceLocally(tenantId: number): Promise<number> {
  const cfg = await getRepriceConfig(tenantId);
  let lastId = 0;
  let changed = 0;
  for (;;) {
    const rows = await q<{
      id: number;
      source_price: number;
      price: number | null;
      stock: number | null;
      compete: number;
      competitor_price: number | null;
      competitor_seen_at: Date | null;
    }>(
      `SELECT id, source_price, price, stock, compete, competitor_price, competitor_seen_at FROM products
        WHERE tenant_id = ? AND id > ? AND source_price > 0 AND stock > 0 AND source_fails = 0
        ORDER BY id LIMIT 500`,
      [tenantId, lastId],
    );
    if (rows.length === 0) break;
    lastId = rows[rows.length - 1].id;

    const updates: { id: number; price: number; stock: number; old: { price: number | null; stock: number | null }; source: number }[] = [];
    for (const r of rows) {
      const band = marketplacePrice(Number(r.source_price), cfg.bands, cfg.fees);
      const p =
        band === null
          ? null
          : listPrice(
              band,
              Number(r.source_price),
              {
                sourcePrice: Number(r.source_price),
                price: r.price,
                stock: r.stock,
                sourceFails: 0,
                compete: Boolean(r.compete),
                competitor: { price: r.competitor_price === null ? null : Number(r.competitor_price), seenAt: r.competitor_seen_at },
              },
              cfg,
            );
      const price = p ?? cfg.outOfStockPrice;
      const stock = p === null ? 0 : cfg.inStockQty;
      const oldPrice = r.price === null ? null : Number(r.price);
      if (oldPrice !== price || r.stock !== stock) {
        updates.push({ id: r.id, price, stock, old: { price: oldPrice, stock: r.stock }, source: Number(r.source_price) });
      }
    }
    if (updates.length === 0) continue;
    await tx(async (t) => {
      for (const u of updates) {
        await t.exec(
          "UPDATE products SET price = ?, stock = ?, source_error = IF(? = 0, 'Amazon price is above your highest band', NULL) WHERE id = ? AND tenant_id = ?",
          [u.price, u.stock, u.stock, u.id, tenantId],
        );
      }
      const values = updates.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
      await t.exec(
        `INSERT INTO price_history (tenant_id, product_id, source_price, old_price, new_price, old_stock, new_stock) VALUES ${values}`,
        updates.flatMap((u) => [tenantId, u.id, u.source, u.old.price, u.price, u.old.stock, u.stock]),
      );
    });
    changed += updates.length;
  }
  return changed;
}
