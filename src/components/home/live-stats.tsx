"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/app/motion";

type Stats = { listings: number; changes7d: number; pushed7d: number };

// Only shown once the numbers are worth showing: real totals, never padded.
const MIN_TO_SHOW = 500;

/** Live platform totals, as social proof. Hidden until there is enough activity. */
export function LiveStats() {
  const reduce = useReducedMotion();
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/public-stats") // egress-guard: allow (same-origin)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Stats | null) => setS(d))
      .catch(() => setS(null));
  }, []);
  if (!s) return null;
  const items = [
    { value: s.listings, label: "OnBuy listings priced by SellSail" },
    { value: s.changes7d, label: "price and stock changes this week" },
    { value: s.pushed7d, label: "listings updated on OnBuy this week" },
  ].filter((i) => i.value >= MIN_TO_SHOW);
  if (items.length === 0) return null;
  return (
    <motion.section
      aria-label="SellSail in numbers"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1200px] px-6 pt-10"
    >
      <ul className="grid gap-4 rounded-[28px] bg-ink p-6 text-white sm:grid-cols-3 sm:p-8">
        {items.map((i) => (
          <li key={i.label} className="text-center">
            <p className="font-display text-[40px] leading-none font-extrabold text-sun">
              <AnimatedNumber value={i.value} />
            </p>
            <p className="mt-2 text-sm text-[#c9ddd5]">{i.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-muted">
        <span className="size-1.5 animate-pulse-soft rounded-full bg-sea" aria-hidden="true" /> Live totals from SellSail, updated hourly
      </p>
    </motion.section>
  );
}
