// What the repricer does with one Amazon answer. Pure, so every rule is
// tested without a database or network.
//
// Rules carried over from the single-seller repricer:
//   - priced:  FBA offer available now within 48h -> band formula, stock = in_stock_qty
//   - no qualifying offer, or Amazon says 400/404 for the item -> out of stock at once
//   - throttled / 5xx / missing from the batch -> retry; out of stock after 3 failures
// Safety brakes added here:
//   - a source price that drops by more than 60% must be seen 3 times in a row
//     before it is used, so one bad offer can't undercut the listing
//   - a price above the highest band is never sold at zero profit: out of stock
// Competition (lib/competition.ts) can then lower the band price to undercut
// the OnBuy leader, down to the seller's floor.

import { marketplacePrice, type PricingBand, type PricingFees } from "../../lib/pricing.ts";
import { competitivePrice, type CompeteSettings, type Competitor } from "../../lib/competition.ts";
import type { ItemOfferResult } from "../integrations/amazon/offers.ts";

export const MAX_SOURCE_FAILS = 3;
export const DROP_GUARD_RATIO = 0.4;

export type RepriceConfig = {
  bands: readonly PricingBand[];
  fees: PricingFees;
  inStockQty: number;
  outOfStockPrice: number;
  /** Competition settings; absent means competition is off. */
  compete?: CompeteSettings;
};

export type ProductState = {
  sourcePrice: number | null;
  price: number | null;
  stock: number | null;
  sourceFails: number;
  /** The listing's own competition switch (default on) and the leader's last price. */
  compete?: boolean;
  competitor?: Competitor;
};

/** The band price, lowered by competition when the settings and the listing allow it. */
export function listPrice(bandPrice: number, sourcePrice: number, state: ProductState, cfg: RepriceConfig, now = new Date()): number {
  if (!cfg.compete || state.compete === false) return bandPrice;
  return competitivePrice(bandPrice, sourcePrice, state.competitor ?? null, cfg.fees, cfg.compete, now).price;
}

export type Decision =
  | { kind: "priced"; sourcePrice: number; price: number; stock: number; fails: 0; error: null }
  | { kind: "oos"; sourcePrice: number | null; price: number; stock: 0; fails: number; error: string }
  | { kind: "retry"; fails: number; error: string };

function outOfStock(cfg: RepriceConfig, error: string, sourcePrice: number | null, fails = 0): Decision {
  return { kind: "oos", sourcePrice, price: cfg.outOfStockPrice, stock: 0, fails, error };
}

export function decide(state: ProductState, result: ItemOfferResult | undefined, cfg: RepriceConfig): Decision {
  if (!result || result.kind === "temporary") {
    const fails = state.sourceFails + 1;
    const why = result ? `Amazon error ${result.status || "unknown"}` : "Missing from Amazon's answer";
    if (fails >= MAX_SOURCE_FAILS) return outOfStock(cfg, `${why}, ${fails} times in a row`, state.sourcePrice, fails);
    return { kind: "retry", fails, error: why };
  }

  if (result.kind === "permanent") return outOfStock(cfg, `Amazon doesn't list this ASIN (HTTP ${result.status})`, null);

  const landed = Math.round(result.landedPrice * 100) / 100;
  if (!(landed > 0)) return outOfStock(cfg, "No FBA offer available now with 48h dispatch", null);

  const prev = state.sourcePrice;
  if (prev !== null && prev > 0 && landed < prev * DROP_GUARD_RATIO && state.sourceFails < MAX_SOURCE_FAILS - 1) {
    return { kind: "retry", fails: state.sourceFails + 1, error: `Price fell from £${prev.toFixed(2)} to £${landed.toFixed(2)}; checking again` };
  }

  const price = marketplacePrice(landed, cfg.bands, cfg.fees);
  if (price === null) return outOfStock(cfg, `Amazon price £${landed.toFixed(2)} is above your highest band`, landed);
  return { kind: "priced", sourcePrice: landed, price: listPrice(price, landed, state, cfg), stock: cfg.inStockQty, fails: 0, error: null };
}

/**
 * A batch where every item that was in stock comes back with no offer at all
 * looks like an Amazon glitch, not a mass sell-out. Treat it as a temporary
 * failure so nothing goes out of stock on one bad answer.
 */
export function batchLooksBroken(results: readonly (ItemOfferResult | undefined)[], wasInStock: readonly boolean[]): boolean {
  const inStock = wasInStock.filter(Boolean).length;
  if (results.length < 10 || inStock < 10) return false;
  return results.every((r, i) => !wasInStock[i] || (r?.kind === "ok" && r.landedPrice === 0));
}

/** Did the listing change in a way worth a price_history row? */
export function listingChanged(state: ProductState, d: Decision): boolean {
  if (d.kind === "retry") return false;
  return state.price !== d.price || state.stock !== d.stock;
}
