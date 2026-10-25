"use client";

// "Inside SellSail": an animated mock of the seller dashboard for the home
// page. It cycles through four screens (pausing on hover or keyboard focus),
// and each screen moves the way the real one does: counters tick up, the
// pipeline flows, prices update row by row, runs stream into the log.
//
// The pricing screen uses the real formula from src/lib/pricing.ts with the
// default bands, so its numbers are what SellSail would actually charge.
// Everything inside the frame is illustration (aria-hidden); the tabs are
// real buttons. Under prefers-reduced-motion nothing auto-plays and counters
// show their final values.

import { useEffect, useId, useRef, useState } from "react";
import { animate, AnimatePresence, motion, MotionConfig, useInView, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Boxes,
  CheckCircle2,
  CircleCheck,
  Clock3,
  LayoutDashboard,
  Power,
  SlidersHorizontal,
  Sparkles,
  Store,
  ShoppingCart,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { BrowserFrame } from "@/components/sections";
import { DEFAULT_BANDS, estimatedProfit, marketplacePrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const SCREENS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, blurb: "Your whole shop at a glance: listings, stock, what's waiting to go to OnBuy." },
  { id: "pricing", label: "Pricing rules", icon: SlidersHorizontal, blurb: "Margins by Amazon price. Every OnBuy price covers fees and your minimum profit." },
  { id: "products", label: "Products", icon: Boxes, blurb: "Each listing repriced from live Amazon offers, and confirmed by OnBuy SKU by SKU." },
  { id: "automation", label: "Automation", icon: Workflow, blurb: "Runs every minute on its own, with a full history and one switch to pause it all." },
] as const;
type ScreenId = (typeof SCREENS)[number]["id"];

const SCREEN_MS = 6500;
const EASE = [0.2, 0.8, 0.2, 1] as const;
const FEES = { marketplaceFeePct: 18, paymentFeePct: 0, paymentFixedFee: 0 };
const gbp = (n: number) => `£${n.toFixed(2)}`;

/**
 * Animates from its previous value to the new one. Money starts at its real
 * value and only moves when it changes; counts start part-way up so the demo
 * never shows an empty (zero) dashboard, even for a frame.
 */
