import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const paths = [
  "",
  "/features",
  "/dropshipping",
  "/dropshipping/amazon-to-onbuy",
  "/dropshipping/aliexpress-to-onbuy",
  "/onbuy-fee-calculator",
  "/pricing",
  "/guides",
  "/about",
  "/contact",
  "/beta",
  "/privacy",
  "/terms",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
}
