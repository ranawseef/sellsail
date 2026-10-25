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
import type { Post } from "./types";

export type { Post } from "./types";
export { unsplash } from "./types";

export const CATEGORIES = ["Selling on OnBuy", "Fees and profit", "Pricing", "Repricing", "Dropshipping", "Marketplaces", "Growth", "Guides"] as const;

/** Every post, newest first, including ones scheduled for later. */
export const posts: Post[] = [
  onbuyRepricerGuide,
  amazonToOnbuyStepByStep,
  onbuyFeesExplained,
  howToPriceOnbuyDropshipping,
  amazonAliexpressToOnbuy,
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
].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/** Scheduled posts go live at 7am UK time on their date. */
export function isPublished(p: Post, now = new Date()): boolean {
  return new Date(`${p.date}T07:00:00Z`).getTime() <= now.getTime();
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
