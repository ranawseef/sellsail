import type { Metadata } from "next";
import Link from "next/link";
import { FeeCalculator } from "@/components/fee-calculator";
import { CtaBand, Faq, FaqJsonLd, PageHero, SectionHeading } from "@/components/sections";

export const metadata: Metadata = {
  title: "OnBuy fee calculator: commission, VAT and profit",
  description:
    "Free OnBuy fee and profit calculator for UK sellers. Work out OnBuy commission, VAT, profit, margin and your break-even price. No sign-up.",
  alternates: { canonical: "/onbuy-fee-calculator" },
};

// Rates are from third-party sources and not yet checked against OnBuy's own
// fee page. Update this date only after checking OnBuy's current fees.
const RATES_LAST_CHECKED = "not yet verified with OnBuy";

const faq = [
  {
    q: "How is OnBuy commission worked out?",
    a: "OnBuy charges a percentage commission that depends on the category. It is charged on what the buyer pays, including VAT and any delivery charge, with a small minimum fee per sale.",
  },
  {
    q: "What is a break-even price?",
    a: "The lowest selling price where your profit is zero after supplier cost, delivery, VAT and OnBuy commission. Sell below it and you lose money on every sale.",
  },
  {
    q: "Are these figures exact?",
    a: "They are estimates. OnBuy's fees can change and some categories use tiered rates, so check OnBuy's current fee page before you set prices.",
  },
  {
    q: "Is my data saved?",
    a: "No. The calculator runs in your browser and nothing you type is sent anywhere.",
  },
];

export default function CalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Free tool"
        title={<>OnBuy fee and <span className="highlight px-1">profit calculator</span></>}
        intro="Work out OnBuy commission, VAT, profit, margin and your break-even price in seconds. No sign-up, nothing leaves your browser."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-[36px] bg-sea p-4 sm:p-8">
          <FeeCalculator showDelivery />
        </div>
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-muted">
          Commission rates used: most categories 15%, consumer electronics 7%, jewellery 20%, minimum £0.25 per sale.
          Rates last checked: {RATES_LAST_CHECKED}. Estimates only, not financial or tax advice.
        </p>
      </section>
      <section className="mx-auto max-w-[820px] px-6 py-12">
        <div className="prose-site mx-auto">
          <h2>How this calculator works</h2>
          <p>
            Enter what you pay your supplier, including their delivery charge, and the price you sell at on OnBuy
            including VAT. The calculator takes out the VAT, works out OnBuy commission on the full amount the buyer pays,
            and shows what is left.
          </p>
          <p>
            Selling from Amazon or AliExpress? See how SellSail keeps these numbers right automatically on our{" "}
            <Link href="/dropshipping">OnBuy dropshipping</Link> page.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[820px] px-6 pb-16">
        <SectionHeading title="Calculator questions" />
        <div className="mt-8"><Faq items={faq} /></div>
        <FaqJsonLd items={faq} />
      </section>
      <CtaBand title="Let SellSail do this on every listing" />
    </>
  );
}
