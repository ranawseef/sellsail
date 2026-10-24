// Which Amazon offer the repricer buys against. Pure, so it can be tested
// against recorded getItemOffers responses.
//
// The offer must be fulfilled by Amazon, available now and dispatched within
// 48 hours. Landed price, so shipping is included.
//
// Amazon's own retail offer is only trusted in its Buy Box copy: getItemOffers
// lists Amazon retail twice and only the Buy Box copy carries the real
// dispatch time. A non-Buy-Box copy has shown "0h" for an item that really
// shipped in 6-7 months, and a stale £8 for an item that was out of stock.

export const AMAZON_UK_MARKETPLACE = "A1F83G8C2ARO7P";
export const AMAZON_UK_RETAIL_SELLER = "A3P5ROKL5A1OLE";

type Money = { Amount?: number | string };
export type AmazonOffer = {
  SellerId?: string;
  IsBuyBoxWinner?: boolean;
  IsFulfilledByAmazon?: boolean;
  ListingPrice?: Money;
  Shipping?: Money;
  ShippingTime?: { maximumHours?: number | string; availabilityType?: string };
};

/** Landed price of the offer to buy against, or 0 when there is none (out of stock). */
export function fbaLandedPrice(offers: readonly AmazonOffer[] | null | undefined): number {
  if (!offers || offers.length === 0) return 0;

  for (const offer of offers) {
    if (offer.SellerId === AMAZON_UK_RETAIL_SELLER && !offer.IsBuyBoxWinner) continue;

    const fba = Boolean(offer.IsFulfilledByAmazon);
    const hours = offer.ShippingTime?.maximumHours !== undefined ? Number(offer.ShippingTime.maximumHours) : 9999;
    const avail = offer.ShippingTime?.availabilityType ?? "";

    if (fba && hours <= 48 && avail === "NOW") {
      const price = Number(offer.ListingPrice?.Amount ?? 0) || 0;
      const ship = Number(offer.Shipping?.Amount ?? 0) || 0;
      return price + ship;
    }
  }
  return 0;
}

export type ItemOfferResult =
  | { asin: string; kind: "ok"; landedPrice: number }
  | { asin: string; kind: "permanent"; status: number } // Amazon doesn't know the ASIN
  | { asin: string; kind: "temporary"; status: number }; // throttled / 5xx: retry later

/**
 * Reads one entry of a batches/products/pricing/v0/itemOffers response.
 * The batch answers 200 even when an item inside failed, so every entry is
 * judged on its own status.
 */
export function readItemOfferResponse(res: unknown): ItemOfferResult | null {
  if (!res || typeof res !== "object") return null;
  const r = res as {
    status?: { statusCode?: number };
    request?: { Asin?: string; uri?: string };
    body?: { payload?: { ASIN?: string; Offers?: AmazonOffer[] } };
  };

  let asin = r.request?.Asin ?? r.body?.payload?.ASIN ?? "";
  if (!asin && r.request?.uri) {
    const m = /\/items\/([^/]+)\/offers/.exec(r.request.uri);
    if (m) asin = decodeURIComponent(m[1]);
  }
  if (!asin) return null;

  const status = r.status?.statusCode !== undefined ? Number(r.status.statusCode) : 200;
  const offers = r.body?.payload?.Offers;

  if (status !== 200 || !Array.isArray(offers)) {
    if (status === 400 || status === 404) return { asin, kind: "permanent", status };
    return { asin, kind: "temporary", status: status === 200 ? 0 : status };
  }
  return { asin, kind: "ok", landedPrice: fbaLandedPrice(offers) };
}
