// Competition pricing: undercut the OnBuy leader down to the seller's floor,
// never above the band price.

import { test } from "node:test";
import assert from "node:assert/strict";
import { competeFloor, competitivePrice, competitorUsable, COMPETITOR_TTL_H, DEFAULT_COMPETE, validateCompete, type CompeteSettings } from "../src/lib/competition.ts";
import { readWinningResults } from "../src/server/integrations/onbuy/client.ts";
import { listPrice, type RepriceConfig } from "../src/server/jobs/decide.ts";
import { DEFAULT_BANDS } from "../src/lib/pricing.ts";

const fees = { marketplaceFeePct: 18, paymentFeePct: 0, paymentFixedFee: 0 };
const now = new Date("2026-10-25T12:00:00Z");
const fresh = (price: number) => ({ price, seenAt: new Date(now.getTime() - 60_000) });
const on: CompeteSettings = { ...DEFAULT_COMPETE, enabled: true };

test("profit floor keeps the minimum profit after fees", () => {
  // (20 + 1) / 0.82 = 25.609… -> 25.61
  assert.equal(competeFloor(20, fees, { ...on, minProfit: 1 }), 25.61);
  // aggressive with £2 loss: (20 - 2) / 0.82 = 21.95
  assert.equal(competeFloor(20, fees, { ...on, strategy: "aggressive", maxLoss: 2 }), 21.95);
  // never below the absolute floor
  assert.equal(competeFloor(0.1, fees, { ...on, strategy: "aggressive", maxLoss: 5 }), 0.5);
});

test("undercuts the leader by beat-by when above the floor", () => {
  const r = competitivePrice(30, 20, fresh(28), fees, on, now);
  assert.deepEqual([r.price, r.reason], [27.95, "undercut"]);
});

test("stops at the floor when the leader is too cheap", () => {
  const r = competitivePrice(30, 20, fresh(22), fees, on, now);
  assert.deepEqual([r.price, r.reason], [25.61, "floor"]);
});

test("never raises above the band price", () => {
  assert.equal(competitivePrice(30, 20, fresh(35), fees, on, now).price, 30);
  assert.equal(competitivePrice(30, 20, fresh(30.02), fees, on, now).price, 30);
  // floor above the band price (min profit bigger than the band's): band wins
  assert.equal(competitivePrice(24, 20, fresh(22), fees, { ...on, minProfit: 5 }, now).price, 24);
});

test("max undercut caps a large beat-by", () => {
  const r = competitivePrice(30, 20, fresh(28), fees, { ...on, beatBy: 3, maxUndercut: 1 }, now);
  assert.equal(r.price, 27);
});

test("off, stale or missing competitor: band price", () => {
  assert.equal(competitivePrice(30, 20, fresh(28), fees, { ...on, enabled: false }, now).price, 30);
  assert.equal(competitivePrice(30, 20, null, fees, on, now).price, 30);
  const stale = { price: 28, seenAt: new Date(now.getTime() - (COMPETITOR_TTL_H * 3600 + 1) * 1000) };
  assert.equal(competitorUsable(stale, now), false);
  assert.equal(competitivePrice(30, 20, stale, fees, on, now).price, 30);
});

test("listPrice respects the listing's own switch", () => {
  const cfg: RepriceConfig = { bands: DEFAULT_BANDS, fees, inStockQty: 3, outOfStockPrice: 999, compete: on };
  const state = { sourcePrice: 20, price: 30, stock: 3, sourceFails: 0, competitor: fresh(28) };
  assert.equal(listPrice(30, 20, state, cfg, now), 27.95);
  assert.equal(listPrice(30, 20, { ...state, compete: false }, cfg, now), 30);
  assert.equal(listPrice(30, 20, state, { ...cfg, compete: undefined }, now), 30);
});

test("validation catches nonsense settings", () => {
  assert.deepEqual(validateCompete(on), []);
  assert.ok(validateCompete({ ...on, beatBy: 0 }).length > 0);
  assert.ok(validateCompete({ ...on, beatBy: 2, maxUndercut: 1 }).length > 0);
});

test("reads check-winning results defensively", () => {
  const r = readWinningResults({
    success: true,
    results: [
      { sku: "B0AAA", winning: true, lead_price: "19.99" },
      { sku: "B0BBB", winning: false, lead_price: 12.5 },
      { sku: "B0CCC", winning: 0 },
      { nope: 1 },
      "junk",
    ],
  });
  assert.deepEqual(r, [
    { sku: "B0AAA", winning: true, leadPrice: 19.99 },
    { sku: "B0BBB", winning: false, leadPrice: 12.5 },
    { sku: "B0CCC", winning: false, leadPrice: null },
  ]);
  assert.deepEqual(readWinningResults(null), []);
});
