import { amazonAliexpressToOnbuy } from "./amazon-aliexpress-to-onbuy-dropshipping";
import { howToPriceOnbuyDropshipping } from "./how-to-price-onbuy-dropshipping";
import { onbuyFeesExplained } from "./onbuy-fees-explained";
import { onbuyRepricerGuide } from "./onbuy-repricer-guide";
import { amazonToOnbuyStepByStep } from "./amazon-to-onbuy-step-by-step";
import type { Post } from "./types";

export type { Post } from "./types";
export { unsplash } from "./types";

export const posts: Post[] = [onbuyRepricerGuide, amazonToOnbuyStepByStep, onbuyFeesExplained, howToPriceOnbuyDropshipping, amazonAliexpressToOnbuy];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
