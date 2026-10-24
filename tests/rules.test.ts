// Business rules carried over from the single-seller repricer.

import { test } from "node:test";
import assert from "node:assert/strict";
import { isAuthFailure, isMissingSkuError, splitPushResults } from "../src/server/integrations/onbuy/results.ts";
import { fbaLandedPrice, readItemOfferResponse, AMAZON_UK_RETAIL_SELLER } from "../src/server/integrations/amazon/offers.ts";
import { parsePrefixes, skuImportReason, skuToAsin } from "../src/lib/sku.ts";

test("only SKUs OnBuy names without an error count as pushed", () => {
  const out = splitPushResults(
    {
      success: true,
      results: [
        { sku: "B095NZWNSW", product_listing_id: "266186971" },
        { sku: "ZZZ-BAD", error: "SKU does not exist" },
        { sku: "NOT-SENT" },
      ],
    },
    ["B095NZWNSW", "ZZZ-BAD", "B000000001"],
  );
  assert.deepEqual(out.applied, ["B095NZWNSW"]);
  assert.equal(out.rejected.get("ZZZ-BAD"), "SKU does not exist");
  assert.deepEqual(out.unconfirmed, ["B000000001"]); // never mentioned: stays pending
});

test("a non-JSON or results-less answer confirms nothing", () => {
  for (const body of [null, "<html>502</html>", { success: true }, { results: "x" }]) {
    const out = splitPushResults(body, ["A", "B"]);
    assert.deepEqual(out.applied, []);
    assert.deepEqual(out.unconfirmed, ["A", "B"]);
  }
});

test("a SKU reported both applied and rejected is treated as rejected", () => {
  const out = splitPushResults({ results: [{ sku: "A" }, { sku: "A", error: "bad price" }] }, ["A"]);
  assert.deepEqual(out.applied, []);
  assert.equal(out.rejected.get("A"), "bad price");
});

test("dead-SKU errors are recognised, other rejections are not", () => {
  for (const e of ["SKU does not exist", "Listing not found", "Unknown SKU", "sku doesn't exist", "No listing for SKU"]) {
    assert.ok(isMissingSkuError(e), e);
  }
  for (const e of ["Price too low", "Stock must be an integer", "rejected"]) {
    assert.ok(!isMissingSkuError(e), e);
  }
});

test("expired OnBuy token is detected by status or body", () => {
  assert.ok(isAuthFailure(401, null));
  assert.ok(isAuthFailure(200, { error: { responseCode: 401 } }));
  assert.ok(!isAuthFailure(200, { success: true }));
});

const offer = (o: object) => ({
  IsFulfilledByAmazon: true,
  ShippingTime: { maximumHours: 24, availabilityType: "NOW" },
  ListingPrice: { Amount: 10 },
  Shipping: { Amount: 0 },
  ...o,
});

test("buys against the first FBA offer available now within 48h, shipping included", () => {
  assert.equal(
    fbaLandedPrice([
      offer({ IsFulfilledByAmazon: false, ListingPrice: { Amount: 5 } }),
      offer({ ShippingTime: { maximumHours: 72, availabilityType: "NOW" }, ListingPrice: { Amount: 6 } }),
      offer({ ShippingTime: { maximumHours: 24, availabilityType: "FUTURE_WITH_DATE" }, ListingPrice: { Amount: 7 } }),
      offer({ ListingPrice: { Amount: 12.5 }, Shipping: { Amount: 1.99 } }),
    ]),
    14.49,
  );
  assert.equal(fbaLandedPrice([]), 0);
  assert.equal(fbaLandedPrice(null), 0);
});

test("Amazon retail is only trusted in its Buy Box copy", () => {
  const retailNoBuyBox = offer({ SellerId: AMAZON_UK_RETAIL_SELLER, IsBuyBoxWinner: false, ListingPrice: { Amount: 8 } });
  const other = offer({ SellerId: "X", ListingPrice: { Amount: 26.6 } });
  assert.equal(fbaLandedPrice([retailNoBuyBox, other]), 26.6);
  const retailBuyBox = offer({ SellerId: AMAZON_UK_RETAIL_SELLER, IsBuyBoxWinner: true, ListingPrice: { Amount: 9 } });
  assert.equal(fbaLandedPrice([retailBuyBox, other]), 9);
});

test("per-item batch status: 400/404 permanent, others temporary, 200 priced", () => {
  assert.deepEqual(readItemOfferResponse({ status: { statusCode: 404 }, request: { Asin: "B000000001" } }), {
    asin: "B000000001",
    kind: "permanent",
    status: 404,
  });
  assert.deepEqual(readItemOfferResponse({ status: { statusCode: 429 }, request: { Asin: "B000000002" } }), {
    asin: "B000000002",
    kind: "temporary",
    status: 429,
  });
  assert.deepEqual(
    readItemOfferResponse({
      status: { statusCode: 200 },
      request: { uri: "/products/pricing/v0/items/B000000003/offers" },
      body: { payload: { Offers: [offer({ ListingPrice: { Amount: 3 } })] } },
    }),
    { asin: "B000000003", kind: "ok", landedPrice: 3 },
  );
});

test("SKU prefixes: longest first, case-insensitive match, ASIN keeps its case", () => {
  const p = parsePrefixes("SK01, sk01x ,,SK01");
  assert.deepEqual(p, ["sk01x", "SK01"]);
  assert.equal(skuToAsin("SK01XB0C8KF67ZC", p), "B0C8KF67ZC");
  assert.equal(skuToAsin("sk01B0C8KF67ZC", p), "B0C8KF67ZC");
  assert.equal(skuToAsin("B0C8KF67ZC", p), "B0C8KF67ZC");
  assert.equal(skuImportReason("SK01B0C8KF67ZC", p), "");
  assert.equal(skuImportReason("B0C8KF67ZC", p, true), "no SKU prefix");
  assert.notEqual(skuImportReason("SK01-HELLO", p), "");
});
