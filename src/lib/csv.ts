// CSV import of listings. Pure, so it is tested without a database.
//
// Accepts a header row with a "sku" column (required) and optional "asin" and
// "title" columns, in any order and case. Comma, semicolon or tab separated,
// quoted fields with "" escapes, UTF-8 with or without a byte-order mark.

import { skuImportReason, skuToAsin } from "./sku.ts";

export const CSV_MAX_ROWS = 50_000;
export const CSV_MAX_BYTES = 5 * 1024 * 1024;

/** Splits CSV text into rows of fields. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.slice(0, src.search(/\r?\n|$/));
  const sep = [",", ";", "\t"].reduce((best, s) => (firstLine.split(s).length > firstLine.split(best).length ? s : best), ",");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"' && field === "") {
      quoted = true;
    } else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export type CsvListing = { sku: string; asin: string; title: string };
export type CsvResult = { rows: CsvListing[]; skipped: { line: number; sku: string; reason: string }[]; error: string };

export function readListingsCsv(text: string, prefixes: readonly string[], prefixedOnly = false): CsvResult {
  const all = parseCsv(text);
  if (all.length === 0) return { rows: [], skipped: [], error: "The file is empty." };
  const header = all[0].map((h) => h.trim().toLowerCase());
  const skuCol = header.indexOf("sku");
  if (skuCol < 0) return { rows: [], skipped: [], error: 'The first row must name the columns, including one called "sku".' };
  if (all.length - 1 > CSV_MAX_ROWS) return { rows: [], skipped: [], error: `Upload at most ${CSV_MAX_ROWS.toLocaleString("en-GB")} rows at a time.` };
  const asinCol = header.indexOf("asin");
  const titleCol = header.indexOf("title");

  const rows: CsvListing[] = [];
  const skipped: CsvResult["skipped"] = [];
  const seen = new Set<string>();
  all.slice(1).forEach((r, i) => {
    const line = i + 2;
    const sku = (r[skuCol] ?? "").trim();
    const given = asinCol >= 0 ? (r[asinCol] ?? "").trim().toUpperCase() : "";
    const why = given ? (/^[A-Z0-9]{10}$/.test(given) ? (sku ? "" : "empty SKU") : "the asin column is not a 10-character ASIN") : skuImportReason(sku, prefixes, prefixedOnly);
    if (why) {
      skipped.push({ line, sku, reason: why });
      return;
    }
    if (seen.has(sku.toLowerCase())) {
      skipped.push({ line, sku, reason: "duplicate SKU in the file" });
      return;
    }
    seen.add(sku.toLowerCase());
    rows.push({ sku, asin: given || skuToAsin(sku, prefixes).toUpperCase(), title: titleCol >= 0 ? (r[titleCol] ?? "").trim().slice(0, 255) : "" });
  });
  return { rows, skipped, error: "" };
}
