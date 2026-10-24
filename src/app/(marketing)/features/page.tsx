import type { Metadata } from "next";
import { CtaBand, PageHero, SectionHeading } from "@/components/sections";
import { BuyBoxDive, FloorsDive, SyncDive } from "@/components/home/deep-dives";
import { HowItWorks } from "@/components/home/misc";
import { features } from "@/content/features";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features: OnBuy repricing and dropshipping automation",
  description:
    "Import products from Amazon and AliExpress, list them on OnBuy, and reprice with fee-aware floors, Buy Box watch, stock sync and safety brakes.",
  alternates: { canonical: "/features" },
};

const details: Record<string, string> = {
  "product-import": "Paste an Amazon or AliExpress product link and SellSail reads the title, images, supplier price and delivery, ready to turn into an OnBuy listing.",
  "onbuy-listing": "Review the imported product, set your margin, and publish it to OnBuy. You see the floor, the price and the profit before anything goes live.",
  "fee-aware-floors": "Every floor is built from supplier cost and delivery plus VAT and OnBuy commission, charged the way OnBuy charges it: on the VAT- and delivery-inclusive price.",
  "buy-box-watch": "See which listings are winning. SellSail reprices the rest inside your floor and ceiling, paced to stay within OnBuy's API rate limits.",
  "stock-price-sync": "On every sync SellSail checks your supplier. Cost changes move your floor and price; stock changes reach OnBuy so you don't oversell.",
  "out-of-stock-pause": "When your supplier runs out, the OnBuy listing pauses. When stock is back, it returns at the right price.",
  orders: "Every OnBuy order in one place, with the supplier link, the price it sold at and the profit after fees, so fulfilling is quick.",
  "safety-brakes": "An empty supplier response or a sudden jump across many prices stops the run before anything reaches OnBuy. One switch pauses everything.",
  "price-history": "Each price change is logged with what moved, when and why, so you can always see what SellSail did and undo a rule.",
  "fee-calculator": "Our free OnBuy fee calculator works out commission, VAT, profit and break-even price. No account needed.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={<>Everything you need to dropship and reprice on <span className="highlight px-1">OnBuy</span></>}
        intro="From importing a product to winning the Buy Box without selling at a loss, SellSail handles the busywork so you can grow your shop."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <ul className="grid gap-5 md:grid-cols-2">
          {features.map((f) => (
            <li key={f.slug} id={f.slug} className="scroll-mt-28 rounded-3xl border border-line bg-white p-7">
              <span className={cn("flex size-12 items-center justify-center rounded-xl", f.tile, f.slug === "fee-calculator" && "bg-sun")}>
                <f.icon aria-hidden={true} className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em]">{f.title}</h2>
              <p className="mt-2 leading-relaxed text-body">{details[f.slug]}</p>
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
