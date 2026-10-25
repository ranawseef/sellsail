import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BrowserFrame, CheckList, Eyebrow } from "@/components/sections";
import { productImages } from "@/content/product-images";

// Worked with the default 25% band and 15% commission: Amazon £16.90 landed
// -> £24.85 on OnBuy; a rival at £24.49 is answered at £24.44 (profit £3.87).
export function Sourcing() {
  return (
    <section id="sourcing" className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="text-center">
        <Eyebrow>Amazon to OnBuy</Eyebrow>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-[clamp(34px,4.8vw,58px)] leading-none font-extrabold tracking-[-0.045em]">
          Source from Amazon. <span className="highlight px-1">Sell on OnBuy.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Connect your OnBuy shop, bring in your listings, and SellSail keeps every price and stock level in step with
          Amazon UK, with your fees and profit built in.
        </p>
      </div>

      <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Connect", "Add your OnBuy API keys. No Amazon keys needed"],
          ["Import", "Bring in your OnBuy listings, or upload a CSV"],
          ["Price", "Margin bands turn each Amazon price into an OnBuy price"],
          ["Compete", "Cheaper OnBuy sellers are answered, down to your floor"],
          ["Sync", "Prices and stock reach OnBuy every few minutes"],
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
            Every listing, priced from Amazon
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-body">
            SellSail reads the Amazon UK offer behind each listing: fulfilled by Amazon, in stock and dispatched within 48
            hours. It works out your OnBuy price, checks who&apos;s cheaper on OnBuy, and sends the result.
          </p>
          <CheckList
            items={[
              "Amazon prices read for you, no Amazon account needed",
              "Your fees and profit built into every price",
              "Out of stock on OnBuy when Amazon runs out",
              "AliExpress as a source is coming soon",
            ]}
          />
          <Link href="/dropshipping/amazon-to-onbuy" className={`${buttonVariants({ variant: "ink" })} mt-7`}>
            How Amazon to OnBuy works <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <BrowserFrame title="Products">
            <div className="p-5">
              <div className="rounded-2xl border border-[#eef3f1] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productImages.deskLamp} alt="" width={56} height={56} referrerPolicy="no-referrer" className="size-14 shrink-0 rounded-xl border border-[#eef3f1] object-contain" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">LED desk lamp, dimmable</span>
                      <span className="block font-mono text-[12px] text-muted">Example listing</span>
                    </span>
                  </span>
                  <Badge variant="mint" size="sm">Winning</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-[#f6f8f7] p-3">
                    <dt className="text-muted">Amazon price</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£16.90</dd>
                  </div>
                  <div className="rounded-xl bg-sun-soft p-3">
                    <dt className="text-sun-ink">Cheapest rival</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£24.49</dd>
                  </div>
                  <div className="rounded-xl bg-[#f6f8f7] p-3">
                    <dt className="text-muted">Your OnBuy price</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">£24.44</dd>
                  </div>
                  <div className="rounded-xl bg-mint p-3">
                    <dt className="text-sea-dark">Profit after fees</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold text-sea-dark">£3.87</dd>
                  </div>
                </dl>
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-mint px-3 py-2.5 text-[13px] font-semibold text-sea-dark">
                  <span className="size-2 animate-pulse-soft rounded-full bg-sea" aria-hidden="true" />
                  Sent to OnBuy 2 minutes ago · 3 in stock
                </p>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-muted">
        Marketplace rules on dropshipping change. Check OnBuy&apos;s seller policy and Amazon&apos;s terms before you
        start: you are the seller of record.
      </p>
    </section>
  );
}
