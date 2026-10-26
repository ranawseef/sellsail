"use client";

// One-series column chart (price changes per hour) and the Amazon → pricing →
// OnBuy pipeline. Marks in the brand sea; text always in ink tokens.

import { useId, useState } from "react";
import { ArrowRight, BadgePoundSterling, ShoppingCart, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/app/motion";
import { cn } from "@/lib/utils";

export function ChangesChart({ data }: { data: { hour: string; changes: number }[] }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(2, ...data.map((d) => d.changes));
  // Whole-number ticks for counts: a top of 2, 4 or 10 × 10ⁿ, so the middle
  // tick (half of it) is a whole number too.
  const step = 10 ** Math.floor(Math.log10(max));
  const top = [2, 4, 10, 20].map((m) => m * step).find((v) => v >= max) ?? max;
  const total = data.reduce((s, d) => s + d.changes, 0);

  return (
    <figure aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="sr-only">
        Price and stock changes per hour, last 24 hours, {total} in total.
      </figcaption>
      <div className="flex gap-2">
        <div className="flex h-40 flex-col justify-between pb-0.5 text-right text-[11px] text-muted tabular-nums" aria-hidden="true">
          <span>{top}</span>
          <span>{top / 2}</span>
          <span>0</span>
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 border-t border-dashed border-canvas-line" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-20 border-t border-dashed border-canvas-line" aria-hidden="true" />
          {total === 0 && (
            <p className="absolute inset-x-0 top-14 text-center text-sm font-semibold text-muted">No changes in the last 24 hours</p>
          )}
          <ol className="relative flex h-40 items-end gap-[2px] border-b border-canvas-line" aria-hidden="true">
            {data.map((d, i) => (
              <li
                key={d.hour}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
              >
                <span
                  className={cn("bar-grow block w-full max-w-6 rounded-t-[4px] transition-colors", d.changes ? (hover === i ? "bg-sea-dark" : "bg-sea") : "bg-transparent")}
                  style={{ height: `${(d.changes / top) * 100}%`, animationDelay: `${i * 0.02}s` }}
                />
                {hover === i && (
                  <span className="absolute bottom-full z-10 mb-1 rounded-lg bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
                    {d.hour} · {d.changes} change{d.changes === 1 ? "" : "s"}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted" aria-hidden="true">
            <span>{data[0]?.hour}</span>
            <span>{data[12]?.hour}</span>
            <span>now</span>
          </div>
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="font-semibold text-sea-dark">Show as a table</summary>
        <table className="mt-2 w-full text-left text-[13px]">
          <thead>
            <tr className="text-muted">
              <th scope="col" className="py-1 font-semibold">Hour (UTC)</th>
              <th scope="col" className="py-1 text-right font-semibold">Changes</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.hour} className="border-t border-canvas-line">
                <td className="py-1">{d.hour}</td>
                <td className="py-1 text-right tabular-nums">{d.changes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

type StageState = "ok" | "working" | "attention" | "off";
export type Stage = { title: string; state: StageState; value: number; unit: string; detail: string };

const STATE: Record<StageState, { label: string; badge: "mint" | "sky" | "danger" | "grey" }> = {
  ok: { label: "Running", badge: "mint" },
  working: { label: "Working", badge: "sky" },
  attention: { label: "Needs attention", badge: "danger" },
  off: { label: "Not set up", badge: "grey" },
};

const ICONS = [ShoppingCart, BadgePoundSterling, Store];

function Connector({ live }: { live: boolean }) {
  return (
    <div className="relative mx-auto flex h-8 w-px items-center justify-center md:h-auto md:w-full md:flex-1" aria-hidden="true">
      <div className="absolute inset-0 m-auto h-full w-[2px] rounded-full bg-line md:h-[2px] md:w-full" />
      {live && (
        <div className="absolute inset-0 hidden overflow-hidden md:block">
          {[0, 0.8, 1.6].map((d) => (
            <span key={d} className="absolute top-1/2 -mt-[3px] size-1.5 animate-flow rounded-full bg-sea" style={{ animationDelay: `${d}s`, left: 0 }} />
          ))}
        </div>
      )}
      <ArrowRight className="relative hidden size-4 rounded-full bg-white text-muted md:block" />
    </div>
  );
}

/** Amazon → pricing → OnBuy, each stage with its state and headline number. */
export function Pipeline({ stages }: { stages: [Stage, Stage, Stage] }) {
  return (
    <ol className="flex flex-col items-stretch md:flex-row md:items-center" aria-label="Repricing pipeline">
      {stages.map((s, i) => {
        const Icon = ICONS[i];
        const st = STATE[s.state];
        return (
          <li key={s.title} className="contents">
            {i > 0 && <Connector live={stages[i - 1].state === "ok" || stages[i - 1].state === "working"} />}
            <div className="rounded-2xl border border-canvas-line bg-white p-4 md:w-[30%] md:shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-mint text-sea-dark" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>
                  {s.title}
                </span>
                <Badge variant={st.badge} size="sm">
                  {s.state === "working" && <span className="size-1.5 animate-pulse-soft rounded-full bg-current" aria-hidden="true" />}
                  {st.label}
                </Badge>
              </div>
              <p className="mt-3 font-display text-[28px] leading-tight font-extrabold">
                <AnimatedNumber value={s.value} />
                <span className="ml-1.5 font-sans text-sm font-semibold text-muted">{s.unit}</span>
              </p>
              <p className="mt-0.5 text-[13px] text-muted">{s.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
