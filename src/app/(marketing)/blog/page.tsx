import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CtaBand, PageHero } from "@/components/sections";
import { PostCover } from "@/components/post-cover";
import { CATEGORIES, publishedPosts } from "@/content/posts";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "OnBuy seller blog: fees, repricing and dropshipping",
  description:
    "Practical guides for UK OnBuy sellers: how to sell on OnBuy, fees and profit, repricing, Amazon to OnBuy dropshipping and growing a marketplace shop.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
};

// New posts appear on their scheduled date without a deploy.
export const revalidate = 3600;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const all = publishedPosts();
  const active = CATEGORIES.find((c) => c === topic) ?? null;
  const list = active ? all.filter((p) => p.category === active) : all;
  const [featured, ...rest] = list;
  const counts = new Map<string, number>(CATEGORIES.map((c) => [c, all.filter((p) => p.category === c).length]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SellSail blog",
    url: `${site.url}/blog`,
    publisher: { "@id": `${site.url}/#organization` },
    blogPost: all.slice(0, 20).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${site.url}/blog/${p.slug}`, datePublished: p.date })),
  };

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={<>Sell smarter <span className="highlight px-1">on OnBuy</span></>}
        intro="Straightforward guides for UK sellers on fees, pricing, repricing and dropshipping, written by people who sell online."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <nav aria-label="Topics" className="flex flex-wrap items-center gap-2">
          <Link
            href="/blog"
            aria-current={!active ? "page" : undefined}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold no-underline", !active ? "bg-ink text-white" : "bg-white text-body ring-1 ring-line hover:bg-mint")}
          >
            All guides <span className="opacity-60">{all.length}</span>
          </Link>
          {CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => (
            <Link
              key={c}
              href={`/blog?topic=${encodeURIComponent(c)}`}
              aria-current={active === c ? "page" : undefined}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold no-underline", active === c ? "bg-ink text-white" : "bg-white text-body ring-1 ring-line hover:bg-mint")}
            >
              {c} <span className="opacity-60">{counts.get(c)}</span>
            </Link>
          ))}
          <a href="/blog/feed.xml" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-sea-dark no-underline hover:underline">
            <Rss aria-hidden="true" className="size-4" /> RSS
          </a>
        </nav>

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mt-8 grid overflow-hidden rounded-[32px] border border-line bg-white text-ink no-underline md:grid-cols-2"
          >
            <PostCover post={featured} size="md" priority className="h-64 w-full md:h-full md:min-h-[320px]" />
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <div className="flex gap-2">
                <Badge variant="solid">Latest</Badge>
                <Badge variant="mint">{featured.category}</Badge>
              </div>
              <h2 className="mt-4 font-display text-[clamp(26px,3.2vw,38px)] leading-[1.06] font-extrabold tracking-[-0.03em] group-hover:text-sea-dark">
                {featured.title}
              </h2>
              <p className="mt-3 leading-relaxed text-body">{featured.description}</p>
              <p className="mt-5 text-sm text-muted">
                Updated {formatDate(featured.updated ?? featured.date)} · {featured.readingMinutes} min read
              </p>
            </div>
          </Link>
        )}

        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-white text-ink no-underline">
                <PostCover post={p} size="md" className="h-48 w-full" />
                <div className="flex flex-1 flex-col p-6">
                  <Badge variant="mint" className="self-start">{p.category}</Badge>
                  <h2 className="mt-3 font-display text-xl leading-tight font-bold tracking-[-0.02em] group-hover:text-sea-dark">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-body">{p.description}</p>
                  <p className="mt-auto pt-5 text-sm text-muted">
                    Updated {formatDate(p.updated ?? p.date)} · {p.readingMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
