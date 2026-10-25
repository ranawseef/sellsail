import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const PRIVATE = ["/app", "/admin", "/api", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];

// Search engines and AI assistants are welcome on every public page. The AI
// crawlers are named explicitly so it is clear they may read and cite the site
// (a named group replaces "*" for that bot, so each repeats the private list).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
