// The repricer's per-item decision rules.

import { test } from "node:test";
import assert from "node:assert/strict";
import { batchLooksBroken, decide, listingChanged, type ProductState, type RepriceConfig } from "../src/server/jobs/decide.ts";
import { marketplacePrice } from "../src/lib/pricing.ts";

const cfg: RepriceConfig = {
  bands: [
    { upTo: 50, profitPct: 20, fixedProfit: 0, minProfit: 2 },
    { upTo: 100, profitPct: 15, fixedProfit: 0, minProfit: 5 },
  ],
  fees: { marketplaceFeePct: 15, paymentFeePct: 0, paymentFixedFee: 0 },
  inStockQty: 3,
  outOfStockPrice: 999,
};
const fresh: ProductState = { sourcePrice: null, price: null, stock: null, sourceFails: 0 };
const ok = (landedPrice: number) => ({ asin: "B000000001", kind: "ok" as const, landedPrice });

test("an FBA offer is priced with the band formula and given stock", () => {
  const d = decide(fresh, ok(20), cfg);
  assert.equal(d.kind, "priced");
  if (d.kind !== "priced") return;
  assert.equal(d.price, marketplacePrice(20, cfg.bands, cfg.fees));
  assert.equal(d.stock, 3);
  assert.equal(d.sourcePrice, 20);
});

test("no qualifying offer or an unknown ASIN goes out of stock at once", () => {
  for (const r of [ok(0), { asin: "B1", kind: "permanent" as const, status: 404 }, { asin: "B1", kind: "permanent" as const, status: 400 }]) {
    const d = decide({ ...fresh, price: 25, stock: 3, sourcePrice: 20 }, r, cfg);
    assert.equal(d.kind, "oos");
    if (d.kind === "oos") {
      assert.equal(d.stock, 0);
      assert.equal(d.price, 999);
    }
  }
});

test("temporary errors retry twice, then go out of stock on the third", () => {
  const throttled = { asin: "B1", kind: "temporary" as const, status: 429 };
  let state: ProductState = { sourcePrice: 20, price: 28.24, stock: 3, sourceFails: 0 };
  let d = decide(state, throttled, cfg);
  assert.deepEqual(d, { kind: "retry", fails: 1, error: "Amazon error 429" });
  state = { ...state, sourceFails: 1 };
  assert.equal(decide(state, undefined, cfg).kind, "retry"); // missing from the batch counts too
  state = { ...state, sourceFails: 2 };
  d = decide(state, throttled, cfg);
  assert.equal(d.kind, "oos");
  if (d.kind === "oos") assert.equal(d.fails, 3);
});

test("a success clears the failure count", () => {
  const d = decide({ ...fresh, sourceFails: 2 }, ok(20), cfg);
  assert.equal(d.kind, "priced");
  assert.equal(d.fails, 0);
});

test("a price above the highest band is never sold at no profit", () => {
  const d = decide(fresh, ok(100.01), cfg);
  assert.equal(d.kind, "oos");
});

test("a >60% price drop is only trusted after three reads in a row", () => {
  let state: ProductState = { sourcePrice: 50, price: 70, stock: 3, sourceFails: 0 };
  let d = decide(state, ok(10), cfg);
  assert.equal(d.kind, "retry");
  state = { ...state, sourceFails: 1 };
  assert.equal(decide(state, ok(10), cfg).kind, "retry");
  state = { ...state, sourceFails: 2 };
  d = decide(state, ok(10), cfg);
  assert.equal(d.kind, "priced");
  // A normal drop is applied straight away.
  assert.equal(decide({ sourcePrice: 50, price: 70, stock: 3, sourceFails: 0 }, ok(30), cfg).kind, "priced");
});

test("a whole batch suddenly without offers is treated as a glitch", () => {
  const empty = Array.from({ length: 20 }, () => ok(0));
  assert.equal(batchLooksBroken(empty, Array(20).fill(true)), true);
  const mixed = [...empty.slice(0, 19), ok(12)];
  assert.equal(batchLooksBroken(mixed, Array(20).fill(true)), false);
  assert.equal(batchLooksBroken(empty.slice(0, 5), Array(5).fill(true)), false); // too few to judge
  assert.equal(batchLooksBroken(empty, Array(20).fill(false)), false); // nothing was in stock anyway
});

test("history is written only when price or stock changes", () => {
  const state: ProductState = { sourcePrice: 20, price: 28.24, stock: 3, sourceFails: 0 };
  const same = decide(state, ok(20), cfg);
  assert.equal(listingChanged({ ...state, price: same.kind === "priced" ? same.price : 0 }, same), false);
  assert.equal(listingChanged(state, decide(state, ok(0), cfg)), true);
  assert.equal(listingChanged(state, { kind: "retry", fails: 1, error: "x" }), false);
});
