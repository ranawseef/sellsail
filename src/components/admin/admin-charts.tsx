"use client";

// Small charts for the admin overview: a daily column chart and a ring.
// Marks in the brand sea, text in ink tokens, growth animated on mount.

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function DailyBars({ data, label, unit }: { data: { day: string; n: number }[]; label: string; unit: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  const total = data.reduce((s, d) => s + d.n, 0);
  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <figure aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="sr-only">
        {label}: {total} in total over {data.length} days.
      </figcaption>
      <ol className="relative flex h-36 items-end gap-[3px] border-b border-line" aria-hidden="true">
        {data.map((d, i) => (
          <li
            key={d.day}
            className="relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <motion.span
              className={cn("block w-full rounded-t-[4px]", d.n ? (hover === i ? "bg-sea-dark" : "bg-sea") : "bg-line/60")}
              initial={reduce ? false : { height: 0 }}
              animate={{ height: d.n ? `${Math.max(4, (d.n / max) * 100)}%` : "2px" }}
              transition={{ duration: 0.6, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
            />
            {hover === i && (
              <span className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
                {fmt(d.day)} · {d.n} {unit}
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted" aria-hidden="true">
        <span>{data[0] ? fmt(data[0].day) : ""}</span>
        <span>Today</span>
      </div>
    </figure>
  );
}

/** Share of a whole as a ring, e.g. paying workspaces out of all. */
export function Ring({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const reduce = useReducedMotion();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90" role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="12" className="stroke-mist" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-sea"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div>
        <p className="font-display text-3xl font-extrabold">{Math.round(pct * 100)}%</p>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[13px] text-muted">{sub}</p>
      </div>
    </div>
  );
}
