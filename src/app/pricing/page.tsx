import type { Metadata } from "next";
import { CtaBand, Faq, FaqJsonLd, PageHero, SectionHeading } from "@/components/sections";
import { PricingCards } from "@/components/home/misc";
import { planIncludes } from "@/content/pricing";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "Pricing: simple UK plans from £29 a month",
  description: "SellSail plans for OnBuy sellers: Starter £29, Growth £69, Pro £149 and Agency from £249 a month, excluding VAT.",
  alternates: { canonical: "/pricing" },
};

const pricingFaq = [
  { q: "Do prices include VAT?", a: "No. Prices are monthly and exclude VAT, which is added at checkout where it applies." },
  { q: "Can I cancel any time?", a: "Yes. Plans are monthly with no minimum term, and you can cancel from your account." },
  { q: "Is the beta free?", a: "Yes. Beta places are free. We'll tell you well before any paid plan starts." },
  faqText.affiliated,
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Simple pricing <span className="highlight px-1">in pounds</span></>}
        intro="Pick the plan that fits your catalogue. Every plan includes the full repricer, stock sync and safety brakes."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <PricingCards />
      </section>
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="rounded-[36px] bg-mint p-8 sm:p-12">
          <h2 className="font-display text-[36px] leading-none font-extrabold tracking-[-0.04em]">Every plan includes</h2>
          <ul className="mt-6 grid gap-3 font-semibold sm:grid-cols-2 lg:grid-cols-3">
            {planIncludes.map((i) => (
              <li key={i} className="flex gap-2.5"><span aria-hidden="true" className="text-sea">✓</span>{i}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-[820px] px-6 py-16">
        <SectionHeading title="Pricing questions" />
        <div className="mt-8"><Faq items={pricingFaq} /></div>
        <FaqJsonLd items={pricingFaq} />
      </section>
      <CtaBand />
    </>
  );
}
