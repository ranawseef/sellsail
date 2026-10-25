import type { Metadata } from "next";
import { CtaBand, Faq, FaqJsonLd, PageHero, SectionHeading } from "@/components/sections";
import { PricingCards } from "@/components/home/misc";
import { planIncludes } from "@/content/pricing";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "Pricing: simple UK plans from £29 a month",
  description:
    "SellSail plans for OnBuy sellers: Starter £29 (5,000 listings), Growth £69 (20,000), Pro £149 (50,000) a month, excluding VAT. 14-day free trial, no card needed.",
  alternates: { canonical: "/pricing" },
};

const pricingFaq = [
  { q: "Do prices include VAT?", a: "No. Prices are monthly and exclude VAT, which is added at checkout where it applies." },
  faqText.trial,
  { q: "Can I cancel any time?", a: "Yes. Plans are monthly with no minimum term. Cancel in Billing and you keep access until the end of the month you've paid for." },
  { q: "Can I change plan later?", a: "Yes, at any time in Billing. The difference is charged or credited pro rata." },
  { q: "What counts as a listing?", a: "Each OnBuy SKU that SellSail prices for you. Archived SKUs that OnBuy no longer recognises don't count." },
  faqText.affiliated,
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Simple pricing <span className="highlight px-1">in pounds</span></>}
        intro="Pick the plan that fits your catalogue. Every plan includes Amazon price data, competition, stock sync and safety brakes. Start with a 14-day free trial."
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
