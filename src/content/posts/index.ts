import { amazonAliexpressToOnbuy } from "./amazon-aliexpress-to-onbuy-dropshipping";
import { howToPriceOnbuyDropshipping } from "./how-to-price-onbuy-dropshipping";
import { onbuyFeesExplained } from "./onbuy-fees-explained";
import type { Post } from "./types";

export type { Post } from "./types";
export { unsplash } from "./types";

export const posts: Post[] = [onbuyFeesExplained, howToPriceOnbuyDropshipping, amazonAliexpressToOnbuy];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
