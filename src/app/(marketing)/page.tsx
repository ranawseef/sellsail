import { CtaBand, Faq, FaqJsonLd, SectionHeading } from "@/components/sections";
import { Hero, TrustMarquee } from "@/components/home/hero";
import { Sourcing } from "@/components/home/sourcing";
import { ToolGrid } from "@/components/home/tool-grid";
import { BuyBoxDive, FloorsDive, SyncDive } from "@/components/home/deep-dives";
import { Comparison } from "@/components/home/comparison";
import { CalculatorBand, HowItWorks, Included, PricingCards } from "@/components/home/misc";
import { InsideLook } from "@/components/home/inside-look";
import { homeFaq } from "@/content/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />
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
    </>
  );
}
