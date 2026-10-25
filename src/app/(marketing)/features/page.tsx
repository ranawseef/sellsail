import type { Metadata } from "next";
import { CtaBand, PageHero, SectionHeading } from "@/components/sections";
import { BuyBoxDive, FloorsDive, SyncDive } from "@/components/home/deep-dives";
import { HowItWorks } from "@/components/home/misc";
import { comingSoon, features } from "@/content/features";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features: Amazon to OnBuy repricing and competition",
  description:
    "Live Amazon UK prices, fee-aware OnBuy pricing, competition that never goes below your floor, stock sync every few minutes and safety brakes.",
  alternates: { canonical: "/features" },
};


export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={<>Everything you need to reprice on <span className="highlight px-1">OnBuy</span> from Amazon</>}
        intro="SellSail reads Amazon prices, works out an OnBuy price that covers every fee, answers cheaper sellers and keeps your listings in sync, around the clock."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <ul className="grid gap-5 md:grid-cols-2">
          {features.map((f) => (
            <li key={f.slug} id={f.slug} className="scroll-mt-28 rounded-3xl border border-line bg-white p-7">
              <span className={cn("flex size-12 items-center justify-center rounded-xl", f.tile, f.slug === "fee-calculator" && "bg-sun")}>
                <f.icon aria-hidden={true} className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em]">{f.title}</h2>
              <p className="mt-2 leading-relaxed text-body">{f.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="soon-title" className="mx-auto max-w-[1200px] px-6 pb-16">
        <h2 id="soon-title" className="font-display text-3xl font-bold tracking-[-0.02em]">Coming soon</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {comingSoon.map((c) => (
            <li key={c.title} className="rounded-3xl border-2 border-dashed border-line bg-white/60 p-6">
              <Badge variant="solid" size="sm">Coming soon</Badge>
              <h3 className="mt-3 text-lg font-bold">{c.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Feature details" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 pb-16">
        <FloorsDive />
        <BuyBoxDive />
        <SyncDive />
      </section>
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionHeading title="Up and running in three steps" />
        <div className="mt-12"><HowItWorks /></div>
      </section>
      <CtaBand />
    </>
  );
}
