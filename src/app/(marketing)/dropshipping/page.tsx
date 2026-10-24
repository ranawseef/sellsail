import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CtaBand, PageHero } from "@/components/sections";
import { Sourcing } from "@/components/home/sourcing";
import { faqText } from "@/content/faq";
import { Faq, FaqJsonLd, SectionHeading } from "@/components/sections";

export const metadata: Metadata = {
  title: "OnBuy dropshipping from Amazon and AliExpress",
  description:
    "Import products from Amazon and AliExpress, list them on OnBuy with prices that cover every fee, and keep stock and prices in sync automatically.",
  alternates: { canonical: "/dropshipping" },
};

const faq = [faqText.sources, faqText.feeds, faqText.belowCost, faqText.affiliated];

export default function DropshippingPage() {
  return (
    <>
      <PageHero
        eyebrow="OnBuy dropshipping"
        title={<>Dropship to OnBuy <span className="highlight px-1">without the spreadsheets</span></>}
        intro="Import from Amazon or AliExpress, list on OnBuy with a price that covers every fee, and let SellSail keep stock and prices in sync."
      >
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {[
            ["/dropshipping/amazon-to-onbuy", "Amazon to OnBuy", "Fast UK delivery from Amazon listings."],
            ["/dropshipping/aliexpress-to-onbuy", "AliExpress to OnBuy", "Low-cost products with wider margins."],
          ].map(([href, t, d]) => (
            <Link key={href} href={href} className="group rounded-3xl border border-line bg-white p-6 text-left text-ink no-underline hover:border-sea">
              <span className="flex items-center justify-between font-display text-2xl font-bold">
                {t} <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-1.5 block text-muted">{d}</span>
            </Link>
          ))}
        </div>
      </PageHero>
      <Sourcing />
      <section className="mx-auto max-w-[820px] px-6 py-16">
        <SectionHeading title="Dropshipping questions" />
        <div className="mt-8"><Faq items={faq} /></div>
        <FaqJsonLd items={faq} />
        <div className="mt-8 text-center">
          <Link href="/blog/amazon-aliexpress-to-onbuy-dropshipping" className={buttonVariants({ variant: "outline" })}>Read: what to check before you start</Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
