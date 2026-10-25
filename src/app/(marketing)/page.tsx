import type { Metadata } from "next";
import { CtaBand, Faq, FaqJsonLd, SectionHeading } from "@/components/sections";
import { Hero, TrustMarquee } from "@/components/home/hero";
import { Sourcing } from "@/components/home/sourcing";
import { ToolGrid } from "@/components/home/tool-grid";
import { BuyBoxDive, FloorsDive, SyncDive } from "@/components/home/deep-dives";
import { Comparison } from "@/components/home/comparison";
import { CalculatorBand, HowItWorks, Included } from "@/components/home/misc";
import { PricingCards } from "@/components/home/pricing";
import { InsideLook } from "@/components/home/inside-look";
import { DemoVideo } from "@/components/home/demo-video";
import { LiveStats } from "@/components/home/live-stats";
import { homeFaq } from "@/content/faq";
import { PAID_PLANS, PLANS } from "@/config/plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The product, for search engines: what it is, who makes it and what it costs.
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  url: site.url,
  description: site.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  publisher: { "@id": `${site.url}/#organization` },
  offers: PAID_PLANS.map((id) => ({
    "@type": "Offer",
    name: PLANS[id].name,
    price: (PLANS[id].pricePence / 100).toFixed(2),
    priceCurrency: "GBP",
    url: `${site.url}/pricing`,
  })),
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />

      <section id="demo" className="scroll-mt-20 bg-gradient-to-b from-white to-paper px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeading eyebrow="Watch the demo" title="See SellSail sell, in 35 seconds" intro="Connect, import, price, compete and sell: a demo shop running on autopilot." />
        <div className="mt-10 sm:mt-12">
          <DemoVideo />
        </div>
      </section>
      <LiveStats />
      <InsideLook />
      <Sourcing />

      <section className="mx-auto max-w-[1200px] px-6 pb-10">
        <SectionHeading title="One dashboard, every tool" intro="Everything you need to source, list, price and protect an OnBuy shop." />
        <div className="mt-12">
          <ToolGrid limit={8} />
        </div>
      </section>

      <section aria-label="Feature details" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-16">
        <FloorsDive />
        <BuyBoxDive />
        <SyncDive />
      </section>

      <Comparison />

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionHeading title="Up and running in three steps" />
        <div className="mt-12">
          <HowItWorks />
        </div>
      </section>

      <CalculatorBand />
      <Included />

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionHeading title="Simple pricing in pounds" />
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      <section className="mx-auto max-w-[820px] px-6 pt-10 pb-20">
        <SectionHeading title="Frequently asked questions" intro="Everything you need to know about dropshipping and repricing safely on OnBuy." />
        <div className="mt-8">
          <Faq items={homeFaq} />
        </div>
        <FaqJsonLd items={homeFaq} />
      </section>

      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    </>
  );
}
