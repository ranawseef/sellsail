// Pure fee / profit maths. All money is integer pence, all rates are integer
// basis points (1% = 100), so there are no float money bugs. No dependencies,
// so the future repricing worker can reuse this file as is.

import type { CommissionRule } from "../config/fees.ts";

export type FeeInput = {
  itemCostPence: number;
  supplierDeliveryPence: number;
  packagingPence: number;
  /** Selling price the buyer sees, VAT included, delivery excluded. */
  sellingPricePence: number;
  /** Delivery charged to the customer, VAT included. */
  deliveryChargedPence: number;
  vatRateBps: number;
  commission: CommissionRule;
  /** Payment / other percentage fees, charged on the same base as commission. */
  otherFeeBps: number;
  otherFeeFixedPence: number;
};

export type FeeResult = {
  grossPence: number; // what the buyer pays (price + delivery, inc VAT)
  vatPence: number;
  netRevenuePence: number; // gross minus VAT
  commissionPence: number;
  otherFeesPence: number;
  costsPence: number; // item + supplier delivery + packaging
  profitPence: number; // can be negative
  /** null when there is no revenue to divide by. */
  marginBps: number | null;
  /** null when costs are zero. */
  roiBps: number | null;
};

/** Divide and round half away from zero, for integers. */
export function roundDiv(numerator: number, denominator: number): number {
  if (denominator === 0) throw new RangeError("division by zero");
  const sign = numerator < 0 !== denominator < 0 ? -1 : 1;
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  return sign * Math.floor((2 * n + d) / (2 * d));
}

function percentOf(pence: number, bps: number): number {
  return roundDiv(pence * bps, 10000);
}

function assertMoney(name: string, value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer (pence)`);
  }
}

/** Commission on a VAT-inclusive, delivery-inclusive amount, with banded rates and a minimum fee. */
export function commissionPence(grossPence: number, rule: CommissionRule): number {
  assertMoney("grossPence", grossPence);
  if (grossPence === 0) return 0;
  let total = 0;
  let bandStart = 0;
  for (const band of rule.bands) {
    const bandEnd = band.upToPence ?? Infinity;
    if (grossPence > bandStart) {
      const inBand = Math.min(grossPence, bandEnd) - bandStart;
      total += percentOf(inBand, band.rateBps);
    }
    bandStart = bandEnd;
    if (grossPence <= bandEnd) break;
  }
  return Math.max(total, rule.minFeePence);
}

export function calculateFees(input: FeeInput): FeeResult {
  assertMoney("itemCostPence", input.itemCostPence);
  assertMoney("supplierDeliveryPence", input.supplierDeliveryPence);
  assertMoney("packagingPence", input.packagingPence);
  assertMoney("sellingPricePence", input.sellingPricePence);
  assertMoney("deliveryChargedPence", input.deliveryChargedPence);
  assertMoney("otherFeeFixedPence", input.otherFeeFixedPence);

  const grossPence = input.sellingPricePence + input.deliveryChargedPence;
  // VAT is the part of a VAT-inclusive amount: gross * rate / (1 + rate).
  const vatPence = roundDiv(grossPence * input.vatRateBps, 10000 + input.vatRateBps);
  const netRevenuePence = grossPence - vatPence;
  const commission = commissionPence(grossPence, input.commission);
  const otherFeesPence =
    grossPence === 0 ? 0 : percentOf(grossPence, input.otherFeeBps) + input.otherFeeFixedPence;
  const costsPence = input.itemCostPence + input.supplierDeliveryPence + input.packagingPence;
  const profitPence = netRevenuePence - commission - otherFeesPence - costsPence;

  return {
    grossPence,
    vatPence,
    netRevenuePence,
    commissionPence: commission,
    otherFeesPence,
    costsPence,
    profitPence,
    marginBps: netRevenuePence === 0 ? null : roundDiv(profitPence * 10000, netRevenuePence),
    roiBps: costsPence === 0 ? null : roundDiv(profitPence * 10000, costsPence),
  };
}

// Upper limit for the price search: £100,000.
const MAX_PRICE_PENCE = 10_000_000;

/**
 * Lowest selling price (pence, VAT included, delivery excluded) that meets
 * `meets`. Profit rises with price, so a binary search over whole pence is
 * exact even with banded commission and the minimum fee. Null if no price up
 * to the cap works (e.g. fees at or above 100% of the price).
 */
function lowestPrice(
  input: Omit<FeeInput, "sellingPricePence">,
  meets: (r: FeeResult) => boolean,
): number | null {
  const at = (price: number) => calculateFees({ ...input, sellingPricePence: price });
  if (!meets(at(MAX_PRICE_PENCE))) return null;
  let lo = 0;
  let hi = MAX_PRICE_PENCE;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (meets(at(mid))) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/** Lowest price where profit is not negative. */
export function breakEvenPricePence(input: Omit<FeeInput, "sellingPricePence">): number | null {
  return lowestPrice(input, (r) => r.profitPence >= 0);
}

/** Lowest price that reaches `targetMarginBps` of net (ex-VAT) revenue. */
export function recommendedPricePence(
  input: Omit<FeeInput, "sellingPricePence">,
  targetMarginBps: number,
): number | null {
  if (!Number.isSafeInteger(targetMarginBps) || targetMarginBps < 0 || targetMarginBps >= 10000) {
    throw new RangeError("targetMarginBps must be an integer from 0 to 9999");
  }
  return lowestPrice(
    input,
    (r) => r.netRevenuePence > 0 && r.profitPence * 10000 >= targetMarginBps * r.netRevenuePence,
  );
}
