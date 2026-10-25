// OnBuy (OnCommerce) API v2. Every call goes out through egressFetch on the
// route the caller names (the seller's proxy, or direct); nothing here opens a connection itself.
//
// Checked against docs.api.onbuy.com (Postman collection "[LIVE] OnCommerce
// API Documentation v2") on 2026-10-24:
//   POST /auth/request-token  form fields secret_key, consumer_key
//        -> { access_token, expires_at (unix seconds) }, valid 15 minutes and
//        only from the IP that requested it (another IP gets 401).
//   Authorization header carries the raw token (no "Bearer").
//   GET  /listings?site_id=2000&limit=&offset=  -> results[], metadata.total_rows
//   PUT  /listings/by-sku  { site_id, listings: [{ sku, price, stock,
//        boost_marketing_commission }] }, up to 1000 per request.
//   GET  /listings/check-winning?site_id=2000 with a JSON body { skus: [...] }
//        (up to 100) -> results[{ sku, winning, lead_price }]. Same shape the
//        single-seller repricer has used in production.

import { egressFetch, type EgressResponse, type Route } from "../../net/egress.ts";
import { isAuthFailure } from "./results.ts";

export const ONBUY_API = "https://api.onbuy.com/v2";
export const ONBUY_UK_SITE = 2000;
export const PUSH_BATCH_MAX = 1000;
export const BROWSE_PAGE = 500;

export type OnBuyCreds = { consumerKey: string; secretKey: string };

export class OnBuyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "OnBuyError";
    this.status = status;
  }
}

/** A short, safe description of an OnBuy error body (never the request). */
export function onbuyErrorText(res: { status: number; json: unknown; text: string }): string {
  const j = res.json as { error?: unknown; message?: unknown } | null;
  let msg = "";
  if (j && typeof j === "object") {
    const e = j.error as { message?: unknown } | string | undefined;
    if (typeof e === "string") msg = e;
    else if (e && typeof e === "object" && typeof e.message === "string") msg = e.message;
    else if (typeof j.message === "string") msg = j.message;
  }
  if (!msg) msg = res.text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  return `OnBuy answered HTTP ${res.status}${msg ? `: ${msg.slice(0, 160)}` : ""}`;
}

