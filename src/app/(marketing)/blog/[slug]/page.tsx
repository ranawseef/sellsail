import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CtaBand, Faq } from "@/components/sections";
import { PostCover } from "@/components/post-cover";
import { getPost, isPublished, publishedPosts, relatedPosts, unsplash } from "@/content/posts";
import { headings, Markdown } from "@/lib/markdown";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Scheduled posts appear on their date without a new deploy.
export const revalidate = 3600;

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

/** Internal links are fine unless they point at a blog post that isn't published yet. */
function liveLink(href: string): boolean {
  const m = href.match(/^\/blog\/([^/?#]+)/);
  if (!m) return true;
  const target = getPost(m[1]);
  return Boolean(target && isPublished(target));
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post || !isPublished(post)) return {};
  const image = post.cover ? unsplash(post.cover.src, 1200) : `${site.url}/opengraph-image`;
  return {
    title: post.title,
    description: post.description,
    keywords: [post.keyword, ...(post.secondary ?? []), "OnBuy", "UK sellers"],
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: "The SellSail team", url: `${site.url}/about` }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      section: post.category,
      tags: [post.keyword, ...(post.secondary ?? [])],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image] },
  };
}

export default async function PostPage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post || !isPublished(post)) notFound();
  const { Body, md } = post;
  const url = `${site.url}/blog/${post.slug}`;
  const toc = md ? headings(md) : [];
  const more = relatedPosts(post, 4);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.cover ? unsplash(post.cover.src, 1200) : `${site.url}/opengraph-image`,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      inLanguage: "en-GB",
      articleSection: post.category,
      keywords: [post.keyword, ...(post.secondary ?? [])].join(", "),
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "The SellSail team", url: `${site.url}/about` },
      publisher: { "@id": `${site.url}/#organization` },
      ...(post.takeaways ? { abstract: post.takeaways.join(" ") } : {}),
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
  if (post.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

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
            <h1 className="mt-4 font-display text-[clamp(34px,5vw,58px)] leading-[1.04] font-extrabold tracking-[-0.035em]">{post.title}</h1>
            <p className="mt-5 text-xl leading-relaxed text-body">{post.description}</p>
            <p className="mt-5 text-sm text-muted">
              By the SellSail team · <time dateTime={post.date}>{longDate(post.date)}</time>
              {post.updated && post.updated !== post.date && (
                <>
                  {" "}· Updated <time dateTime={post.updated}>{longDate(post.updated)}</time>
                </>
              )}{" "}
              · {post.readingMinutes} min read
            </p>
          </div>
        </header>
        <figure className="mx-auto max-w-[1100px] px-6 pt-10">
          <PostCover post={post} size="lg" priority className="aspect-[16/9] w-full rounded-[28px]" />
          {post.cover && <figcaption className="mt-2 text-right text-xs text-muted">Photo: Unsplash</figcaption>}
        </figure>

        <div className="mx-auto max-w-[860px] px-6 py-12">
          {post.takeaways?.length ? (
            <section aria-labelledby="takeaways" className="mb-10 rounded-3xl border border-line bg-white p-6 sm:p-7">
              <h2 id="takeaways" className="flex items-center gap-2 font-display text-xl font-bold">
                <Sparkles aria-hidden="true" className="size-5 text-sea" /> Key takeaways
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[16px] leading-relaxed">
                {post.takeaways.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-sea" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {toc.length > 2 && (
            <nav aria-labelledby="toc" className="mb-10 rounded-3xl bg-mist p-6">
              <h2 id="toc" className="flex items-center gap-2 font-display text-lg font-bold">
                <ListChecks aria-hidden="true" className="size-5 text-sea" /> In this guide
              </h2>
              <ol className="mt-3 grid gap-1.5 text-[15px] sm:grid-cols-2">
                {toc.map((h, i) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-sea-dark no-underline hover:underline">
                      {i + 1}. {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="prose-site text-[17px]">{md ? <Markdown source={md} linkCheck={liveLink} /> : Body ? <Body /> : null}</div>

          {post.faq?.length ? (
            <section aria-labelledby="faq" className="mt-12">
              <h2 id="faq" className="font-display text-[28px] font-extrabold tracking-[-0.03em]">Frequently asked questions</h2>
              <div className="mt-6">
                <Faq items={post.faq} />
              </div>
            </section>
          ) : null}

          <aside className="mt-12 rounded-3xl bg-mint p-7">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Let SellSail do the maths</h2>
            <p className="mt-2 leading-relaxed text-body">
              SellSail prices every OnBuy listing from Amazon with your fees and profit built in, answers cheaper sellers and keeps
              stock in sync, so you never sell at a loss.
            </p>
            <Link href="/signup" className="mt-4 inline-block font-bold text-sea-dark underline underline-offset-4">
              Start your 14-day free trial →
            </Link>
          </aside>
          <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-ink no-underline hover:text-sea">
            <ArrowLeft aria-hidden="true" className="size-4" /> All articles
          </Link>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mx-auto max-w-[1200px] px-6 pb-16">
          <h2 id="more-title" className="font-display text-3xl font-extrabold tracking-[-0.03em]">Keep reading</h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group flex gap-5 rounded-3xl border border-line bg-white p-4 text-ink no-underline">
                  <PostCover post={p} size="sm" className="h-28 w-36 flex-none rounded-2xl" />
                  <span>
                    <span className="text-sm font-semibold text-sea-dark">{p.category}</span>
                    <span className="mt-1 block font-display text-lg leading-snug font-bold group-hover:text-sea-dark">{p.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
