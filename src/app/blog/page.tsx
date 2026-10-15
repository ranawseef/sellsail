import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CtaBand, PageHero } from "@/components/sections";
import { posts, unsplash } from "@/content/posts";

export const metadata: Metadata = {
  title: "Blog: OnBuy selling, pricing and dropshipping guides",
  description:
    "Practical guides for UK OnBuy sellers: fees explained, pricing for dropshipping, and sourcing from Amazon and AliExpress.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={<>Sell smarter <span className="highlight px-1">on OnBuy</span></>}
        intro="Straightforward guides for UK sellers on fees, pricing and dropshipping, written by people who sell online."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-[32px] border border-line bg-white text-ink no-underline md:grid-cols-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={unsplash(featured.cover.src, 1200)}
            alt={featured.cover.alt}
            width={1200}
            height={800}
            className="h-64 w-full object-cover md:h-full"
          />
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <div className="flex gap-2">
              <Badge variant="solid">Featured</Badge>
              <Badge variant="mint">{featured.category}</Badge>
            </div>
            <h2 className="mt-4 font-display text-[clamp(28px,3.4vw,40px)] leading-[1.05] font-extrabold tracking-[-0.035em] group-hover:text-sea-dark">
              {featured.title}
            </h2>
            <p className="mt-3 leading-relaxed text-body">{featured.description}</p>
            <p className="mt-5 text-sm text-muted">
              {formatDate(featured.date)} · {featured.readingMinutes} min read
            </p>
          </div>
        </Link>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-white text-ink no-underline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={unsplash(p.cover.src, 900)}
                  alt={p.cover.alt}
                  width={900}
                  height={560}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-7">
                  <Badge variant="mint" className="self-start">{p.category}</Badge>
                  <h2 className="mt-3 font-display text-2xl leading-tight font-bold tracking-[-0.02em] group-hover:text-sea-dark">
                    {p.title}
                  </h2>
                  <p className="mt-2 leading-relaxed text-body">{p.description}</p>
                  <p className="mt-auto pt-5 text-sm text-muted">
                    {formatDate(p.date)} · {p.readingMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand title="Get new guides first" intro="Join the beta list and we'll send new guides as they go live." />
    </>
  );
}
