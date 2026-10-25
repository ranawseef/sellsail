import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { publishedPosts } from "@/content/posts";

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
  "/privacy",
  "/terms",
  "/cookies",
  "/refunds",
  "/delivery",
  "/acceptable-use",
  "/data-processing",
  "/security",
  "/legal",
];

export const revalidate = 3600;

// Bump when the marketing pages change.
const SITE_UPDATED = new Date("2026-10-25");
const LEGAL = new Set(["/privacy", "/terms", "/cookies", "/refunds", "/delivery", "/acceptable-use", "/data-processing", "/legal"]);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...paths.map((p) => ({
      url: `${site.url}${p}`,
      lastModified: SITE_UPDATED,
      changeFrequency: (LEGAL.has(p) ? "yearly" : "weekly") as "yearly" | "weekly",
      priority: p === "" ? 1 : LEGAL.has(p) ? 0.3 : 0.7,
    })),
    ...publishedPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.updated ?? p.date, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
