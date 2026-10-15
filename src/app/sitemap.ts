import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { posts } from "@/content/posts";

const paths = [
  "",
  "/features",
  "/dropshipping",
  "/dropshipping/amazon-to-onbuy",
  "/dropshipping/aliexpress-to-onbuy",
  "/onbuy-fee-calculator",
  "/pricing",
  "/blog",
  "/about",
  "/contact",
  "/beta",
  "/privacy",
  "/terms",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...paths.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
