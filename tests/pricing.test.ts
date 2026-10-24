// The pricing formula must give the same answer as the PHP repricer it
// replaces. tests/fixtures/pricing-php.json was produced by running the
// original get_onbuy_price() logic under PHP 8.5 on random fees and bands.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_BAND_LIMITS,
  bandFor,
  marketplacePrice,
  phpRound,
  validateBands,
  validateFees,
  type PricingBand,
} from "../src/lib/pricing.ts";

type Case = { amz: number; fees: [number, number, number]; bands: [number, number, number][]; expected: number | null };
const fixture = JSON.parse(readFileSync(new URL("./fixtures/pricing-php.json", import.meta.url), "utf8")) as {
  php: string;
  cases: Case[];
};

test("matches the PHP repricer on every recorded case", () => {
  assert.ok(fixture.cases.length > 1000);
  let checked = 0;
  for (const c of fixture.cases) {
    const bands: PricingBand[] = c.bands.map(([profitPct, fixedProfit, minProfit], i) => ({
      upTo: DEFAULT_BAND_LIMITS[i],
      profitPct,
      fixedProfit,
      minProfit,
    }));
    const fees = { marketplaceFeePct: c.fees[0], paymentFeePct: c.fees[1], paymentFixedFee: c.fees[2] };
    const got = marketplacePrice(c.amz, bands, fees);
    assert.equal(got, c.expected, `amz ${c.amz} fees ${c.fees.join("/")}`);
    checked++;
  }
  assert.equal(checked, fixture.cases.length);
});

test("phpRound rounds half away from zero on the decimal value", () => {
  assert.equal(phpRound(1.005), 1.01); // Math.round(1.005 * 100) / 100 gives 1
  assert.equal(phpRound(2.675), 2.68);
  assert.equal(phpRound(1.004999), 1.0);
  assert.equal(phpRound(-1.005), -1.01);
  assert.equal(phpRound(19.99 + 0.02), 20.01);
  assert.equal(phpRound(0), 0);
});

test("prices sitting between two bands after float maths land in the right band", () => {
  const bands: PricingBand[] = [
    { upTo: 10, profitPct: 10, fixedProfit: 0, minProfit: 0 },
    { upTo: 20, profitPct: 20, fixedProfit: 0, minProfit: 0 },
    { upTo: 30, profitPct: 30, fixedProfit: 0, minProfit: 0 },
  ];
  assert.equal(bandFor(bands, 19.99 + 0.01)?.profitPct, 20); // 20.000000000000004 → 20.00
  assert.equal(bandFor(bands, 20.004)?.profitPct, 20);
  assert.equal(bandFor(bands, 20.005)?.profitPct, 30); // rounds to 20.01
});

test("no band above the last limit: refuse to price instead of selling at no profit", () => {
  const bands: PricingBand[] = [{ upTo: 100, profitPct: 10, fixedProfit: 1, minProfit: 2 }];
  const fees = { marketplaceFeePct: 15, paymentFeePct: 0, paymentFixedFee: 0 };
  assert.equal(marketplacePrice(100.01, bands, fees), null);
  assert.equal(marketplacePrice(0, bands, fees), null);
});

test("minimum profit kicks in when the percentage gives too little", () => {
  const bands: PricingBand[] = [{ upTo: 10, profitPct: 10, fixedProfit: 0.5, minProfit: 2 }];
  const fees = { marketplaceFeePct: 20, paymentFeePct: 0, paymentFixedFee: 0.3 };
  // 5 * 10% = 0.50 < 2, so top = 5 + 2 + 0.5 + 0.3 = 7.80; 7.80 / 0.8 = 9.75
  assert.equal(marketplacePrice(5, bands, fees), 9.75);
});

test("validation catches bad bands and impossible fees", () => {
  assert.deepEqual(validateBands([{ upTo: 10, profitPct: 10, fixedProfit: 0, minProfit: 1 }]), []);
  assert.ok(validateBands([]).length > 0);
  assert.ok(
    validateBands([
      { upTo: 10, profitPct: 10, fixedProfit: 0, minProfit: 1 },
      { upTo: 10, profitPct: 12, fixedProfit: 0, minProfit: 1 },
    ]).some((e) => e.includes("two bands")),
  );
  assert.ok(validateFees({ marketplaceFeePct: 60, paymentFeePct: 30, paymentFixedFee: 0 }).length > 0);
});
