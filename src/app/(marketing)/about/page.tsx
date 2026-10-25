import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About SellSail: the UK OnBuy repricer team",
  description: "SellSail is a UK-built repricer for OnBuy sellers and dropshippers: who we are, why we built it, and how we keep sellers profitable and in control.",
  alternates: { canonical: "/about" },
};

const values = [
  ["Safe by default", "Every price has a floor that covers your costs and fees. Safety brakes stop a run when data looks wrong."],
  ["Clear UK pricing", "Prices in pounds, VAT handled properly, and no surprise fees."],
  ["Simple to set up", "Connect OnBuy, import your listings, check your margins. No Amazon keys needed."],
  ["Honest about rules", "We point you to the marketplace rules that apply, and never promise what we can't deliver."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>Built by a UK seller, <span className="highlight px-1">for UK sellers</span></>}
        intro="SellSail started with a simple problem: repricers that chase the lowest price can quietly sell below cost once marketplace fees and VAT are counted."
      />
      <section className="mx-auto max-w-[820px] px-6 py-16">
        <div className="prose-site mx-auto">
          <p>
            SellSail is made by an OnBuy and eBay dropshipper running a registered UK company. Doing the fee maths by hand
            for every listing was slow, and getting it wrong was expensive. So we built a tool that does it properly: it
            reads Amazon prices, works out an OnBuy price that covers every fee, and only competes where there is profit
            to win.
          </p>
          <p>
            SellSail is a trading name of {site.company}, a company registered in England and Wales (number{" "}
            {site.companyNumber}).
          </p>
          <p>
            We&apos;re starting with OnBuy because UK sellers there deserve tools that understand UK pricing, VAT and the
            way OnBuy charges commission. AliExpress as a source and eBay as a marketplace are next.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([t, d]) => (
            <li key={t} className="rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display text-xl font-bold">{t}</h2>
              <p className="mt-2 leading-relaxed text-body">{d}</p>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
