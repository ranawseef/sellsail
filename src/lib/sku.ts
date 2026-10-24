// SKU <-> ASIN.
//
// Most sellers list with the Amazon ASIN as the marketplace SKU. Some put a
// fixed prefix in front ("SK01B0C8KF67ZC" for ASIN "B0C8KF67ZC"). The
// marketplace only knows the full SKU, so that is what is stored and pushed;
// Amazon only knows the ASIN. Ported from the reference app's sku_asin.php.

/** "SK01, sku02 ,," -> ["SK01", "sku02"], longest first so "SK01X" wins over "SK01". */
export function parsePrefixes(raw: string | null | undefined): string[] {
  const out: string[] = [];
  for (const part of String(raw ?? "").split(",")) {
    const p = part.trim();
    if (p && !out.includes(p)) out.push(p);
  }
  return out.sort((a, b) => b.length - a.length);
}

/** The ASIN a SKU refers to. Prefix match ignores case; the ASIN keeps its case. */
export function skuToAsin(sku: string, prefixes: readonly string[]): string {
  const s = sku.trim();
  for (const p of prefixes) {
    if (s.length > p.length && s.slice(0, p.length).toLowerCase() === p.toLowerCase()) {
      return s.slice(p.length);
    }
  }
  return s;
}

const ASIN = /^[A-Z0-9]{10}$/i;

/**
 * Can the repricer work with this SKU? Returns "" when it can, otherwise why not.
 * With prefixedOnly, bare ASIN SKUs are refused too, so listings on the account
 * that are not this tool's (manual ones, other suppliers) are left alone.
 */
export function skuImportReason(sku: string, prefixes: readonly string[], prefixedOnly = false): string {
  const s = sku.trim();
  if (!s) return "empty SKU";
  if (s.length > 64) return "SKU longer than 64 characters";
  const asin = skuToAsin(s, prefixes);
  if (!ASIN.test(asin)) return "not an ASIN, or a SKU prefix + ASIN";
  if (prefixedOnly && prefixes.length > 0 && asin === s) return "no SKU prefix";
  return "";
}
