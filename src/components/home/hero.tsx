import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DemoVideo } from "@/components/home/demo-video";
import { TRIAL_DAYS } from "@/config/plans";
import { MessageCircle, Play } from "lucide-react";
import { portal, site } from "@/lib/site";

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

      <div id="demo" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-12 pb-14 sm:px-6 sm:pt-14 sm:pb-20">
        <DemoVideo />
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
