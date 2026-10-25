import Link from "next/link";
import { Check, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { compareRows, planIncludes, plans, trialNote } from "@/content/pricing";
import { cn } from "@/lib/utils";

/** The four plans as cards, with what each one gives you. */
export function PricingCards() {
  return (
    <>
      <ul className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const agency = p.id === "agency";
          return (
            <li
              key={p.id}
              className={cn(
                "group relative flex flex-col rounded-[28px] p-7 transition-all duration-300 hover:-translate-y-1",
                p.featured
                  ? "bg-ink text-white shadow-[0_30px_60px_-25px_rgba(14,124,102,0.65)] ring-2 ring-sea lg:-my-3 lg:py-10"
                  : agency
                    ? "bg-mint hover:shadow-[0_20px_40px_-24px_rgba(16,35,28,.35)]"
                    : "border border-line bg-white hover:shadow-[0_20px_40px_-24px_rgba(16,35,28,.35)]",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-sun px-3.5 py-1 text-[13px] font-bold whitespace-nowrap text-ink shadow">
                  <Sparkles aria-hidden="true" className="size-3.5" /> Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className={cn("mt-1 text-sm", p.featured ? "text-[#9fbdb1]" : "text-muted")}>{p.tagline}</p>

              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-[52px] leading-none font-extrabold tracking-[-0.04em]">{p.price}</span>
                <span className={cn("text-sm", p.featured ? "text-[#c9ddd5]" : "text-muted")}>/month</span>
              </p>
              <p className={cn("mt-1 text-[13px]", p.featured ? "text-[#9fbdb1]" : "text-muted")}>{agency ? "Tailored to your shops" : "+ VAT, billed monthly"}</p>

              <p
                className={cn(
                  "mt-5 rounded-xl px-3.5 py-2.5 text-center font-display text-lg font-bold",
                  p.featured ? "bg-[#13261e] text-sun" : agency ? "bg-white text-sea-dark" : "bg-mint text-sea-dark",
                )}
              >
                {p.listings}
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-[15px]">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <Check aria-hidden="true" className={cn("mt-0.5 size-[18px] shrink-0", p.featured ? "text-sun" : "text-sea")} />
                    <span className={p.featured ? "text-[#e3eee9]" : "text-body"}>{h}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className={cn(buttonVariants({ variant: p.featured ? "sun" : agency ? "sea" : "ink" }), "mt-7 w-full")}
              >
                {p.cta}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[15px] font-semibold text-body">
          <ShieldCheck aria-hidden="true" className="size-5 text-sea" />
          {trialNote}
        </p>
        <ul className="flex max-w-4xl flex-wrap justify-center gap-2" aria-label="Included in every plan">
          {planIncludes.map((f) => (
            <li key={f} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold">
              <Check aria-hidden="true" className="size-3.5 text-sea" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Side-by-side comparison of every plan, for the pricing page. */
export function PlanCompareTable() {
  const heads = plans.map((p) => p);
  return (
    <div className="relative overflow-x-auto rounded-[28px] border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-[15px]">
        <caption className="sr-only">What each SellSail plan includes</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="w-[34%] p-5 font-display text-lg font-bold">Compare plans</th>
            {heads.map((p) => (
              <th key={p.id} scope="col" className={cn("p-5 text-center align-bottom", p.featured && "bg-mint/60")}>
                <span className="block font-display text-lg font-bold">{p.name}</span>
                <span className="block text-sm font-semibold text-muted">
                  {p.price}
                  {p.id !== "agency" && "/mo"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareRows.map(([label, ...cells], r) => (
            <tr key={label} className={cn("border-b border-line/70 last:border-0", r === 4 && "border-t-2 border-t-line")}>
              <th scope="row" className="p-4 pl-5 font-semibold">{label}</th>
              {cells.map((c, i) => (
                <td key={i} className={cn("p-4 text-center", heads[i].featured && "bg-mint/60 font-semibold")}>
                  {c === "yes" ? (
                    <>
                      <Check aria-hidden="true" className="mx-auto size-5 text-sea" />
                      <span className="sr-only">Included</span>
                    </>
                  ) : c === "no" ? (
                    <>
                      <Minus aria-hidden="true" className="mx-auto size-5 text-muted" />
                      <span className="sr-only">Not included</span>
                    </>
                  ) : (
                    c
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-5" />
            {heads.map((p) => (
              <td key={p.id} className={cn("p-4", p.featured && "bg-mint/60")}>
                <Link href={p.href} className={cn(buttonVariants({ variant: p.featured ? "sea" : "outline", size: "sm" }), "w-full")}>
                  {p.id === "agency" ? "Talk to us" : "Try free"}
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
