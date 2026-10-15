import { test } from "node:test";
import assert from "node:assert/strict";
import { COMMISSION_RULES } from "../config/fees.ts";
import {
  breakEvenPricePence,
  calculateFees,
  commissionPence,
  recommendedPricePence,
  roundDiv,
  type FeeInput,
} from "./fees.ts";

const base: FeeInput = {
  itemCostPence: 1000,
  supplierDeliveryPence: 0,
  packagingPence: 0,
  sellingPricePence: 2400,
  deliveryChargedPence: 0,
  vatRateBps: 2000,
  commission: COMMISSION_RULES.standard,
  otherFeeBps: 0,
  otherFeeFixedPence: 0,
};
const { sellingPricePence: _ignored, ...noPrice } = base;

test("roundDiv rounds half away from zero", () => {
  assert.equal(roundDiv(5, 2), 3);
  assert.equal(roundDiv(-5, 2), -3);
  assert.equal(roundDiv(4, 3), 1);
  assert.equal(roundDiv(0, 7), 0);
});

test("commission is charged on VAT-inclusive price plus delivery", () => {
  const r = calculateFees({ ...base, sellingPricePence: 2000, deliveryChargedPence: 400 });
  assert.equal(r.grossPence, 2400);
  assert.equal(r.commissionPence, 360); // 15% of £24.00, not of the ex-VAT amount
});

test("worked example: £24 inc VAT, £10 cost, 15% commission", () => {
  const r = calculateFees(base);
  assert.equal(r.vatPence, 400);
  assert.equal(r.netRevenuePence, 2000);
  assert.equal(r.commissionPence, 360);
  assert.equal(r.profitPence, 2000 - 360 - 1000);
  assert.equal(r.marginBps, 3200);
  assert.equal(r.roiBps, 6400);
});

test("minimum fee applies to cheap items", () => {
  assert.equal(commissionPence(100, COMMISSION_RULES.standard), 25); // 15p -> 25p
  assert.equal(commissionPence(0, COMMISSION_RULES.standard), 0);
});

test("banded commission is marginal", () => {
  // 8% of the first £10 plus 15% of the remaining £5.
  assert.equal(commissionPence(1500, COMMISSION_RULES.healthBabyFood), 80 + 75);
  assert.equal(commissionPence(1000, COMMISSION_RULES.healthBabyFood), 80);
});

test("zero everything gives zero and null ratios, not NaN", () => {
  const r = calculateFees({ ...base, itemCostPence: 0, sellingPricePence: 0 });
  assert.equal(r.profitPence, 0);
  assert.equal(r.marginBps, null);
  assert.equal(r.roiBps, null);
});

test("loss-making sale gives negative profit", () => {
  const r = calculateFees({ ...base, sellingPricePence: 1000 });
  assert.ok(r.profitPence < 0);
});

test("rounds to whole pence", () => {
  const r = calculateFees({ ...base, sellingPricePence: 999, itemCostPence: 0 });
  assert.equal(r.vatPence, 167); // 999/6 = 166.5 -> 167
  assert.equal(r.commissionPence, 150); // 149.85 -> 150
});

test("other fees: percentage plus fixed", () => {
  const r = calculateFees({ ...base, otherFeeBps: 200, otherFeeFixedPence: 10 });
  assert.equal(r.otherFeesPence, 48 + 10);
});

test("rejects floats and negatives", () => {
  assert.throws(() => calculateFees({ ...base, sellingPricePence: 24.5 }), RangeError);
  assert.throws(() => calculateFees({ ...base, itemCostPence: -1 }), RangeError);
});

test("break-even price is the lowest price with profit >= 0", () => {
  const p = breakEvenPricePence(noPrice);
  assert.notEqual(p, null);
  assert.ok(calculateFees({ ...base, sellingPricePence: p! }).profitPence >= 0);
  assert.ok(calculateFees({ ...base, sellingPricePence: p! - 1 }).profitPence < 0);
});

test("recommended price meets the target margin and one penny less does not", () => {
  const target = 2000; // 20%
  const p = recommendedPricePence(noPrice, target);
  assert.notEqual(p, null);
  const at = calculateFees({ ...base, sellingPricePence: p! });
  const below = calculateFees({ ...base, sellingPricePence: p! - 1 });
  assert.ok(at.marginBps! >= target);
  assert.ok(below.marginBps === null || below.marginBps < target);
});

test("recommended price with delivery charged and banded commission", () => {
  const input = { ...noPrice, commission: COMMISSION_RULES.healthBabyFood, deliveryChargedPence: 299 };
  const p = recommendedPricePence(input, 1500)!;
  assert.ok(calculateFees({ ...input, sellingPricePence: p }).marginBps! >= 1500);
  assert.ok(calculateFees({ ...input, sellingPricePence: p - 1 }).marginBps! < 1500);
});

test("impossible target returns null instead of looping", () => {
  const hopeless = { ...noPrice, commission: { label: "x", bands: [{ upToPence: null, rateBps: 9500 }], minFeePence: 0 } };
  assert.equal(recommendedPricePence(hopeless, 1000), null);
  assert.throws(() => recommendedPricePence(noPrice, 10000), RangeError);
});
