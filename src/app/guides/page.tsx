import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { CtaBand, PageHero } from "@/components/sections";

export const metadata: Metadata = {
  title: "Guides for OnBuy sellers and dropshippers",
  description: "Practical guides on OnBuy fees, pricing, dropshipping from Amazon and AliExpress, and winning the Buy Box.",
  alternates: { canonical: "/guides" },
};

// Planned guides. Each is published only once its facts are checked against
// current OnBuy, Amazon and AliExpress sources.
const guides = [
  { title: "OnBuy fees explained", text: "Commission by category, VAT, delivery and the minimum fee, with worked examples.", tag: "Fees" },
  { title: "How to price for OnBuy dropshipping", text: "Set floors, margins and ceilings that survive fees and supplier changes.", tag: "Pricing" },
  { title: "Dropshipping from Amazon to OnBuy", text: "What to check before you start, and how to keep stock and prices in sync.", tag: "Dropshipping" },
  { title: "Dropshipping from AliExpress to OnBuy", text: "Choosing products, dispatch times and delivery promises you can keep.", tag: "Dropshipping" },
  { title: "How to win the Buy Box on OnBuy", text: "What affects the Buy Box and how to compete without a race to the bottom.", tag: "Repricing" },
  { title: "OnBuy seller checklist", text: "Account health, dispatch, returns and customer service basics.", tag: "Getting started" },
];

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Guides"
        title={<>Learn to sell <span className="highlight px-1">smarter on OnBuy</span></>}
        intro="Straightforward guides for UK sellers, checked against current marketplace rules before they're published."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <li key={g.title} className="flex flex-col rounded-3xl border border-line bg-white p-7">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="mint">{g.tag}</Badge>
                <Badge variant="grey">Coming soon</Badge>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">{g.title}</h2>
              <p className="mt-2 leading-relaxed text-body">{g.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand title="Get new guides first" intro="Join the beta list and we'll send new guides as they go live." />
    </>
  );
}
