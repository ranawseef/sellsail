import type { Metadata } from "next";
import { Check, Crown, TrendingUp } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";
import { TRIAL_DAYS } from "@/config/plans";
import { site } from "@/lib/site";

export const metadata: Metadata = { robots: { index: false, follow: true } };

const POINTS = [
  "Live Amazon UK prices, read for you",
  "Every OnBuy fee and VAT covered in each price",
  "Answers cheaper sellers, never below your floor",
  "Stock kept in sync every few minutes",
];

// Login, signup and the account pages: the form on the left, and on wide
// screens a dark panel on the right that sells the product with a small
// dashboard preview (demo shop numbers).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-white">
      {/* Form side */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo href={site.url} />
          <a href={site.url} className="text-sm font-semibold text-muted no-underline hover:text-ink">
            ← Back to site
          </a>
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-6 pt-6 pb-12 sm:px-10 sm:pt-12 lg:items-center lg:pt-0">
          {children}
        </main>
      </div>

      {/* Brand side */}
      <aside
        aria-label="Why SellSail"
        className="relative hidden w-[46%] max-w-[680px] shrink-0 flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex xl:p-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-[520px] rounded-full bg-sea/40 blur-[110px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 size-[420px] rounded-full bg-sun/15 blur-[110px]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
        />

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold text-white/90">
            <LogoMark size={22} /> The Amazon to OnBuy repricer
          </p>
          <h2 className="mt-6 max-w-md font-display text-[44px] leading-[1.02] font-extrabold tracking-[-0.04em] xl:text-[52px]">
            Sell more on OnBuy, <span className="text-sun">never at a loss.</span>
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-[#c9ddd5]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sea-mid/30 text-sun">
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Dashboard preview */}
        <div aria-hidden="true" className="relative mt-10">
          <div className="rounded-3xl bg-white p-5 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Revenue this month</p>
            </div>
            <div className="mt-1 flex items-end justify-between gap-4">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">£48,917</p>
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-xs font-bold text-sea-dark">
                <TrendingUp className="size-3" /> +377%
              </span>
            </div>
            <svg viewBox="0 0 300 70" className="mt-3 h-16 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="auth-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2a9c84" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2a9c84" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,58 L30,54 L60,55 L90,47 L120,44 L150,38 L180,35 L210,27 L240,22 L270,16 L300,8 L300,70 L0,70 Z" fill="url(#auth-area)" />
              <path d="M0,58 L30,54 L60,55 L90,47 L120,44 L150,38 L180,35 L210,27 L240,22 L270,16 L300,8" fill="none" stroke="#0e7c66" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="draw-in" />
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["1,932", "orders"],
                ["87%", "buy box"],
                ["£3.41", "profit / order"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-mist px-2 py-2">
                  <p className="font-display text-lg font-extrabold">{v}</p>
                  <p className="text-[11px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-5 -left-6 flex animate-bob items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-ink shadow-xl" style={{ "--r": "-4deg" } as React.CSSProperties}>
            <span className="flex size-8 items-center justify-center rounded-xl bg-sun">
              <Crown className="size-4" />
            </span>
            <span className="text-xs leading-tight">
              <b className="block text-[13px]">Buy box won</b>
              Yoga mat · £24.69
            </span>
          </div>
        </div>

        <p className="relative mt-10 text-sm font-semibold text-white/70">
          {TRIAL_DAYS}-day free trial · No card needed · Cancel any time
        </p>
      </aside>
    </div>
  );
}
