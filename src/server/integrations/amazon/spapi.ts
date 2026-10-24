// Amazon Selling Partner API (EU endpoint, UK marketplace). Every call,
// including the Login with Amazon token exchange, goes through the tenant's
// proxy via egressFetch.
//
// SP-API calls need only an LWA access token in x-amz-access-token (no AWS
// request signing since 2023). Checked against developer-docs.amazon on
// 2026-10-24: POST /batches/products/pricing/v0/itemOffers takes up to 20
// requests, usage plan 0.1 requests/second with a burst of 1.

import { egressFetch, type EgressResponse, type ProxyConfig } from "../../net/egress.ts";
import { AMAZON_UK_MARKETPLACE } from "./offers.ts";

export const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
export const SPAPI_EU = "https://sellingpartnerapi-eu.amazon.com";
export const SELLER_CENTRAL_UK = "https://sellercentral.amazon.co.uk";
export const OFFERS_BATCH_MAX = 20;

export type LwaClient = { clientId: string; clientSecret: string };

export class AmazonError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AmazonError";
    this.status = status;
  }
}

function errorText(res: EgressResponse): string {
  const j = res.json as { error_description?: unknown; error?: unknown; errors?: { message?: unknown; code?: unknown }[] } | null;
  let msg = "";
  if (typeof j?.error_description === "string") msg = j.error_description;
  else if (Array.isArray(j?.errors) && j.errors[0]) msg = `${String(j.errors[0].code ?? "")} ${String(j.errors[0].message ?? "")}`.trim();
  else if (typeof j?.error === "string") msg = j.error;
  return `Amazon answered HTTP ${res.status}${msg ? `: ${msg.slice(0, 160)}` : ""}`;
}

/**
 * Seller Central page where the seller approves SellSail. Opened in the
 * seller's own browser, not fetched by the server. `beta` is for apps still
 * in draft (SPAPI_DRAFT_APP=1).
 */
export function consentUrl(appId: string, state: string, draft: boolean): string {
  const u = new URL("/apps/authorize/consent", SELLER_CENTRAL_UK);
  u.searchParams.set("application_id", appId);
  u.searchParams.set("state", state);
  if (draft) u.searchParams.set("version", "beta");
  return u.toString();
}

async function lwaToken(proxy: ProxyConfig | null, form: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await egressFetch(proxy, LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", Accept: "application/json" },
    body: new URLSearchParams(form).toString(),
    timeoutMs: 30_000,
  });
  if (res.status !== 200 || !res.json || typeof res.json !== "object") throw new AmazonError(errorText(res), res.status);
  return res.json as Record<string, unknown>;
}

/** Swap the one-time code from the consent redirect for a refresh token. */
export async function exchangeAuthCode(
  proxy: ProxyConfig | null,
  client: LwaClient,
  code: string,
  redirectUri: string,
): Promise<string> {
  const j = await lwaToken(proxy, {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: client.clientId,
    client_secret: client.clientSecret,
  });
  if (typeof j.refresh_token !== "string" || !j.refresh_token) throw new AmazonError("Amazon did not return a refresh token", 200);
  return j.refresh_token;
}

export async function accessToken(
  proxy: ProxyConfig | null,
  client: LwaClient,
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const j = await lwaToken(proxy, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: client.clientId,
    client_secret: client.clientSecret,
  });
  if (typeof j.access_token !== "string" || !j.access_token) throw new AmazonError("Amazon did not return an access token", 200);
  const ttl = Number(j.expires_in);
  // Renew two minutes early.
  return { accessToken: j.access_token, expiresAt: new Date(Date.now() + ((Number.isFinite(ttl) ? ttl : 3600) - 120) * 1000) };
}

export function offersBatchBody(asins: readonly string[], marketplaceId = AMAZON_UK_MARKETPLACE) {
  return {
    requests: asins.map((asin) => ({
      uri: `/products/pricing/v0/items/${encodeURIComponent(asin)}/offers`,
      method: "GET",
      MarketplaceId: marketplaceId,
      ItemCondition: "New",
      CustomerType: "Consumer",
    })),
  };
}

/**
 * getItemOffersBatch. Returns the raw response: HTTP 200 still needs every
 * entry checked on its own (see readItemOfferResponse in offers.ts).
 */
export async function itemOffersBatch(
  proxy: ProxyConfig | null,
  token: string,
  asins: readonly string[],
  marketplaceId = AMAZON_UK_MARKETPLACE,
): Promise<EgressResponse> {
  if (asins.length === 0 || asins.length > OFFERS_BATCH_MAX) throw new Error(`itemOffers batch needs 1-${OFFERS_BATCH_MAX} ASINs`);
  return egressFetch(proxy, `${SPAPI_EU}/batches/products/pricing/v0/itemOffers`, {
    method: "POST",
    headers: { "x-amz-access-token": token, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(offersBatchBody(asins, marketplaceId)),
    timeoutMs: 60_000,
  });
}

export function batchResponses(res: EgressResponse): unknown[] | null {
  const r = (res.json as { responses?: unknown } | null)?.responses;
  return Array.isArray(r) ? r : null;
}

export { errorText as amazonErrorText };
