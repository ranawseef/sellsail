import { amazonAliexpressToOnbuy } from "./amazon-aliexpress-to-onbuy-dropshipping";
import { howToPriceOnbuyDropshipping } from "./how-to-price-onbuy-dropshipping";
import { onbuyFeesExplained } from "./onbuy-fees-explained";
import { onbuyRepricerGuide } from "./onbuy-repricer-guide";
import { amazonToOnbuyStepByStep } from "./amazon-to-onbuy-step-by-step";
import { batch01 } from "./md/batch01";
import { batch02 } from "./md/batch02";
import { batch03 } from "./md/batch03";
import { batch04 } from "./md/batch04";
import { batch05 } from "./md/batch05";
import { batch06 } from "./md/batch06";
import { batch07 } from "./md/batch07";
import { batch08 } from "./md/batch08";
import { batch09 } from "./md/batch09";
import { batch10 } from "./md/batch10";
import { batch11 } from "./md/batch11";
import { batch12 } from "./md/batch12";
import { batch13 } from "./md/batch13";
import { batch14 } from "./md/batch14";
import type { Post } from "./types";

export type { Post } from "./types";
export { unsplash } from "./types";

export const CATEGORIES = ["Selling on OnBuy", "Fees and profit", "Pricing", "Repricing", "Dropshipping", "Marketplaces", "Growth", "Guides"] as const;

// Publishing schedule. The first five guides stay live with their own dates.
// Every other guide goes out three a day (07:00, 12:00 and 17:00 UTC) from
// SCHEDULE_START, in the order below (highest search volume first); the
// `date` written in the batch files is replaced by its slot.
const PINNED = [onbuyRepricerGuide, amazonToOnbuyStepByStep, onbuyFeesExplained, howToPriceOnbuyDropshipping, amazonAliexpressToOnbuy];
const SCHEDULE_START = "2026-10-26";
const SLOTS_UTC = ["07:00", "12:00", "17:00"];

const QUEUE: Post[] = [
  ...batch01,
  ...batch02,
  ...batch03,
  ...batch04,
  ...batch05,
  ...batch06,
  ...batch07,
  ...batch08,
  ...batch09,
  ...batch10,
  ...batch11,
];

// Second wave: one guide a day at 07:00 UTC from SCHEDULE_2_START (18 Nov to
// 17 Dec 2026), in order of UK search volume from Google Keyword Planner
// (pulled 17 Nov 2026; see docs/content-strategy.md). Black Friday leads
// because it only matters this month.
const SCHEDULE_2_START = "2026-11-18";
const ORDER_2 = [
  "black-friday-pricing-uk", // seasonal
  "tiktok-shop-uk", // 10K–100K
  "royal-mail-click-and-drop", // 10K–100K
  "how-to-calculate-vat", // "vat calculator" 100K–1M
  "how-to-sell-on-ebay-uk", // 1K–10K
  "sell-on-amazon-uk", // 1K–10K
  "ebay-fees-uk", // "ebay fee calculator" 1K–10K
  "gross-vs-net-profit-margin", // 1K–10K
  "how-to-calculate-markup", // "markup calculator" 1K–10K
  "trading-allowance-selling-online", // 1K–10K
  "print-on-demand-uk", // 1K–10K
  "price-elasticity", // 1K–10K
  "cheapest-courier-uk", // 100–1K, "evri parcel prices" 1K–10K
  "amazon-buy-box", // 100–1K
  "cost-of-goods-sold", // 100–1K
  "average-order-value", // 100–1K
  "customer-lifetime-value", // 100–1K
  "consumer-rights-online-sellers", // 100–1K
  "etsy-fees-uk", // 100–1K
  "packaging-for-ecommerce", // 100–1K
  "shopify-vs-etsy", // 100–1K
  "side-hustle-ideas-uk", // 100–1K
  "vinted-selling-tips", // 100–1K
  "amazon-repricer-uk", // 10–100, high intent
  "ebay-repricer", // 10–100, high intent
  "dropshipping-vs-wholesale", // 10–100
  "find-winning-products", // 10–100
  "ecommerce-conversion-rate", // 10–100
  "write-product-descriptions", // 10–100
  "ecommerce-kpis", // 10–100
];
const POOL_2 = [...batch12, ...batch13, ...batch14];
const QUEUE_2: Post[] = ORDER_2.map((slug) => {
  const post = POOL_2.find((p) => p.slug === slug);
  if (!post) throw new Error(`Scheduled post not found: ${slug}`);
  return post;
});

function daily(i: number): string {
  const day = new Date(`${SCHEDULE_2_START}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + i);
  return `${day.toISOString().slice(0, 10)}T07:00:00Z`;
}

function slot(i: number): string {
  const day = new Date(`${SCHEDULE_START}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + Math.floor(i / SLOTS_UTC.length));
  return `${day.toISOString().slice(0, 10)}T${SLOTS_UTC[i % SLOTS_UTC.length]}:00Z`;
}

/** Every post, newest first, including ones scheduled for later. */
export const posts: Post[] = [
  ...PINNED,
  ...QUEUE.map((p, i) => ({ ...p, date: slot(i), updated: undefined })),
  ...QUEUE_2.map((p, i) => ({ ...p, date: daily(i), updated: undefined })),
].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
);

/** When a post goes live: its date and time (a bare date means 07:00 UTC). */
export function publishedAt(p: Post): Date {
  return new Date(p.date.includes("T") ? p.date : `${p.date}T07:00:00Z`);
}

export function isPublished(p: Post, now = new Date()): boolean {
  return publishedAt(p).getTime() <= now.getTime();
}

export function publishedPosts(now = new Date()): Post[] {
  return posts.filter((p) => isPublished(p, now));
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Up to `n` posts to read next: the post's own picks first, then its category. */
export function relatedPosts(post: Post, n = 4, now = new Date()): Post[] {
  const live = publishedPosts(now).filter((p) => p.slug !== post.slug);
  const picked = (post.related ?? []).map((s) => live.find((p) => p.slug === s)).filter((p): p is Post => Boolean(p));
  const same = live.filter((p) => p.category === post.category && !picked.includes(p));
  const rest = live.filter((p) => !picked.includes(p) && !same.includes(p));
  return [...picked, ...same, ...rest].slice(0, n);
}
