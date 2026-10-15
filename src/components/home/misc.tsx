import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FeeCalculator } from "@/components/fee-calculator";
import { plans, planIncludes } from "@/content/pricing";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const steps = [
    ["Connect OnBuy", "Add your OnBuy API keys. Nothing changes until you switch repricing on."],
    ["Add your sources", "Import products from Amazon or AliExpress, or link a CSV or XML supplier feed."],
    ["Pick a margin and go", "Choose your target margin. SellSail sets every floor and starts watching."],
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map(([title, text], i) => (
        <li key={title} className={cn("rounded-3xl bg-white p-7", i === 2 ? "border-2 border-sea" : "border border-line")}>
          <div className="font-hand text-[28px] text-sea">Step {i + 1}</div>
          <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em]">{title}</h3>
          <p className="mt-2 leading-relaxed text-body">{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function CalculatorBand() {
  return (
    <section id="calculator" className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex flex-wrap items-center gap-9 rounded-[36px] bg-sea p-8 text-white sm:p-12">
        <div className="min-w-0 flex-[1_1_380px]">
          <p className="inline-block rounded-full bg-sun px-3 py-1 text-[13px] font-bold text-ink">Free tool · try it here</p>
          <h2 className="mt-3.5 font-display text-[44px] leading-none font-extrabold tracking-[-0.04em]">
            How much do you really make on OnBuy?
          </h2>
          <p className="mt-3.5 text-lg leading-relaxed text-[#d9efe8]">
            Change the numbers and watch profit, margin and break-even update. No sign-up, nothing leaves your browser.
          </p>
          <Link href="/onbuy-fee-calculator" className={cn(buttonVariants({ variant: "white", size: "sm" }), "mt-6")}>
            Open the full calculator <span aria-hidden="true">→</span>
          </Link>
        </div>
        <FeeCalculator className="min-w-0 flex-[1_1_420px]" />
      </div>
    </section>
  );
}

export function Included() {
  const rows = [
    ["OnBuy selling guides", "fees, pricing, dropshipping"],
    ["Fee and profit calculator", "free for everyone"],
    ["UK support", "by email, from people who sell online"],
  ];
  return (
    <section aria-labelledby="included-title" className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="flex flex-wrap items-center gap-10">
        <div className="min-w-0 flex-[1_1_380px]">
          <h2 id="included-title" className="font-display text-[clamp(36px,4.6vw,56px)] leading-none font-extrabold tracking-[-0.045em]">
            More than just a repricer
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-body">
            Every plan comes with free guides on OnBuy selling and pricing, the fee calculator, and help from a UK team.
          </p>
        </div>
        <div className="min-w-0 flex-[1_1_400px] rounded-3xl bg-white p-6 shadow-[0_18px_40px_-16px_rgba(16,35,28,.2)]">
          <div className="text-xs font-bold tracking-[0.12em] text-muted">WHAT&apos;S INCLUDED</div>
          <ul className="mt-3.5">
            {rows.map(([t, s]) => (
              <li key={t} className="flex justify-between gap-3 border-b border-dashed border-line-soft py-3">
                <span>
                  <strong>{t}</strong>
                  <br />
                  <span className="text-muted">{s}</span>
                </span>
                <span className="text-xs font-bold text-sea-dark">INCLUDED</span>
              </li>
            ))}
            <li className="flex justify-between pt-3.5 font-display text-xl font-extrabold">
              <span>Extra cost</span>
              <span>£0.00</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PricingCards() {
  return (
    <>
      <ul className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <li
            key={p.name}
            className={cn(
              "relative flex flex-col gap-2.5 rounded-3xl p-7",
              p.featured ? "bg-ink text-white" : p.name === "Agency" ? "bg-mint" : "border border-line bg-white",
            )}
          >
            {p.featured && (
              <span className="absolute -top-3.5 right-5 rounded-full bg-sun px-3 py-1 text-[13px] font-bold text-ink">
                Most sellers
              </span>
            )}
            <h3 className="font-display text-2xl font-bold">{p.name}</h3>
            <div>
              <span className="font-display text-5xl font-extrabold tracking-[-0.04em]">{p.price}</span>
              <span className={p.featured ? "text-[#c9ddd5]" : "text-muted"}>/mo</span>
            </div>
            <p className={p.featured ? "text-[#c9ddd5]" : "text-muted"}>{p.note}</p>
            <Link
              href={p.href}
              className={cn(
                buttonVariants({ variant: p.featured ? "sun" : p.name === "Agency" ? "sea" : "outline" }),
                "mt-auto",
              )}
            >
              {p.cta}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-muted">
        Monthly, excluding VAT. Every plan includes {planIncludes.slice(0, 4).join(", ").toLowerCase()}.
      </p>
    </>
  );
}
