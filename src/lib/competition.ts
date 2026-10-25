// Competition pricing: undercut the OnBuy listing that is beating ours, but
// never below a floor the seller chose. Pure, shared by the repricer, the
// competition job, the settings preview and the tests.
//
// Learned from the single-seller repricer (OnBuy /listings/check-winning):
//   target = leader's price - beat_by, but never more than max_undercut below it
// Changed here:
//   - the floor is fee-aware. "profit" keeps at least min_profit per sale after
//     OnBuy and payment fees; "aggressive" accepts a loss of up to max_loss.
//     (The old "profit" floor was the band price itself, so it never moved.)
//   - competition only ever lowers a price: the band price stays the ceiling.
//   - a competitor price is trusted for COMPETITOR_TTL_H after it was last
//     seen. While we are winning it is kept, so the price doesn't jump back up
//     and lose again; once it is that old, the band price is tried again.

import { phpRound, type PricingFees } from "./pricing.ts";

export type CompeteStrategy = "profit" | "aggressive";

export type CompeteSettings = {
  enabled: boolean;
  strategy: CompeteStrategy;
  /** Pounds below the leader to price at, e.g. 0.05. */
  beatBy: number;
  /** Never more than this many pounds below the leader. */
  maxUndercut: number;
  /** "profit": the least profit per sale, after fees. */
  minProfit: number;
  /** "aggressive": the most we'll lose per sale, after fees. */
  maxLoss: number;
};

export const DEFAULT_COMPETE: CompeteSettings = {
  enabled: false,
  strategy: "profit",
  beatBy: 0.05,
  maxUndercut: 2,
  minProfit: 1,
  maxLoss: 0,
};

export const COMPETITOR_TTL_H = 6;
/** No listing is priced below this, whatever the settings say. */
export const ABSOLUTE_FLOOR = 0.5;

export type Competitor = { price: number | null; seenAt: Date | null } | null;

/** The lowest price the settings allow for a source cost. */
export function competeFloor(sourcePrice: number, fees: PricingFees, s: CompeteSettings): number | null {
  const down = 1 - fees.marketplaceFeePct / 100 - fees.paymentFeePct / 100;
  if (!(down > 0) || !(sourcePrice > 0)) return null;
  const keep = s.strategy === "aggressive" ? -s.maxLoss : s.minProfit;
  return Math.max(ABSOLUTE_FLOOR, phpRound((sourcePrice + keep + fees.paymentFixedFee) / down, 2));
}

/** Is a stored competitor price still fresh enough to price against? */
export function competitorUsable(c: Competitor, now = new Date()): c is { price: number; seenAt: Date } {
  if (!c || c.price === null || !(c.price > 0) || !c.seenAt) return false;
  return now.getTime() - c.seenAt.getTime() < COMPETITOR_TTL_H * 3600_000;
}

export type CompeteResult = {
  price: number;
  /** "band" no competitor to answer; "undercut" priced under the leader;
   *  "floor" the leader is below our floor, so we stop at the floor. */
  reason: "band" | "undercut" | "floor";
  floor: number | null;
};

/**
 * The price to list at, given the band price and the leader's price.
 * Never above the band price, never below the floor.
 */
export function competitivePrice(
  bandPrice: number,
  sourcePrice: number,
  competitor: Competitor,
  fees: PricingFees,
  s: CompeteSettings,
  now = new Date(),
): CompeteResult {
  const floor = competeFloor(sourcePrice, fees, s);
  if (!s.enabled || !competitorUsable(competitor, now) || floor === null) return { price: bandPrice, reason: "band", floor };
  const lead = competitor.price;
  if (lead > bandPrice) return { price: bandPrice, reason: "band", floor };

  let target = lead - Math.max(0, s.beatBy);
  target = Math.max(target, lead - Math.max(0, s.maxUndercut));
  target = phpRound(target, 2);
  if (target >= bandPrice) return { price: bandPrice, reason: "band", floor };
  if (target < floor) return { price: Math.min(bandPrice, floor), reason: floor >= bandPrice ? "band" : "floor", floor };
  return { price: target, reason: "undercut", floor };
}

export function validateCompete(s: CompeteSettings): string[] {
  const errors: string[] = [];
  if (!(s.beatBy >= 0.01 && s.beatBy <= 5)) errors.push("Beat by must be between 1p and £5.");
  if (!(s.maxUndercut >= 0.01 && s.maxUndercut <= 100)) errors.push("Max undercut must be between 1p and £100.");
  if (s.maxUndercut < s.beatBy) errors.push("Max undercut can't be smaller than beat by.");
  if (!(s.minProfit >= 0 && s.minProfit <= 500)) errors.push("Minimum profit must be between £0 and £500.");
  if (!(s.maxLoss >= 0 && s.maxLoss <= 50)) errors.push("Maximum loss must be between £0 and £50.");
  if (s.strategy !== "profit" && s.strategy !== "aggressive") errors.push("Choose a strategy.");
  return errors;
}
