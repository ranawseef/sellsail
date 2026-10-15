import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CtaBand } from "@/components/sections";
import { getPost, posts, unsplash } from "@/content/posts";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const image = unsplash(post.cover.src, 1200);
  return {
    title: post.title,
    description: post.description,
    keywords: [post.keyword, "OnBuy", "UK sellers", "dropshipping"],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, images: [image] },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image] },
  };
}

export default async function PostPage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { Body } = post;
  const url = `${site.url}/blog/${post.slug}`;
  const others = posts.filter((p) => p.slug !== post.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: unsplash(post.cover.src, 1200),
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <>
      <article>
        <header className="bg-dots border-b border-line">
          <div className="mx-auto max-w-[860px] px-6 pt-12 pb-10">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <ol className="flex flex-wrap gap-1.5">
                <li><Link href="/" className="text-muted">Home</Link> /</li>
                <li><Link href="/blog" className="text-muted">Blog</Link> /</li>
                <li aria-current="page" className="text-ink">{post.category}</li>
              </ol>
            </nav>
            <Badge variant="mint" className="mt-6">{post.category}</Badge>
            <h1 className="mt-4 font-display text-[clamp(36px,5.2vw,62px)] leading-[1.02] font-extrabold tracking-[-0.04em]">
              {post.title}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-body">{post.description}</p>
            <p className="mt-5 text-sm text-muted">
              By the SellSail team ·{" "}
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </time>{" "}
              · {post.readingMinutes} min read
            </p>
          </div>
        </header>
        <figure className="mx-auto max-w-[1100px] px-6 pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={unsplash(post.cover.src, 1600)}
            alt={post.cover.alt}
            width={1600}
            height={900}
            fetchPriority="high"
            className="aspect-[16/9] w-full rounded-[28px] object-cover"
          />
          <figcaption className="mt-2 text-right text-xs text-muted">Photo: Unsplash</figcaption>
        </figure>
        <div className="mx-auto max-w-[860px] px-6 py-12">
          <div className="prose-site text-[17px]">
            <Body />
          </div>
          <aside className="mt-12 rounded-3xl bg-mint p-7">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Let SellSail do the maths</h2>
            <p className="mt-2 leading-relaxed text-body">
              SellSail works out a fee-aware floor for every OnBuy listing and reprices inside it, so you never sell at a loss.
            </p>
            <Link href="/beta" className="mt-4 inline-block font-bold text-sea-dark underline underline-offset-4">
              Join the free beta →
            </Link>
          </aside>
          <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-ink no-underline hover:text-sea">
            <ArrowLeft aria-hidden="true" className="size-4" /> All articles
          </Link>
        </div>
      </article>
      <section aria-labelledby="more-title" className="mx-auto max-w-[1200px] px-6 pb-16">
        <h2 id="more-title" className="font-display text-3xl font-extrabold tracking-[-0.03em]">Keep reading</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex gap-5 rounded-3xl border border-line bg-white p-4 text-ink no-underline">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={unsplash(p.cover.src, 400)} alt="" width={160} height={120} loading="lazy" className="h-28 w-36 flex-none rounded-2xl object-cover" />
                <span>
                  <span className="text-sm font-semibold text-sea-dark">{p.category}</span>
                  <span className="mt-1 block font-display text-lg leading-snug font-bold group-hover:text-sea-dark">{p.title}</span>
                </span>
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
