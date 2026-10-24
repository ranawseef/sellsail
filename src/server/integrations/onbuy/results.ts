// Reading OnBuy's answer to PUT /v2/listings/by-sku.
//
// OnBuy answers HTTP 200 with "success": true even when single listings in
// the batch were rejected:
//
//   { "success": true, "results": [
//       { "sku": "B095NZWNSW", "product_listing_id": "266186971" },
//       { "sku": "ZZZ-BAD",    "error": "SKU does not exist" } ] }
//
// Rule: a listing only counts as pushed when OnBuy names it AND gives no
// error for it. Rejected, missing from the response, or a failed call all
// leave it pending so it goes out again on the next run.

export type PushOutcome = {
  applied: string[];
  rejected: Map<string, string>;
  /** Sent but not mentioned by OnBuy: unconfirmed, retried next run. */
  unconfirmed: string[];
};

export function splitPushResults(decoded: unknown, sent: readonly string[]): PushOutcome {
  const applied: string[] = [];
  const rejected = new Map<string, string>();

  const results =
    decoded && typeof decoded === "object" && Array.isArray((decoded as { results?: unknown }).results)
      ? ((decoded as { results: unknown[] }).results)
      : null;

  if (!results) return { applied, rejected, unconfirmed: [...sent] };

  const sentSet = new Set(sent);
  for (const r of results) {
    if (!r || typeof r !== "object") continue;
    const rec = r as Record<string, unknown>;
    if (typeof rec.sku !== "string" && typeof rec.sku !== "number") continue;
    const sku = String(rec.sku);
    // Only trust answers about SKUs we actually sent.
    if (!sentSet.has(sku)) continue;
    if (rec.error !== undefined && rec.error !== null && rec.error !== false) {
      const err = rec.error;
      rejected.set(sku, typeof err === "string" || typeof err === "number" ? String(err) : "rejected");
    } else if (!rejected.has(sku)) {
      applied.push(sku);
    }
  }

  const named = new Set([...applied, ...rejected.keys()]);
  const appliedFinal = applied.filter((s) => !rejected.has(s));
  return { applied: appliedFinal, rejected, unconfirmed: sent.filter((s) => !named.has(s)) };
}

/** OnBuy has no listing for this SKU, so retrying can never succeed. */
export function isMissingSkuError(why: string): boolean {
  return /(does\s*n[o']t\s+exist|not\s+exist|not\s+found|no\s+listing|unknown\s+sku|invalid\s+sku)/i.test(why);
}

/** True when the response says the access token is no longer valid. */
export function isAuthFailure(status: number, decoded: unknown): boolean {
  if (status === 401) return true;
  const code = (decoded as { error?: { responseCode?: unknown } } | null)?.error?.responseCode;
  return code === 401 || code === "401";
}
