import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { productImages } from "@/content/product-images";
import { TRIAL_DAYS } from "@/config/plans";
import { MessageCircle, Play } from "lucide-react";
import { portal, site } from "@/lib/site";

// Worked examples at 15% commission (7% for the phone stand) and 20% VAT.
// Supplier cost includes the supplier's delivery charge.
const examples = [
  { name: "Steel water bottle", source: "Amazon", cost: "£10.89", price: "£19.99", fees: "£6.33", profit: "+£2.77", status: "WON", image: productImages.waterBottle, r: "-6deg", y: "18px" },
  { name: "LED desk lamp", source: "Amazon", cost: "£16.90", price: "£29.99", fees: "£9.50", profit: "+£3.59", status: "RAISED", image: productImages.deskLamp, r: "-3deg", y: "4px" },
  { name: "Bamboo cutlery set", source: "Amazon", cost: "£13.90", price: "£23.48", fees: "£7.43", profit: "+£2.15", status: "WON", image: productImages.cutlery, r: "0deg", y: "0px", featured: true },
  { name: "Yoga mat", source: "Amazon", cost: "£13.89", price: "£24.99", fees: "£7.92", profit: "+£3.18", status: "WON", image: productImages.yogaMat, r: "3deg", y: "4px" },
  { name: "Phone stand", source: "Amazon", cost: "£5.49", price: "£12.99", fees: "£3.08", profit: "+£4.42", status: "WON", image: productImages.phoneStand, r: "6deg", y: "18px" },
];

export function Hero() {
  return (
    <section className="bg-dots">
      <div className="relative mx-auto max-w-[1200px] px-6 pt-16 text-center">
        <p className="mx-auto mb-6 inline-flex animate-rise items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pr-4 pl-1.5 text-[13px] font-semibold sm:py-2 sm:pl-2 sm:text-sm">
          <Badge className="shrink-0">{TRIAL_DAYS}-day free trial</Badge>
          <span className="sm:hidden">Amazon to OnBuy repricer</span>
          <span className="hidden sm:inline">The Amazon to OnBuy repricer for UK sellers</span>
        </p>
        <h1 className="mx-auto max-w-[1000px] animate-rise font-display text-[clamp(40px,7vw,92px)] leading-none font-extrabold tracking-[-0.045em]">
          Reprice OnBuy from Amazon, <span className="highlight px-1.5">never at a loss</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-body sm:mt-7 sm:text-xl">
          SellSail <strong className="text-ink">reads live Amazon UK prices</strong>, sets an OnBuy price that{" "}
          <strong className="text-ink">covers every fee and your profit</strong>, answers cheaper sellers, and{" "}
          <strong className="text-ink">keeps stock in sync</strong> around the clock.
        </p>
        <div className="mt-8 flex animate-rise flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link href={portal("/signup")} className={buttonVariants({ variant: "ink", size: "lg" })}>
            Start your free trial <span aria-hidden="true">→</span>
          </Link>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "sun", size: "lg" })}>
            <MessageCircle aria-hidden="true" className="size-5" /> Book a demo
          </a>
        </div>
        <a href="#demo" className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-sea-dark no-underline hover:underline">
          <span className="flex size-8 items-center justify-center rounded-full bg-sea text-white">
            <Play aria-hidden="true" className="ml-0.5 size-3.5 fill-white" />
          </span>
          Watch the 30-second demo
        </a>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-body">
          {["No Amazon keys needed", "Never below your floor", "No card needed"].map((t) => (
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
          Amazon UK
          <div className="text-xs font-medium text-muted">prices read for you</div>
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

      <div className="mx-auto max-w-[1240px] pt-12 pb-10 sm:px-6 sm:pt-14">
        <p className="mb-5 px-6 text-center text-sm font-semibold tracking-wide text-sea-dark">
          Illustrative examples, with OnBuy commission and VAT ↓
        </p>
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pt-2 pb-6 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0">
          {examples.map((e, i) => (
            <li
              key={e.name}
              className={`fan-card w-[200px] shrink-0 snap-center rounded-2xl sm:w-auto sm:flex-[0_1_200px] bg-white p-4 text-left shadow-[0_14px_34px_rgba(16,35,28,.12)] ${e.featured ? "outline-2 outline-sea" : ""}`}
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
    "No Amazon keys needed",
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