export async function requestToken(route: Route, creds: OnBuyCreds): Promise<{ accessToken: string; expiresAt: Date }> {
  const body = new URLSearchParams({ secret_key: creds.secretKey, consumer_key: creds.consumerKey }).toString();
  const res = await egressFetch(route, `${ONBUY_API}/auth/request-token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    timeoutMs: 30_000,
  });
  const j = res.json as { access_token?: unknown; expires_at?: unknown } | null;
  if (res.status !== 200 || typeof j?.access_token !== "string" || !j.access_token) {
    const hint = res.status === 401 || res.status === 403 ? " Check the consumer key and secret key (live, not test, keys for live listings)." : "";
    throw new OnBuyError(onbuyErrorText(res) + hint, res.status);
  }
  // Renew a minute early so a token never expires mid-request.
  const exp = Number(j.expires_at);
  const expiresAt = Number.isFinite(exp) && exp > 0 ? new Date(exp * 1000 - 60_000) : new Date(Date.now() + 14 * 60_000);
  return { accessToken: j.access_token, expiresAt };
}

/** Where tokens come from. renew() must fetch a new one, not return a cached one. */
export type TokenSource = { get(): Promise<string>; renew(): Promise<string> };

/** One OnBuy call; on a 401 the token is renewed once and the call repeated. */
export async function onbuyCall(
  route: Route,
  tokens: TokenSource,
  method: "GET" | "PUT" | "POST",
  path: string,
  opts: { query?: Record<string, string | number>; body?: unknown; timeoutMs?: number } = {},
): Promise<EgressResponse> {
  const url = new URL(ONBUY_API + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, String(v));

  const send = async (token: string) =>
    egressFetch(route, url.toString(), {
      method,
      headers: {
        Authorization: token,
        Accept: "application/json",
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      timeoutMs: opts.timeoutMs ?? 90_000,
    });

  let res = await send(await tokens.get());
  if (isAuthFailure(res.status, res.json)) res = await send(await tokens.renew());
  return res;
}

export type OnBuyListing = {
  sku: string;
  name: string;
  price: number | null;
  stock: number | null;
  opc: string;
};

function toListing(r: unknown): OnBuyListing | null {
  if (!r || typeof r !== "object") return null;
  const o = r as Record<string, unknown>;
  if (typeof o.sku !== "string" && typeof o.sku !== "number") return null;
  const num = (v: unknown) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
  return {
    sku: String(o.sku).trim(),
    name: typeof o.name === "string" ? o.name.slice(0, 255) : "",
    price: num(o.price),
    stock: num(o.stock) === null ? null : Math.trunc(Number(o.stock)),
    opc: typeof o.opc === "string" ? o.opc.slice(0, 32) : typeof o.product_encoded_id === "string" ? o.product_encoded_id.slice(0, 32) : "",
  };
}

/** One page of the seller's listings. */
export async function browseListings(
  route: Route,
  tokens: TokenSource,
  offset: number,
  limit = BROWSE_PAGE,
  siteId = ONBUY_UK_SITE,
): Promise<{ listings: OnBuyListing[]; totalRows: number }> {
  const res = await onbuyCall(route, tokens, "GET", "/listings", { query: { site_id: siteId, limit, offset } });
  if (res.status !== 200) throw new OnBuyError(onbuyErrorText(res), res.status);
  const j = res.json as { results?: unknown[]; metadata?: { total_rows?: unknown } } | null;
  const listings = (Array.isArray(j?.results) ? j.results : []).map(toListing).filter((l): l is OnBuyListing => l !== null);
  const totalRows = Number(j?.metadata?.total_rows);
  return { listings, totalRows: Number.isFinite(totalRows) ? totalRows : 0 };
}

export type ListingUpdate = { sku: string; price: number; stock: number };

/** PUT /listings/by-sku. The caller reads the per-SKU results (see results.ts). */
export async function updateListingsBySku(
  route: Route,
  tokens: TokenSource,
  updates: readonly ListingUpdate[],
  boostPct: number | null,
  siteId = ONBUY_UK_SITE,
): Promise<EgressResponse> {
  if (updates.length > PUSH_BATCH_MAX) throw new Error(`OnBuy accepts at most ${PUSH_BATCH_MAX} listings per update`);
  const listings = updates.map((u) => ({
    sku: u.sku,
    price: Number(u.price.toFixed(2)),
    stock: u.stock,
    ...(boostPct !== null ? { boost_marketing_commission: boostPct } : {}),
  }));
  return onbuyCall(route, tokens, "PUT", "/listings/by-sku", { body: { site_id: siteId, listings }, timeoutMs: 120_000 });
}

export const CHECK_WINNING_MAX = 100;

export type WinningResult = { sku: string; winning: boolean; leadPrice: number | null };

/** Reads check-winning's results; anything malformed is skipped, not guessed. */
export function readWinningResults(json: unknown): WinningResult[] {
  const results = (json as { results?: unknown } | null)?.results;
  const list = Array.isArray(results) ? results : results && typeof results === "object" ? Object.values(results) : [];
  const out: WinningResult[] = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.sku !== "string" && typeof o.sku !== "number") continue;
    const w = o.winning;
    const winning = w === true || w === 1 || w === "1" || w === "true";
    const lead = Number(o.lead_price);
    out.push({ sku: String(o.sku).trim(), winning, leadPrice: Number.isFinite(lead) && lead > 0 ? Math.round(lead * 100) / 100 : null });
  }
  return out;
}

/** GET /listings/check-winning for up to 100 SKUs. */
export async function checkWinning(route: Route, tokens: TokenSource, skus: readonly string[], siteId = ONBUY_UK_SITE): Promise<EgressResponse> {
  if (skus.length > CHECK_WINNING_MAX) throw new Error(`check-winning takes at most ${CHECK_WINNING_MAX} SKUs`);
  return onbuyCall(route, tokens, "GET", "/listings/check-winning", { query: { site_id: siteId }, body: { skus }, timeoutMs: 60_000 });
}
