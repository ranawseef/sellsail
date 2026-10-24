// CSV listing import.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, readListingsCsv } from "../src/lib/csv.ts";

test("parses quotes, escaped quotes, CRLF, BOM and other separators", () => {
  assert.deepEqual(parseCsv('﻿sku,title\r\nB0AAAAAAA1,"Lamp, ""warm"" white"\r\n'), [
    ["sku", "title"],
    ["B0AAAAAAA1", 'Lamp, "warm" white'],
  ]);
  assert.deepEqual(parseCsv("sku;asin\nX;B0AAAAAAA1\n\n"), [
    ["sku", "asin"],
    ["X", "B0AAAAAAA1"],
  ]);
  assert.deepEqual(parseCsv("sku\tTitle\nA\tB"), [
    ["sku", "Title"],
    ["A", "B"],
  ]);
});

test("reads SKUs, takes the ASIN from a prefix or the asin column, and says why rows are skipped", () => {
  const csv = ["SKU,Title,ASIN", "SK01B0AAAAAAA1,Lamp,", "B0AAAAAAA2,,", "MY-OWN-SKU,Mug,B0AAAAAAA3", "HELLO,,", "B0AAAAAAA2,dup,", "X,,bad"].join("\n");
  const r = readListingsCsv(csv, ["SK01"]);
  assert.equal(r.error, "");
  assert.deepEqual(r.rows, [
    { sku: "SK01B0AAAAAAA1", asin: "B0AAAAAAA1", title: "Lamp" },
    { sku: "B0AAAAAAA2", asin: "B0AAAAAAA2", title: "" },
    { sku: "MY-OWN-SKU", asin: "B0AAAAAAA3", title: "Mug" },
  ]);
  assert.deepEqual(
    r.skipped.map((s) => [s.line, s.reason]),
    [
      [5, "not an ASIN, or a SKU prefix + ASIN"],
      [6, "duplicate SKU in the file"],
      [7, "the asin column is not a 10-character ASIN"],
    ],
  );
});

test("refuses a file without a sku column", () => {
  assert.match(readListingsCsv("asin\nB0AAAAAAA1", []).error, /sku/);
  assert.match(readListingsCsv("", []).error, /empty/);
});
