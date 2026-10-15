import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BrowserFrame, CheckList, Eyebrow } from "@/components/sections";

export function Sourcing() {
  return (
    <section id="sourcing" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="text-center">
        <Eyebrow>Dropshipping to OnBuy</Eyebrow>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-[clamp(34px,4.8vw,58px)] leading-none font-extrabold tracking-[-0.045em]">
          Source from Amazon or AliExpress. <span className="highlight px-1">Sell on OnBuy.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Paste a product link. SellSail imports it, works out an OnBuy price that covers every fee, lists it, and keeps
          it in sync with your supplier.
        </p>
      </div>

      <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Find", "Pick a product on Amazon or AliExpress"],
          ["Import", "Paste the link, SellSail pulls in the details"],
          ["Price", "Floor and target price worked out with fees"],
          ["List", "Publish it to OnBuy in one go"],
          ["Sync", "Stock and price follow your supplier"],
        ].map(([title, text], i) => (
          <li key={title} className="relative rounded-3xl border border-line bg-white p-5">
            <div className="font-hand text-2xl text-sea">Step {i + 1}</div>
            <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.02em]">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-body">{text}</p>
            {i < 4 && (
              <ArrowRight aria-hidden="true" className="absolute top-1/2 -right-3 z-10 hidden size-5 -translate-y-1/2 text-sea lg:block" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-12 rounded-[36px] bg-sky p-8 sm:p-12">
        <div className="min-w-0 flex-[1_1_380px]">
          <h3 className="font-display text-[40px] leading-none font-extrabold tracking-[-0.04em]">
            From product link to OnBuy listing
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-body">
            Import from Amazon UK or AliExpress. SellSail reads the supplier price and delivery, then shows you the
            floor, the price for your margin and the profit before anything goes live.
          </p>
          <CheckList
            items={[
              "Amazon and AliExpress product links",
              "Supplier price and delivery read for you",
              "Profit shown before you list",
              "Listings stay in sync with the supplier",
            ]}
          />
          <Link href="/dropshipping" className={`${buttonVariants({ variant: "ink" })} mt-7`}>
            How dropshipping works <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <BrowserFrame title="Import product">
            <div className="p-5">
              <div className="flex gap-2">
                <Badge variant="grey">Amazon</Badge>
                <Badge variant="mint">AliExpress</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-[#d5e3dd] px-3 py-3 text-sm text-muted">
                <Link2 aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">aliexpress.com/item/… (example)</span>
              </div>
              <div className="mt-4 rounded-2xl border border-[#eef3f1] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">LED desk lamp, dimmable</span>
                  <Badge variant="mint" size="sm">Ready to list</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-[#f6f8f7] p-3">
                    <dt className="text-muted">Supplier cost</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£16.90</dd>
                  </div>
                  <div className="rounded-xl bg-sun-soft p-3">
                    <dt className="text-sun-ink">Floor price</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£24.73</dd>
                  </div>
                  <div className="rounded-xl bg-[#f6f8f7] p-3">
                    <dt className="text-muted">OnBuy price</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£29.99</dd>
                  </div>
                  <div className="rounded-xl bg-mint p-3">
                    <dt className="text-sea-dark">Profit</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold text-sea-dark">£3.59</dd>
                  </div>
                </dl>
                <div className={`${buttonVariants({ variant: "sea", size: "sm" })} mt-4 w-full`} aria-hidden="true">
                  List on OnBuy
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-muted">
        Marketplace rules on dropshipping change. Check OnBuy&apos;s seller policy and your supplier&apos;s terms before you
        start: you are the seller of record.
      </p>
    </section>
  );
}