function Count({ value, money = false }: { value: number; money?: boolean }) {
  const reduce = useReducedMotion();
  const start = money ? value : Math.round(value * 0.7);
  const [shown, setShown] = useState(start);
  const from = useRef(start);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(from.current, value, {
      duration: 1,
      ease: EASE,
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);
  const v = reduce ? value : shown;
  return <span className="tabular-nums">{money ? gbp(v) : Math.round(v).toLocaleString("en-GB")}</span>;
}

export function InsideLook() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-20% 0px -20% 0px" });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const id = useId();
  const playing = inView && !hold && !reduce;
  const screen = SCREENS[index];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SCREENS.length), SCREEN_MS);
    return () => clearTimeout(t);
  }, [index, playing]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-labelledby={`${id}-title`}
        className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-paper)_0%,var(--color-mint)_45%,var(--color-paper)_100%)] py-20"
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-sea-dark shadow-[0_6px_18px_-10px_rgba(16,35,28,.35)]">
              <Sparkles aria-hidden="true" className="size-4" /> Inside SellSail
            </p>
            <h2 id={`${id}-title`} className="mt-4 font-display text-[clamp(34px,4.8vw,58px)] leading-none font-extrabold tracking-[-0.045em]">
              Watch your repricer <span className="highlight px-1">work for you</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              This is the dashboard you get. Amazon prices come in, your margins are applied, and OnBuy is kept in step, all day, without you.
            </p>
          </div>

          <div
            className="mt-10"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false);
            }}
          >
            <div role="tablist" aria-label="Dashboard screens" className="relative mx-auto flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_10px_30px_-18px_rgba(16,35,28,.45)] sm:w-fit">
              {SCREENS.map((s, i) => {
                const active = i === index;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${s.id}`}
                    aria-selected={active}
                    aria-controls={`${id}-panel`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full px-4 text-sm font-bold transition-colors",
                      active ? "text-white" : "text-body hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                    <Icon aria-hidden="true" className="relative size-4" />
                    <span className="relative">{s.label}</span>
                    {active && playing && (
                      <motion.span
                        key={`timer-${index}`}
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-[3px] bg-sun"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: SCREEN_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mx-auto mt-4 min-h-[3rem] max-w-xl text-center text-[15px] leading-relaxed text-body" aria-live="polite">
              {screen.blurb}
            </p>

            <div className="relative mx-auto mt-4 max-w-[1080px]">
              <Toasts playing={playing} />
              <div
                id={`${id}-panel`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${screen.id}`}
              >
                <p className="sr-only">Animated preview of the {screen.label} screen, with example data.</p>
                <BrowserFrame title={screen.label.toLowerCase()} right={<LiveDot playing={playing} />}>
                  <div aria-hidden="true" className="grid min-h-[400px] grid-cols-1 bg-paper text-left sm:grid-cols-[170px_minmax(0,1fr)]">
                    <Sidebar active={screen.id} />
                    {/* The screens crossfade in one grid cell, so the frame is never empty mid-switch. */}
                    <div className="grid min-w-0 p-4 sm:p-6">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={screen.id}
                          className="col-start-1 row-start-1 min-w-0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {screen.id === "overview" && <OverviewScreen playing={playing} />}
                          {screen.id === "pricing" && <PricingScreen playing={playing} />}
                          {screen.id === "products" && <ProductsScreen playing={playing} />}
                          {screen.id === "automation" && <AutomationScreen playing={playing} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </BrowserFrame>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function LiveDot({ playing }: { playing: boolean }) {
  return (
    <span className="flex items-center gap-1.5 font-semibold text-sea-dark">
      <span className="relative flex size-2">
        {playing && <span className="absolute inline-flex size-full animate-ping rounded-full bg-sea opacity-60" />}
        <span className="relative inline-flex size-2 rounded-full bg-sea" />
      </span>
      Live
    </span>
  );
}

function Sidebar({ active }: { active: ScreenId }) {
  return (
    <div className="hidden border-r border-line bg-white p-3 sm:block">
      <p className="px-2 pb-3 font-display text-lg font-extrabold tracking-tight">
        Sell<span className="text-sea">Sail</span>
      </p>
      <ul className="flex flex-col gap-1">
        {SCREENS.map((s) => {
          const Icon = s.icon;
          const on = s.id === active;
          return (
            <li key={s.id}>
              {/* Mirrors the tabs above, which are the real control. */}
              <div className={cn("relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] font-semibold", on ? "text-ink" : "text-muted")}>
                {on && <motion.span layoutId="inside-nav" className="absolute inset-0 rounded-xl bg-mint" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative size-4" />
                <span className="relative">{s.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 rounded-xl bg-sun-soft p-2.5 text-[11px] font-semibold text-sun-ink">Trial · 12 days left</div>
    </div>
  );
}

// ---- Overview ---------------------------------------------------------------

function Tile({ label, value, sub, tone, icon, delay }: { label: string; value: number; sub: string; tone: string; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={cn("rounded-2xl p-3", tone)}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-body">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
        <Count value={value} />
      </p>
      <p className="text-[11px] text-muted">{sub}</p>
    </motion.div>
  );
}

function OverviewScreen({ playing }: { playing: boolean }) {
  const bars = [32, 48, 41, 66, 58, 74, 52, 88, 71, 95, 63, 80];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-sea uppercase">Overview</p>
          <p className="font-display text-xl font-extrabold tracking-tight">Good morning, Sam</p>
        </div>
        <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-bold text-sea-dark">All systems running</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Tile label="Listings" value={2481} sub="12 archived" tone="bg-white" icon={<Boxes className="size-3.5" />} delay={0} />
        <Tile label="In stock" value={2206} sub="275 out of stock" tone="bg-mint" icon={<CircleCheck className="size-3.5" />} delay={0.08} />
        <Tile label="Waiting to send" value={37} sub="next push in 2 min" tone="bg-sun-soft" icon={<Clock3 className="size-3.5" />} delay={0.16} />
        <Tile label="Changes, 24h" value={1128} sub="prices and stock" tone="bg-sky" icon={<TrendingUp className="size-3.5" />} delay={0.24} />
      </div>
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-3 text-[12px] font-bold">Pipeline</p>
          <Pipeline playing={playing} />
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="mb-3 text-[12px] font-bold">Changes per hour</p>
          <div className="flex h-24 items-end gap-1.5">
            {bars.map((h, i) => (
              <motion.span
                key={i}
                className={cn("flex-1 origin-bottom rounded-t-md", i === bars.length - 3 ? "bg-sun" : "bg-sea/80")}
                style={{ height: `${h}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.04, ease: EASE }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ playing }: { playing: boolean }) {
  const nodes = [
    { icon: ShoppingCart, title: "Amazon", n: "2,481 priced" },
    { icon: SlidersHorizontal, title: "Your margins", n: "9 bands" },
    { icon: Store, title: "OnBuy", n: "37 to send" },
  ];
  return (
    <div className="flex items-center">
      {nodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div key={node.title} className="flex flex-1 items-center last:flex-none">
            <div className="flex w-[84px] shrink-0 flex-col items-center text-center">
              <motion.span
                className="flex size-11 items-center justify-center rounded-2xl bg-ink text-white"
                animate={playing ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
              >
                <Icon className="size-5" />
              </motion.span>
              <span className="mt-1.5 text-[11px] font-bold">{node.title}</span>
              <span className="text-[10px] text-muted">{node.n}</span>
            </div>
            {i < nodes.length - 1 && (
              <div className="relative mx-1 mb-8 h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="absolute top-0 h-full w-3 rounded-full bg-sea"
                    initial={{ left: "-12%" }}
                    animate={playing ? { left: ["-12%", "105%"] } : { left: "45%" }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: d * 0.53 + i * 0.25, ease: "easeInOut" }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Pricing ----------------------------------------------------------------

const DEMO_SOURCE = [8.49, 14.99, 27.5, 46.0, 18.75];

function PricingScreen({ playing }: { playing: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setK((x) => (x + 1) % DEMO_SOURCE.length), 1500);
    return () => clearInterval(t);
  }, [playing]);
  const source = DEMO_SOURCE[k];
  const price = marketplacePrice(source, DEFAULT_BANDS, FEES) ?? 0;
  const profit = estimatedProfit(source, price, FEES);
  const bandIdx = DEFAULT_BANDS.findIndex((b) => source <= b.upTo);
  const rows = DEFAULT_BANDS.slice(0, 5);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-2xl bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-bold">Price bands</p>
          <span className="text-[11px] text-muted">Marketplace fee 18%</span>
        </div>
        <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-x-2 px-2 pb-1 text-[10px] font-bold tracking-wide text-muted uppercase">
          <span>Amazon price</span>
          <span>Profit</span>
          <span>Minimum</span>
        </div>
        <ul className="flex flex-col gap-1">
          {rows.map((b, i) => {
            const lo = i === 0 ? 0 : rows[i - 1].upTo;
            const on = i === bandIdx;
            return (
              <li key={b.upTo} className="relative grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-x-2 rounded-xl px-2 py-2 text-[12px]">
                {on && <motion.span layoutId="inside-band" className="absolute inset-0 rounded-xl bg-sun-soft ring-2 ring-sun" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative font-semibold">
                  {i === 0 ? `up to £${b.upTo}` : `£${(lo + 0.01).toFixed(2)}–£${b.upTo}`}
                </span>
                <span className="relative">{b.profitPct}%</span>
                <span className="relative">{gbp(b.minProfit)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-ink p-4 text-white">
        <p className="flex items-center gap-2 text-[12px] font-bold text-[#bfe3d6]">
          <span className="size-1.5 rounded-full bg-sun" /> Live price preview
        </p>
        <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
          <span className="text-[12px] text-[#bfe3d6]">Amazon (FBA, landed)</span>
          <span className="font-display text-xl font-extrabold">
            <Count value={source} money />
          </span>
        </div>
        <motion.div
          key={k}
          initial={{ scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex items-center justify-between rounded-xl bg-sun p-3 text-ink"
        >
          <span className="text-[12px] font-bold">Your OnBuy price</span>
          <span className="font-display text-2xl font-extrabold">
            <Count value={price} money />
          </span>
        </motion.div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#bfe3d6]">You keep after fees</span>
          <span className="font-bold text-sun">
            +<Count value={profit} money />
          </span>
        </div>
        <p className="mt-auto text-[11px] leading-relaxed text-[#9fbdb1]">Never below your minimum profit, whatever Amazon does.</p>
      </div>
    </div>
  );
}

// ---- Products ---------------------------------------------------------------

// Amazon price before and after a reprice; the OnBuy prices are worked out
// with the real formula and default bands, like the pricing screen.
const onbuyFor = (amazon: number) => marketplacePrice(amazon, DEFAULT_BANDS, FEES) ?? 0;
const PRODUCTS = [
  { name: "Steel water bottle", asin: "B0C8KF67ZC", amazon: [10.89, 11.49] },
  { name: "LED desk lamp", asin: "B09XQ2RT4M", amazon: [16.9, 15.99] },
  { name: "Bamboo cutlery set", asin: "B07YHN5L2K", amazon: [13.9, 13.9] },
  { name: "Yoga mat", asin: "B08F2LQ9WX", amazon: [13.89, 14.79] },
  { name: "Phone stand", asin: "B0BR7TZK1D", amazon: [5.49, 6.29] },
].map((p) => ({ ...p, onbuy: [onbuyFor(p.amazon[0]), onbuyFor(p.amazon[1])] }));

function ProductsScreen({ playing }: { playing: boolean }) {
  // step = how many rows have been repriced so far; a row is "sending" for one tick, then confirmed.
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s >= PRODUCTS.length + 1 ? 0 : s + 1)), 1050);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="rounded-2xl bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-bold">Products</p>
        <div className="flex gap-1.5 text-[11px] font-semibold">
          <span className="rounded-full bg-ink px-2.5 py-1 text-white">All 2,481</span>
          <span className="rounded-full bg-mist px-2.5 py-1 text-body">To send 37</span>
          <span className="hidden rounded-full bg-mist px-2.5 py-1 text-body sm:inline">Errors 0</span>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1.6fr)_0.8fr_0.9fr_0.9fr] gap-x-2 border-b border-line px-2 pb-2 text-[10px] font-bold tracking-wide text-muted uppercase md:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_0.9fr_0.9fr]">
        <span>Listing</span>
        <span className="hidden md:block">ASIN</span>
        <span>Amazon</span>
        <span>OnBuy</span>
        <span>Status</span>
      </div>
      <ul>
        {PRODUCTS.map((p, i) => {
          const updated = step > i;
          const sending = step === i + 1;
          const changed = p.onbuy[0] !== p.onbuy[1];
          const up = p.onbuy[1] > p.onbuy[0];
          return (
            <li key={p.asin} className="relative grid grid-cols-[minmax(0,1.6fr)_0.8fr_0.9fr_0.9fr] items-center gap-x-2 border-b border-line/70 px-2 py-2.5 text-[12px] last:border-0 md:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_0.9fr_0.9fr]">
              <AnimatePresence>
                {sending && changed && (
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-sun-soft"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative flex min-w-0 items-center gap-2 font-semibold">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-mint text-[11px] font-extrabold text-sea-dark">{p.name[0]}</span>
                <span className="truncate">{p.name}</span>
              </span>
              <span className="relative hidden font-mono text-[11px] text-muted md:block">{p.asin}</span>
              <span className="relative tabular-nums">{gbp(updated ? p.amazon[1] : p.amazon[0])}</span>
              <span className="relative flex items-center gap-1 font-bold tabular-nums">
                {gbp(updated ? p.onbuy[1] : p.onbuy[0])}
                {updated && changed && (
                  <motion.span initial={{ opacity: 0, y: up ? 4 : -4 }} animate={{ opacity: 1, y: 0 }} className={up ? "text-sea" : "text-danger"}>
                    {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  </motion.span>
                )}
              </span>
              <span className="relative">
                {sending ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2 py-0.5 text-[10px] font-bold text-sun-ink">
                    <motion.span className="size-1.5 rounded-full bg-sun-ink" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                    Sending
                  </span>
                ) : updated ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-sea-dark">
                    <CheckCircle2 className="size-3" /> On OnBuy
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-muted">In sync</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---- Automation -------------------------------------------------------------

const LOG = [
  { t: "09:41:05", ok: true, text: "Amazon prices · read 200 listings, 14 changed" },
  { t: "09:41:12", ok: true, text: "OnBuy · sent 37, all 37 confirmed" },
  { t: "09:42:06", ok: true, text: "Amazon prices · read 200 listings, 9 changed" },
  { t: "09:42:31", ok: true, text: "Brake · Amazon price drop held for a second look" },
  { t: "09:43:04", ok: true, text: "Amazon prices · read 200 listings, 11 changed" },
];

function AutomationScreen({ playing }: { playing: boolean }) {
  const [lines, setLines] = useState(2);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setLines((n) => (n >= LOG.length ? 2 : n + 1)), 1300);
    return () => clearInterval(t);
  }, [playing]);
  const shown = playing ? lines : LOG.length;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4">
          <span className="flex items-center gap-2 text-[12px] font-bold">
            <Power className="size-4 text-sea" /> Repricing
          </span>
          <span className="flex h-6 w-11 items-center rounded-full bg-sea p-0.5">
            <motion.span layout className="ml-auto size-5 rounded-full bg-white shadow" />
          </span>
        </div>
        {[
          { title: "Amazon prices", every: "every minute", pct: 72, tone: "bg-sea" },
          { title: "Send to OnBuy", every: "every 5 minutes", pct: 40, tone: "bg-sun" },
        ].map((j, i) => (
          <div key={j.title} className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold">{j.title}</span>
              <span className="text-muted">{j.every}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
              <motion.div
                className={cn("h-full rounded-full", j.tone)}
                initial={{ width: "0%" }}
                animate={playing ? { width: ["0%", "100%"] } : { width: `${j.pct}%` }}
                transition={playing ? { duration: 3.2 + i * 1.4, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted">{i === 0 ? "Batch 7 of 10 · 140 read" : "Next run in 2 min"}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-ink p-4 font-mono text-[11px] text-[#cfe7dd]">
        <p className="mb-3 flex items-center justify-between font-sans text-[12px] font-bold text-white">
          Run history
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#bfe3d6]">auto</span>
        </p>
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {LOG.slice(0, shown).map((l) => (
              <motion.li
                key={l.t}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex gap-2"
              >
                <span className="shrink-0 text-[#7fa596]">{l.t}</span>
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-sun" />
                <span className="min-w-0">{l.text}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

// ---- Toasts beside the frame ---------------------------------------------------

const TOASTS = [
  { side: "left", text: "Yoga mat repriced", sub: `${gbp(PRODUCTS[3].onbuy[0])} → ${gbp(PRODUCTS[3].onbuy[1])}` },
  { side: "right", text: "37 prices confirmed by OnBuy", sub: "just now" },
  { side: "left", text: "LED desk lamp", sub: "Amazon dropped · held for a recheck" },
  { side: "right", text: "Phone stand back in stock", sub: "stock 0 → 3" },
] as const;

function Toasts({ playing }: { playing: boolean }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setK((x) => (x + 1) % TOASTS.length), 2600);
    return () => clearInterval(t);
  }, [playing]);
  const toast = TOASTS[k];
  return (
    // Toasts hang off the frame's bottom edge, so they never cover the dashboard's menu or figures.
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden md:block">
      <AnimatePresence mode="wait">
        {playing && (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              "absolute flex w-60 items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_18px_40px_-16px_rgba(16,35,28,.45)]",
              toast.side === "left" ? "-bottom-8 left-6 lg:left-10" : "right-6 -bottom-8 lg:right-10",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint text-sea-dark">
              <CheckCircle2 className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold">{toast.text}</span>
              <span className="block truncate text-[12px] text-muted">{toast.sub}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
