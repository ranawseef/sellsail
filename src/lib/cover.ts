// Blog cover photos. Every photo is from Unsplash under the Unsplash licence
// (free for commercial use, no attribution required; no Unsplash+ images).
// A post with its own `cover` keeps it; the rest get a photo from their
// topic's set, picked by slug so each post always gets the same one.

import { unsplash, type Post } from "@/content/posts/types";

type Photo = { id: string; alt: string };

const BY_CATEGORY: Record<string, Photo[]> = {
  "Selling on OnBuy": [
    { id: "photo-1770013413878-2530e2c3d82b", alt: "Seller checking an order on a phone next to a laptop and parcels" },
    { id: "photo-1648747067192-790595bc6d5e", alt: "Online seller packing a cardboard box" },
    { id: "photo-1758523670564-d1d6a734dc0b", alt: "Customer signing for a parcel delivery" },
    { id: "photo-1605902711834-8b11c3e3ef2f", alt: "Shopping on a smartphone" },
  ],
  "Fees and profit": [
    { id: "photo-1709880945165-d2208c6ad2ec", alt: "Calculator next to a laptop" },
    { id: "photo-1631511258193-252ab3da6b8b", alt: "Calculator, pen and money on a desk" },
    { id: "photo-1700047614820-0f32080db6f8", alt: "British pound notes" },
    { id: "photo-1685038955804-3de172e7ff35", alt: "Calculator, notepad and pencils" },
  ],
  Pricing: [
    { id: "photo-1561069934-eee225952461", alt: "Discount sign in a shop window" },
    { id: "photo-1721219175520-89c0b0461da7", alt: "Shopping trolley full of products" },
    { id: "photo-1628873690006-344e1f0b2b96", alt: "Pound coins" },
    { id: "photo-1612103147485-8c8de055942b", alt: "Payment card on a wooden table" },
  ],
  Repricing: [
    { id: "photo-1551288049-bebda4e38f71", alt: "Performance charts on a laptop screen" },
    { id: "photo-1518186285589-2f7649de83e0", alt: "Price line graph on a screen" },
    { id: "photo-1528819622765-d6bcf132f793", alt: "Chess pieces on a board" },
    { id: "photo-1586165368502-1bad197a6461", alt: "Two chess knights facing each other" },
  ],
  Dropshipping: [
    { id: "photo-1580674285054-bed31e145f59", alt: "Parcels stacked in a delivery van" },
    { id: "photo-1644079446600-219068676743", alt: "Warehouse shelves full of stock" },
    { id: "photo-1766040923580-16ad32fae8b4", alt: "Pile of taped cardboard boxes" },
    { id: "photo-1577705998148-6da4f3963bc8", alt: "Cardboard shipping box" },
  ],
  Marketplaces: [
    { id: "photo-1758520387659-9956c4516891", alt: "Shopper with shopping bags" },
    { id: "photo-1689799514696-b16af9b53753", alt: "Woman shopping on her phone" },
    { id: "photo-1554672408-17407e0322ce", alt: "Man browsing on a smartphone" },
    { id: "photo-1631856955350-77f4023dff2b", alt: "Shopper in a store aisle" },
  ],
  Growth: [
    { id: "photo-1763038311036-6d18805537e5", alt: "Business owner reviewing growth charts" },
    { id: "photo-1758873272562-aa5459cbf34b", alt: "Team planning on a chalkboard" },
    { id: "photo-1542626991-cbc4e32524cc", alt: "Planning notes on a board" },
    { id: "photo-1460925895917-afdab827c52f", alt: "Laptop showing analytics" },
  ],
  Guides: [
    { id: "photo-1541140911322-98afe66ea6da", alt: "Planner notebook on a desk" },
    { id: "photo-1543286386-2e659306cd6c", alt: "Pen and notes on paper" },
    { id: "photo-1601342630314-8427c38bf5e6", alt: "Tablet, mug and laptop on a desk" },
    { id: "photo-1542744173-05336fcc7ad4", alt: "Working on a laptop" },
  ],
};

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** The cover photo id and alt text for a post. */
export function coverPhoto(post: Post): Photo {
  if (post.cover) return { id: post.cover.src, alt: post.cover.alt };
  const set = BY_CATEGORY[post.category] ?? BY_CATEGORY.Guides;
  return set[hash(post.slug) % set.length];
}

/** Sized Unsplash URL for a post's cover. */
export function coverUrl(post: Post, w: number, h?: number): string {
  const url = unsplash(coverPhoto(post).id, w);
  return h ? `${url}&h=${h}` : url;
}

const PROPER: Record<string, string> = {
  onbuy: "OnBuy",
  amazon: "Amazon",
  ebay: "eBay",
  aliexpress: "AliExpress",
  shopify: "Shopify",
  uk: "UK",
  vat: "VAT",
  sku: "SKU",
  asin: "ASIN",
  ean: "EAN",
  api: "API",
  cj: "CJ",
};

/** Short headline for the cover: the keyword in sentence case, brand names spelt right. */
export function coverHeadline(post: Post): string {
  const k = post.keyword.trim().replace(/[a-z]+/gi, (w) => PROPER[w.toLowerCase()] ?? w);
  return k.charAt(0).toUpperCase() + k.slice(1);
}
