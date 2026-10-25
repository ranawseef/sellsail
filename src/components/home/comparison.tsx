"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Minus, TrendingDown, X } from "lucide-react";
import { SectionHeading } from "@/components/sections";
import { cn } from "@/lib/utils";

// One worked example, using SellSail's real formula: Amazon £13.90 delivered,
// 15% OnBuy commission, the default 25% band -> £20.44, and a "protect
// profit" floor keeping £1 per sale -> £17.53. Beat-by 5p.
const COST = 13.9;
const FEE = 0.15;
const BAND = 20.44;
const FLOOR = 17.53;
const BEAT = 0.05;
const MIN = 14.0;
const MAX = 22.0;

const profit = (p: number) => Math.round((p * (1 - FEE) - COST) * 100) / 100;
const gbp = (v: number) => `${v < 0 ? "−" : ""}£${Math.abs(v).toFixed(2)}`;

function sellsail(rival: number): { price: number; note: string; tone: "win" | "hold" } {
  if (rival > BAND) return { price: BAND, note: "Already the cheapest at your full price", tone: "win" };
  const target = Math.round((rival - BEAT) * 100) / 100;
  if (target >= FLOOR) return { price: target, note: `Undercuts by 5p and wins the sale`, tone: "win" };
  return { price: FLOOR, note: "Holds at your floor: no loss-making sales", tone: "hold" };
}

