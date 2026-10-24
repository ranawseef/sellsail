// Repricer pricing maths. Pure and dependency-free so the worker, the
// pricing-rules editor preview and the tests all use exactly one copy.
//
// Ported from the single-seller app's get_onbuy_price(). The formula is a
// business rule sellers already rely on, so it is kept exactly:
//
//   amz = round(amz_price, 2)
//   if amz * pct/100 >= min_profit:  top = amz * (1 + pct/100) + fixed + a3
//   else:                            top = amz + min_profit + fixed + a3
//   price = round(top / (1 - a1/100 - a2/100), 2)
//
// a1 = marketplace fee %, a2 = payment fee %, a3 = payment fixed fee.

export type PricingBand = {
  /** Highest source price (inclusive) this band covers. Bands are sorted by this. */
  upTo: number;
  profitPct: number;
  fixedProfit: number;
  minProfit: number;
};

export type PricingFees = {
  marketplaceFeePct: number; // a1
  paymentFeePct: number; // a2
  paymentFixedFee: number; // a3
};

// The reference app's nine bands. New tenants start from these values so the
// repricer behaves the same as before until the seller edits them.
export const DEFAULT_BAND_LIMITS = [10, 20, 30, 50, 100, 150, 250, 500, 9999] as const;

export const MAX_SOURCE_PRICE = 9999;

// Starting margins for a new workspace, on the limits above. These are
// SellSail's suggestion, not the reference app's figures: the seller reviews
// them in onboarding before anything is priced. Percentages fall and minimum
// profits rise with price so cheap items still earn and dear items stay
// competitive.
export const DEFAULT_BANDS: readonly PricingBand[] = [
  { upTo: 10, profitPct: 30, fixedProfit: 0, minProfit: 2 },
  { upTo: 20, profitPct: 25, fixedProfit: 0, minProfit: 3 },
  { upTo: 30, profitPct: 22, fixedProfit: 0, minProfit: 4.5 },
  { upTo: 50, profitPct: 20, fixedProfit: 0, minProfit: 6 },
  { upTo: 100, profitPct: 18, fixedProfit: 0, minProfit: 9 },
  { upTo: 150, profitPct: 16, fixedProfit: 0, minProfit: 15 },
  { upTo: 250, profitPct: 15, fixedProfit: 0, minProfit: 22 },
  { upTo: 500, profitPct: 12, fixedProfit: 0, minProfit: 35 },
  { upTo: 9999, profitPct: 10, fixedProfit: 0, minProfit: 50 },
];

/**
 * Round half away from zero to `places`, the way PHP's round() does.
 *
 * Plain Math.round(x * 100) / 100 gets 1.005 wrong (1.005 * 100 is
 * 100.49999…). PHP rounds the decimal the value represents, so we first take
 * the shortest-ish decimal form (15 significant digits, what PHP's precision
 * uses) and shift the exponent in the string, never by multiplying.
 */
export function phpRound(value: number, places = 2): number {
  if (!Number.isFinite(value) || Math.abs(value) >= 1e15) return value;
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const shifted = Number(`${Number(abs.toPrecision(15))}e${places}`);
  const rounded = Math.floor(shifted + 0.5);
  return sign * Number(`${rounded}e-${places}`);
}

/**
 * The band for a source price, or null when the price is above the last band.
 * Bands are contiguous: a band covers (previous upTo, upTo]. Prices are
 * rounded to pence first so 19.99 + 0.02 = 20.00999… lands in the 20 band
 * rather than falling between two.
 */
export function bandFor(bands: readonly PricingBand[], sourcePrice: number): PricingBand | null {
  const p = phpRound(sourcePrice, 2);
  const sorted = [...bands].sort((a, b) => a.upTo - b.upTo);
  for (const band of sorted) {
    if (p <= band.upTo) return band;
  }
  return null;
}

/**
 * Marketplace selling price for a source (Amazon) price.
 * Returns null when no band covers the price. The old app silently priced
 * those at zero profit; we refuse to price them instead, so the caller takes
 * the listing out of stock.
 */
export function marketplacePrice(
  sourcePrice: number,
  bands: readonly PricingBand[],
  fees: PricingFees,
): number | null {
  const amz = phpRound(sourcePrice, 2);
  if (!(amz > 0)) return null;

  const band = bandFor(bands, amz);
  if (!band) return null;

  const pct = band.profitPct;
  const dimProfit = (amz * pct) / 100;

  let top: number;
  if (dimProfit >= band.minProfit) {
    top = amz * (1 + pct / 100) + band.fixedProfit + fees.paymentFixedFee;
  } else {
    top = amz + band.minProfit + band.fixedProfit + fees.paymentFixedFee;
  }

  const down = 1 - fees.marketplaceFeePct / 100 - fees.paymentFeePct / 100;
  if (!(down > 0)) return null; // fees of 100%+ can never be priced

  return phpRound(top / down, 2);
}

/** What the seller keeps on one sale at `price`, before VAT and delivery. */
export function estimatedProfit(sourcePrice: number, price: number, fees: PricingFees): number {
  const feesTaken =
    (price * fees.marketplaceFeePct) / 100 + (price * fees.paymentFeePct) / 100 + fees.paymentFixedFee;
  return phpRound(price - feesTaken - phpRound(sourcePrice, 2), 2);
}

/** Checks a band list a seller has edited. Returns problems in plain words. */
export function validateBands(bands: readonly PricingBand[]): string[] {
  const errors: string[] = [];
  if (bands.length === 0) errors.push("Add at least one price band.");
  if (bands.length > 30) errors.push("Use 30 bands or fewer.");
  const sorted = [...bands].sort((a, b) => a.upTo - b.upTo);
  const seen = new Set<number>();
  sorted.forEach((b, i) => {
    const label = `Band ${i + 1}`;
    if (!(b.upTo > 0) || b.upTo > MAX_SOURCE_PRICE) errors.push(`${label}: the upper limit must be between £0.01 and £${MAX_SOURCE_PRICE}.`);
    if (seen.has(b.upTo)) errors.push(`${label}: two bands end at £${b.upTo}.`);
    seen.add(b.upTo);
    if (b.profitPct < 0 || b.profitPct > 500) errors.push(`${label}: profit % must be between 0 and 500.`);
    if (b.fixedProfit < 0 || b.fixedProfit > 1000) errors.push(`${label}: fixed profit must be between £0 and £1000.`);
    if (b.minProfit < 0 || b.minProfit > 1000) errors.push(`${label}: minimum profit must be between £0 and £1000.`);
  });
  return errors;
}

export function validateFees(fees: PricingFees): string[] {
  const errors: string[] = [];
  if (fees.marketplaceFeePct < 0 || fees.marketplaceFeePct > 60) errors.push("Marketplace fee % must be between 0 and 60.");
  if (fees.paymentFeePct < 0 || fees.paymentFeePct > 30) errors.push("Payment fee % must be between 0 and 30.");
  if (fees.paymentFixedFee < 0 || fees.paymentFixedFee > 50) errors.push("Payment fixed fee must be between £0 and £50.");
  if (fees.marketplaceFeePct + fees.paymentFeePct >= 90) errors.push("Fees add up to 90% or more, so no price can cover them.");
  return errors;
}
