import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { productImages } from "@/content/product-images";

// Worked examples at 15% commission (7% for the phone stand) and 20% VAT.
// Supplier cost includes the supplier's delivery charge.
const examples = [
  { name: "Steel water bottle", source: "Amazon", cost: "£10.89", price: "£19.99", fees: "£6.33", profit: "+£2.77", status: "WON", image: productImages.waterBottle, r: "-6deg", y: "18px" },
  { name: "LED desk lamp", source: "AliExpress", cost: "£16.90", price: "£29.99", fees: "£9.50", profit: "+£3.59", status: "RAISED", image: productImages.deskLamp, r: "-3deg", y: "4px" },
  { name: "Bamboo cutlery set", source: "Amazon", cost: "£13.90", price: "£23.48", fees: "£7.43", profit: "+£2.15", status: "WON", image: productImages.cutlery, r: "0deg", y: "0px", featured: true },
  { name: "Yoga mat", source: "AliExpress", cost: "£13.89", price: "£24.99", fees: "£7.92", profit: "+£3.18", status: "WON", image: productImages.yogaMat, r: "3deg", y: "4px" },
  { name: "Phone stand", source: "AliExpress", cost: "£5.49", price: "£12.99", fees: "£3.08", profit: "+£4.42", status: "WON", image: productImages.phoneStand, r: "6deg", y: "18px" },
];

export function Hero() {
  return (
    <section className="bg-dots">
      <div className="relative mx-auto max-w-[1200px] px-6 pt-16 text-center">
        <p className="mx-auto mb-6 inline-flex animate-rise items-center gap-2.5 rounded-full border border-line bg-white py-2 pr-4 pl-2 text-sm font-semibold">
          <Badge>Beta</Badge>
          The OnBuy dropshipping and repricing tool for UK sellers
        </p>
        <h1 className="mx-auto max-w-[1000px] animate-rise font-display text-[clamp(44px,7vw,92px)] leading-none font-extrabold tracking-[-0.045em]">
          Dropship to OnBuy from Amazon and AliExpress, <span className="highlight px-1.5">never at a loss</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl animate-rise text-xl leading-relaxed text-body">
          SellSail runs the whole loop: <strong className="text-ink">import products</strong>,{" "}
          <strong className="text-ink">list them on OnBuy</strong> with a floor that covers every fee, then{" "}
          <strong className="text-ink">sync stock and reprice</strong> around the clock.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3">
          <Link href="/beta" className={buttonVariants({ variant: "ink", size: "lg" })}>
            Join the free beta <span aria-hidden="true">→</span>
          </Link>
          <Link href="/onbuy-fee-calculator" className={buttonVariants({ variant: "sun", size: "lg" })}>
            Work out my OnBuy fees
          </Link>
        </div>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-body">
          {["Amazon and AliExpress sourcing", "Fee-aware floor prices", "No card needed"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-sea">✓</span>
              {t}
            </li>
          ))}
        </ul>

        <div
          aria-hidden="true"
          className="absolute top-40 left-0 hidden animate-bob rounded-2xl bg-white px-4 py-3 text-left text-[15px] font-bold shadow-[0_12px_30px_rgba(16,35,28,.12)] 2xl:block"
          style={{ "--r": "-8deg" } as React.CSSProperties}
        >
          Amazon · AliExpress
          <div className="text-xs font-medium text-muted">import by link</div>
        </div>
        <div
          aria-hidden="true"
          className="absolute top-52 right-0 hidden animate-bob rounded-2xl bg-white px-4 py-3 text-left text-[15px] font-bold shadow-[0_12px_30px_rgba(16,35,28,.12)] [animation-delay:1.2s] 2xl:block"
          style={{ "--r": "7deg" } as React.CSSProperties}
        >
          OnBuy listings
          <div className="text-xs font-medium text-muted">repriced 24/7</div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 pt-14 pb-10">
        <p className="mb-5 text-center font-hand text-2xl text-sea-dark">
          Examples, worked out with OnBuy commission and 20% VAT ↓
        </p>
        <ul className="flex flex-wrap justify-center gap-4">
          {examples.map((e, i) => (
            <li
              key={e.name}
              className={`fan-card flex-[0_1_200px] rounded-2xl bg-white p-4 text-left shadow-[0_14px_34px_rgba(16,35,28,.12)] ${e.featured ? "outline-2 outline-sea" : ""}`}
              style={{ "--r": e.r, "--y": e.y, animationDelay: `${0.05 + i * 0.1}s` } as React.CSSProperties}
            >
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image} alt={e.name} width={160} height={128} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{e.name}</span>
                <Badge variant={e.status === "WON" ? "mint" : "sun"} size="sm" className="text-[10px]">
                  {e.status}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted">from {e.source}</div>
              <dl className="mt-2.5 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[13px]">
                <dt className="text-muted">Supplier</dt>
                <dd>{e.cost}</dd>
                <dt className="text-muted">OnBuy price</dt>
                <dd className="font-bold">{e.price}</dd>
                <dt className="text-muted">Fees + VAT</dt>
                <dd>{e.fees}</dd>
                <dt className="font-bold text-sea-dark">Profit</dt>
                <dd className="font-bold text-sea-dark">{e.profit}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TrustMarquee() {
  const items = [
    "Registered UK company",
    "Prices in pounds",
    "VAT worked out for you",
    "OnBuy keys stored encrypted",
    "Every price change logged",
    "Cancel any time",
  ];
  return (
    <section aria-label="Why sellers can trust SellSail" className="overflow-hidden border-y border-line bg-white">
      <p className="mt-6 mb-3.5 text-center text-[13px] font-bold tracking-[0.12em] text-muted">
        BUILT FOR UK ONBUY SELLERS
      </p>
      <div className="flex w-max animate-marquee gap-3.5 pb-6" aria-hidden="true">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="rounded-full border border-line-soft px-4.5 py-2.5 font-semibold whitespace-nowrap">
            {t}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