function PriceCard({
  dark,
  label,
  price,
  note,
  good,
}: {
  dark?: boolean;
  label: string;
  price: number;
  note: string;
  good: boolean;
}) {
  const reduce = useReducedMotion();
  const p = profit(price);
  const pct = ((price - MIN) / (MAX - MIN)) * 100;
  const floorPct = ((FLOOR - MIN) / (MAX - MIN)) * 100;
  const breakEven = COST / (1 - FEE);
  const bePct = ((breakEven - MIN) / (MAX - MIN)) * 100;
  return (
    <div className={cn("flex flex-col rounded-[28px] p-7 sm:p-8", dark ? "bg-ink text-white" : "border border-line bg-white")}>
      <p className={cn("font-bold", dark ? "text-sun" : "text-muted")}>{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className={cn("text-[13px]", dark ? "text-[#9fbdb1]" : "text-muted")}>Lists at</p>
          <p className="font-display text-[44px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{gbp(price)}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-[13px]", dark ? "text-[#9fbdb1]" : "text-muted")}>Profit per sale</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={p.toFixed(2)}
              initial={reduce ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -10, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={cn("font-display text-[30px] leading-none font-extrabold tabular-nums", p < 0 ? "text-[#e0573f]" : dark ? "text-[#5fd3b6]" : "text-sea")}
            >
              {p > 0 ? "+" : ""}
              {gbp(p)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Price track: where this price sits against break-even and the floor. */}
      <div className="relative mt-7 h-3 rounded-full" aria-hidden="true" style={{ background: dark ? "#13261e" : "#eef3f1" }}>
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-[#e0573f]/25" style={{ width: `${bePct}%` }} />
        <motion.div
          className={cn("absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]", good ? "border-white bg-sea" : "border-white bg-[#e0573f]")}
          animate={{ left: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        {dark && (
          <div className="absolute -top-2 h-7 border-l-2 border-dashed border-sun" style={{ left: `${floorPct}%` }}>
            <span className="absolute -top-5 -translate-x-1/2 text-[11px] font-bold whitespace-nowrap text-sun">floor</span>
          </div>
        )}
      </div>
      <div className={cn("mt-1.5 flex justify-between text-[11px]", dark ? "text-[#9fbdb1]" : "text-muted")} aria-hidden="true">
        <span>loss zone</span>
        <span>break-even {gbp(breakEven)}</span>
      </div>

      <p
        className={cn(
          "mt-6 flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold",
          good ? (dark ? "bg-[#13261e] text-[#5fd3b6]" : "bg-mint text-sea-dark") : "bg-[#fdecea] text-[#9b1c1c]",
        )}
      >
        {good ? <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <TrendingDown aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
        {note}
      </p>
    </div>
  );
}

const ROWS: [string, string, string, string][] = [
  ["Prices built from the live Amazon cost", "yes", "no", "no"],
  ["OnBuy commission and fees in every price", "yes", "partly", "manual"],
  ["Floor moves when Amazon's price moves", "yes", "no", "no"],
  ["Answers cheaper OnBuy sellers", "yes", "yes", "no"],
  ["Never sells below your floor", "yes", "no", "manual"],
  ["Out of stock when Amazon runs out", "yes", "no", "no"],
  ["Double-checks sudden price drops", "yes", "no", "no"],
  ["Amazon API keys needed", "None", "Often", "—"],
  ["Works while you sleep", "yes", "yes", "no"],
];

function Cell({ v, strong }: { v: string; strong?: boolean }) {
  if (v === "yes")
    return (
      <span className={cn("mx-auto flex size-7 items-center justify-center rounded-full", strong ? "bg-sea text-white" : "bg-mint text-sea")}>
        <Check aria-hidden="true" className="size-4" />
        <span className="sr-only">Yes</span>
      </span>
    );
  if (v === "no")
    return (
      <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#f3f5f4] text-muted">
        <X aria-hidden="true" className="size-4" />
        <span className="sr-only">No</span>
      </span>
    );
  if (v === "partly" || v === "manual")
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted">
        <Minus aria-hidden="true" className="size-4" />
        {v === "partly" ? "Partly" : "By hand"}
      </span>
    );
  return <span className={cn("text-sm font-semibold", strong ? "text-sea-dark" : "text-muted")}>{v}</span>;
}

export function Comparison() {
  const id = useId();
  const [rival, setRival] = useState(15.99);
  const matcher = Math.round(rival * 100) / 100;
  const ss = sellsail(rival);

  return (
    <section aria-labelledby="compare-title" className="mx-auto max-w-[1200px] px-6 py-20">
      <SectionHeading
        title={
          <span id="compare-title">
            Most repricers race to the bottom. SellSail knows <span className="highlight px-1">where the bottom is</span>.
          </span>
        }
        intro="Drag the rival's price and watch what each repricer does with the same product."
      />

      <div className="mx-auto mt-10 max-w-3xl rounded-[28px] bg-sun-soft p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor={`${id}-rival`} className="font-bold">
            A rival lists the same item at
          </label>
          <output htmlFor={`${id}-rival`} className="font-display text-3xl font-extrabold tabular-nums">
            {gbp(rival)}
          </output>
        </div>
        <input
          id={`${id}-rival`}
          type="range"
          min={MIN}
          max={MAX}
          step={0.05}
          value={rival}
          onChange={(e) => setRival(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer accent-ink"
        />
        <p className="mt-2 text-[13px] text-sun-ink">
          Example product: Amazon cost £13.90 delivered, 15% OnBuy commission. SellSail&apos;s floor keeps £1.00 profit.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <PriceCard
          label="A simple price-matching repricer"
          price={matcher}
          good={profit(matcher) >= 0}
          note={profit(matcher) < 0 ? `Matches the rival and loses ${gbp(-profit(matcher))} on every sale` : "Matches the rival, but nothing stops it going lower"}
        />
        <PriceCard dark label="SellSail" price={ss.price} good note={ss.note} />
      </div>

      <div className="mt-14 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <caption className="sr-only">SellSail compared with a typical repricer and with spreadsheets</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[44%] p-5 font-display text-lg font-bold">How they compare</th>
              <th scope="col" className="bg-ink p-5 text-center font-display text-lg font-bold text-white">SellSail</th>
              <th scope="col" className="p-5 text-center font-semibold text-muted">Typical repricer</th>
              <th scope="col" className="p-5 text-center font-semibold text-muted">Spreadsheets</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, a, b, c]) => (
              <tr key={label} className="border-b border-line/70 last:border-0">
                <th scope="row" className="p-4 pl-5 font-semibold">{label}</th>
                <td className="bg-mint/50 p-4 text-center"><Cell v={a} strong /></td>
                <td className="p-4 text-center"><Cell v={b} /></td>
                <td className="p-4 text-center"><Cell v={c} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-[13px] text-muted">&quot;Typical repricer&quot; means a general price-matching tool set up with fixed minimum and maximum prices.</p>
    </section>
  );
}
