"use client";

// Motion for the dashboard. The site's CSS animations stop under
// prefers-reduced-motion through globals.css; JavaScript animation doesn't
// see that rule, so everything here sits under MotionConfig reducedMotion="user"
// and the counters jump straight to their value.

import { useEffect, useRef, useState } from "react";
import { animate, motion, MotionConfig, useInView, useReducedMotion } from "motion/react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster position="bottom-right" toastOptions={{ className: "font-sans" }} />
    </MotionConfig>
  );
}

/** Fades and lifts its children in, after `delay` seconds. */
export function Rise({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

const formats = {
  count: new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }),
  gbp: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
  pct: new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }),
};

/** Counts up from zero to `value` the first time it scrolls into view. */
export function AnimatedNumber({ value, format = "count", suffix = "" }: { value: number; format?: keyof typeof formats; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 1.1, ease: [0.2, 0.8, 0.2, 1], onUpdate: setAnimated });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const shown = reduce ? value : animated;
  const text = formats[format].format(format === "count" ? Math.round(shown) : shown) + suffix;
  return (
    <span ref={ref} className="tabular-nums">
      {/* Screen readers get the final value once, not every frame. */}
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{formats[format].format(value) + suffix}</span>
    </span>
  );
}

/** A progress bar that grows to its value. */
export function ProgressBar({ value, max, label, tone = "sea" }: { value: number; max: number; label: string; tone?: "sea" | "sun" | "danger" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar = tone === "sun" ? "bg-sun" : tone === "danger" ? "bg-danger" : "bg-sea";
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2 w-full overflow-hidden rounded-full bg-mist">
      <motion.div className={`h-full rounded-full ${bar}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}
