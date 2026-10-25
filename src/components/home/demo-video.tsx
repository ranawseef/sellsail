"use client";

// "Watch the demo": a 35-second, video-style walkthrough of a demo shop. It is
// drawn in the page rather than shipped as a video file, so it stays sharp on
// every screen and costs a few KB. One clock drives every scene: each scene
// derives what it shows from its local time, so pause, seek and loop are exact.
// It plays muted-video style when scrolled into view; under
// prefers-reduced-motion it waits for the play button and shows the final
// sales screen meanwhile. All numbers are demo data and labelled as such.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import {
  Boxes,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Store,
  Swords,
  TrendingUp,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "connect", label: "Connect", ms: 4500, caption: "Connect your OnBuy shop in two minutes." },
  { id: "import", label: "Import", ms: 5500, caption: "Bring in your Amazon products in one go." },
  { id: "price", label: "Price", ms: 6000, caption: "Every OnBuy price covers fees, VAT and your profit." },
  { id: "compete", label: "Compete", ms: 6500, caption: "Cheaper rival? SellSail answers, never below your floor." },
  { id: "sales", label: "Sell", ms: 8500, caption: "More buy boxes won. More orders, around the clock." },
  { id: "end", label: "Start", ms: 4000, caption: "Your OnBuy shop, on autopilot." },
] as const;
type SceneId = (typeof SCENES)[number]["id"];

const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].ms], []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].ms;
const SALES_DONE = STARTS[4] + SCENES[4].ms - 1;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0 → 1 between `start` and `start + dur` (ms of scene time), eased out. */
const p = (lt: number, start: number, dur: number) => 1 - Math.pow(1 - clamp01((lt - start) / dur), 3);
const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const int = (n: number) => Math.round(n).toLocaleString("en-GB");
const clock = (ms: number) => `0:${String(Math.floor(ms / 1000)).padStart(2, "0")}`;

// Demo catalogue. Prices match the worked examples in the hero (15% commission,
// 7% for the phone stand, 20% VAT).
const PRODUCTS = [
  { name: "Yoga mat", cost: 13.89, price: 24.99, profit: 3.18, tint: "bg-lilac" },
  { name: "LED desk lamp", cost: 16.9, price: 29.99, profit: 3.59, tint: "bg-sun-soft" },
  { name: "Steel water bottle", cost: 10.89, price: 19.99, profit: 2.77, tint: "bg-sky" },
  { name: "Bamboo cutlery set", cost: 13.9, price: 23.48, profit: 2.15, tint: "bg-mint" },
  { name: "Phone stand", cost: 5.49, price: 12.99, profit: 4.42, tint: "bg-coral" },
];

const ORDERS = [
  ["Yoga mat", 24.99],
  ["LED desk lamp", 29.99],
  ["Phone stand", 12.99],
  ["Steel water bottle", 19.99],
  ["Bamboo cutlery set", 23.48],
  ["Yoga mat", 24.99],
  ["LED desk lamp", 29.99],
  ["Phone stand", 12.99],
] as const;

// 30 days of demo revenue, rising.
const DAYS = [520, 610, 580, 720, 760, 840, 810, 930, 1010, 980, 1120, 1190, 1240, 1210, 1380, 1460, 1420, 1560, 1640, 1710, 1690, 1820, 1910, 1980, 2050, 2010, 2190, 2280, 2360, 2480];

export function DemoVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"auto" | "playing" | "paused">("auto");
  const [t, setT] = useState(0);

  const playing = mode === "playing" || (mode === "auto" && !reduce);
  const running = playing && inView;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += now - last;
      last = now;
      // ~30 updates a second is plenty; CSS transitions smooth the rest.
      if (acc >= 33) {
        const step = acc;
        acc = 0;
        setT((v) => (v + step) % TOTAL);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const shown = mode === "auto" && reduce ? SALES_DONE : t;
  let index = 0;
  for (let i = 0; i < SCENES.length; i++) if (shown >= STARTS[i]) index = i;
  const scene = SCENES[index];
  const lt = shown - STARTS[index];
  const fade = Math.min(p(lt, 0, 350), 1 - p(lt, scene.ms - 300, 300));

  const seek = (i: number) => {
    setT(STARTS[i]);
    setMode("playing");
  };

  return (
    <div ref={ref} className="mx-auto max-w-[820px]">
      <div className="relative overflow-hidden rounded-[28px] bg-ink p-1.5 shadow-[0_40px_80px_-30px_rgba(16,35,28,.55)] sm:rounded-[32px] sm:p-2">
        {/* The "video" */}
        <div aria-hidden="true" className="@container relative aspect-[4/5] overflow-hidden rounded-[22px] bg-paper sm:aspect-video sm:rounded-[26px]">
          <AppChrome scene={scene.id} />
          <div className="absolute inset-x-0 top-11 bottom-0 @2xl:left-44" style={{ opacity: fade }}>
            <div className="h-full p-4 pb-20 @2xl:p-5 @2xl:pb-20">
              {scene.id === "connect" && <ConnectScene lt={lt} />}
              {scene.id === "import" && <ImportScene lt={lt} />}
              {scene.id === "price" && <PriceScene lt={lt} />}
              {scene.id === "compete" && <CompeteScene lt={lt} />}
              {scene.id === "sales" && <SalesScene lt={lt} />}
              {scene.id === "end" && <EndScene lt={lt} />}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4 @2xl:pb-5">
            <p
              key={scene.id}
              className="max-w-[92%] rounded-xl bg-ink/90 px-4 py-2.5 text-center text-[13px] leading-snug font-semibold text-white shadow-lg backdrop-blur @md:text-[15px] @2xl:text-lg"
            >
              {scene.caption}
            </p>
          </div>
          <span className="absolute top-2.5 right-3 rounded-full bg-sun px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-ink uppercase @md:text-[11px]">
            Demo data
          </span>
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/95 shadow-xl @2xl:size-20">
                <Play className="ml-1 size-7 fill-ink text-ink @2xl:size-9" />
              </span>
            </div>
          )}
        </div>
        {!playing && (
          <button
            type="button"
            onClick={() => setMode("playing")}
            className="absolute inset-0 cursor-pointer rounded-[28px] sm:rounded-[32px]"
            aria-label="Play the demo"
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 px-2 pt-2.5 pb-1.5 sm:px-3">
          <button
            type="button"
            onClick={() => setMode(playing ? "paused" : "playing")}
            aria-label={playing ? "Pause the demo" : "Play the demo"}
            className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            {playing ? <Pause aria-hidden="true" className="size-4 fill-white" /> : <Play aria-hidden="true" className="ml-0.5 size-4 fill-white" />}
          </button>
          <ol className="relative z-10 flex flex-1 gap-1.5" aria-label="Chapters">
            {SCENES.map((s, i) => {
              const fill = i < index ? 1 : i > index ? 0 : lt / s.ms;
              return (
                <li key={s.id} className="flex-1" style={{ flexGrow: s.ms }}>
                  <button
                    type="button"
                    onClick={() => seek(i)}
                    aria-label={`Chapter ${i + 1}: ${s.label}`}
                    aria-current={i === index ? "step" : undefined}
                    className="group block w-full py-2 text-left"
                  >
                    <span className="block h-1.5 overflow-hidden rounded-full bg-white/15">
                      <span className="block h-full rounded-full bg-sun transition-[width] duration-75 ease-linear" style={{ width: `${fill * 100}%` }} />
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 hidden text-[11px] font-semibold tracking-wide uppercase sm:block",
                        i === index ? "text-white" : "text-white/45 group-hover:text-white/80",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <span className="relative z-10 hidden w-20 shrink-0 text-right text-xs text-white/60 tabular-nums sm:block">
            {clock(shown)} / {clock(TOTAL)}
          </span>
          <button
            type="button"
            onClick={() => seek(0)}
            aria-label="Restart the demo"
            className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <ol className="sr-only">
        {SCENES.map((s) => (
          <li key={s.id}>{s.caption}</li>
        ))}
      </ol>
      <p className="mt-4 text-center text-[13px] text-muted">
        Demo shop with sample data. Real results depend on your products, prices and competition.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const NAV: { id: SceneId | "none"; label: string; icon: typeof Store }[] = [
  { id: "sales", label: "Overview", icon: LayoutDashboard },
  { id: "import", label: "Products", icon: Boxes },
  { id: "price", label: "Pricing", icon: TrendingUp },
  { id: "compete", label: "Competition", icon: Swords },
  { id: "connect", label: "Connections", icon: Store },
];

function AppChrome({ scene }: { scene: SceneId }) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 flex h-11 items-center gap-2 border-b border-line bg-white px-4 @2xl:left-44">
        <span className="flex gap-1.5 @2xl:hidden">
          <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
          <span className="size-2.5 rounded-full bg-sun" />
          <span className="size-2.5 rounded-full bg-sea-mid" />
        </span>
        <span className="ml-1 truncate text-xs font-semibold text-muted @2xl:ml-0 @2xl:text-sm">app.sellsail.io · Northfield Home Store</span>
      </div>
      <div className="absolute inset-y-0 left-0 hidden w-44 flex-col gap-1 bg-ink p-3 @2xl:flex">
        <div className="mb-4 flex items-center gap-2 px-1.5 pt-1 font-display text-[15px] font-extrabold text-white">
          <LogoMark size={22} /> SellSail
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-semibold transition-colors duration-300",
              id === scene ? "bg-[#13261e] text-white" : "text-[#9fbdb1]",
            )}
          >
            <Icon className={cn("size-3.5", id === scene && "text-sun")} />
            {label}
          </div>
        ))}
      </div>
    </>
  );
}

function Card({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-3.5 shadow-[0_8px_24px_-16px_rgba(16,35,28,.35)] @2xl:p-4", className)} style={style}>
      {children}
    </div>
  );
}

/** Slides and fades in as `v` goes 0 → 1. */
const enter = (v: number, y = 14): React.CSSProperties => ({ opacity: v, transform: `translateY(${(1 - v) * y}px)` });

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <p className="font-display text-lg leading-tight font-extrabold tracking-[-0.02em] @2xl:text-2xl">{title}</p>
      {sub && <p className="mt-0.5 text-xs text-muted @2xl:text-sm">{sub}</p>}
    </div>
  );
}

function ConnectScene({ lt }: { lt: number }) {
  const rows = [
    { name: "OnBuy Seller API", detail: "Northfield Home Store", at: 500 },
    { name: "Amazon UK prices", detail: "Live offers, read for you", at: 1300 },
  ];
  const found = p(lt, 2400, 1600);
  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center">
      <Heading title="Connections" sub="Two minutes, then SellSail does the rest." />
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const done = lt > r.at + 900;
          return (
            <Card key={r.name} className="flex items-center gap-3" style={enter(p(lt, r.at - 400, 400))}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-mint text-sea-dark">
                <Store className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{r.name}</span>
                <span className="block truncate text-xs text-muted">{r.detail}</span>
              </span>
              {done ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-sea-dark">
                  <CheckCircle2 className="size-3.5" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
                  <Loader2 className="size-3.5 animate-spin" /> Connecting
                </span>
              )}
            </Card>
          );
        })}
        <Card className="mt-1 bg-ink text-white" style={enter(p(lt, 2200, 400))}>
          <p className="text-xs text-[#9fbdb1]">Listings found on OnBuy</p>
          <p className="font-display text-3xl font-extrabold tracking-[-0.03em] text-sun tabular-nums @2xl:text-4xl">{int(1248 * found)}</p>
        </Card>
      </div>
    </div>
  );
}

function ImportScene({ lt }: { lt: number }) {
  const bar = p(lt, 200, 4600);
  return (
    <div className="flex h-full flex-col">
      <Heading title="Products" sub="Imported from Amazon UK with live prices and stock." />
      <Card className="mb-2.5 py-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>Importing from Amazon</span>
          <span className="text-sea-dark tabular-nums">{int(1248 * bar)} / 1,248</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
          <div className="h-full rounded-full bg-gradient-to-r from-sea to-sea-mid" style={{ width: `${bar * 100}%` }} />
        </div>
      </Card>
      <div className="flex flex-col gap-2">
        {PRODUCTS.map((r, i) => (
          <Card key={r.name} className={cn("flex items-center gap-3 py-2", i > 3 && "hidden")} style={enter(p(lt, 400 + i * 450, 450))}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", r.tint)}>
              <ShoppingBag className="size-4 text-ink/70" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.name}</span>
            <span className="hidden text-xs text-muted @md:inline">Amazon</span>
            <span className="w-16 text-right text-sm font-bold tabular-nums">{gbp(r.cost)}</span>
            <span className="hidden rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-sea-dark @md:inline">In stock</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PriceScene({ lt }: { lt: number }) {
  return (
    <div className="flex h-full flex-col">
      <Heading title="Pricing rules" sub="OnBuy commission, VAT and your minimum profit, built in." />
      <div className="mb-3 flex flex-wrap gap-2" style={enter(p(lt, 0, 400))}>
        {["Margin 22%", "Min profit £2.00", "Fees + VAT included"].map((c) => (
          <span key={c} className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
            {c}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {PRODUCTS.map((r, i) => {
          const at = 700 + i * 650;
          const set = lt > at;
          const glow = set && lt < at + 900;
          return (
            <Card
              key={r.name}
              className={cn("flex items-center gap-2 py-2.5 transition-colors duration-500 @2xl:gap-3", glow && "border-sea bg-mint", i > 3 && "hidden")}
              style={enter(p(lt, i * 120, 400), 8)}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.name}</span>
              <span className="text-xs text-muted tabular-nums">{gbp(r.cost)}</span>
              <span className="text-xs text-muted">→</span>
              <span className={cn("w-16 text-right text-sm font-extrabold tabular-nums", set ? "text-ink" : "text-muted/50")}>
                {set ? gbp(r.price) : "£ —"}
              </span>
              <span
                className="w-16 rounded-full bg-mint px-2 py-0.5 text-center text-[11px] font-bold text-sea-dark tabular-nums transition-opacity duration-300"
                style={{ opacity: set ? 1 : 0 }}
              >
                +{gbp(r.profit)}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CompeteScene({ lt }: { lt: number }) {
  const answered = lt > 1800;
  const won = lt > 2600;
  const yours = answered ? 24.69 : 24.99;
  const offers = [
    { seller: "You", price: yours, you: true },
    { seller: "HomeDeals UK", price: 24.79, you: false },
    { seller: "BestBuyz", price: 26.5, you: false },
  ].sort((a, b) => a.price - b.price);
  const wins = p(lt, 3200, 2600);
  return (
    <div className="flex h-full flex-col">
      <Heading title="Competition" sub="Checked every few minutes against every other seller." />
      <div className="grid flex-1 content-start gap-3 @2xl:grid-cols-[1.4fr_1fr]">
        <Card style={enter(p(lt, 0, 400))}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Yoga mat · offers on OnBuy</p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors duration-500",
                won ? "bg-sun text-ink" : "bg-coral text-[#8a3b22]",
              )}
            >
              <Crown className="size-3.5" /> {won ? "Buy box won" : "Undercut by £0.20"}
            </span>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {offers.map((o, i) => (
              <li
                key={o.seller}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-500",
                  o.you ? "bg-mint font-bold text-sea-dark" : "bg-mist",
                )}
              >
                <span>
                  {i + 1}. {o.seller}
                </span>
                <span className="tabular-nums">{gbp(o.price)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-2.5 text-xs">
            <span className="text-muted">Your floor (fees + £2.00 profit)</span>
            <span className="font-bold tabular-nums">£21.80 · never crossed</span>
          </p>
        </Card>
        <div className="flex flex-col gap-3">
          <Card style={enter(p(lt, 3400, 500))}>
            <p className="text-xs text-muted">LED desk lamp · rival out of stock</p>
            <p className="mt-1 text-sm font-bold">
              Raised to <span className="text-sea-dark">£31.49</span> <span className="text-xs font-semibold text-muted">(+£1.50 profit)</span>
            </p>
          </Card>
          <Card className="bg-ink text-white" style={enter(p(lt, 2800, 500))}>
            <p className="text-xs text-[#9fbdb1]">Buy boxes won today</p>
            <p className="font-display text-3xl font-extrabold tracking-[-0.03em] text-sun tabular-nums">{int(312 * wins)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SalesScene({ lt }: { lt: number }) {
  const grow = p(lt, 300, 6200);
  const kpis = [
    { label: "Revenue this month", value: gbp(48917.4 * grow), accent: true },
    { label: "Orders", value: int(1932 * grow) },
    { label: "Buy box share", value: `${Math.round(87 * grow)}%` },
    { label: "Avg profit / order", value: gbp(3.41) },
  ];
  const max = Math.max(...DAYS);
  const pts = DAYS.map((d, i) => [(i / (DAYS.length - 1)) * 300, 100 - (d / max) * 88] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L300,100 L0,100 Z`;
  const shownOrders = Math.min(ORDERS.length, Math.max(0, Math.floor((lt - 1200) / 800)));
  const recent = ORDERS.slice(0, shownOrders).slice(-3).reverse();

  return (
    <div className="flex h-full flex-col">
      <Heading title="Good morning, Northfield" sub="Last 30 days · all systems running" />
      <div className="grid grid-cols-2 gap-2 @2xl:grid-cols-4 @2xl:gap-3">
        {kpis.map((k, i) => (
          <Card key={k.label} className={cn(k.accent && "bg-ink text-white")} style={enter(p(lt, i * 150, 400))}>
            <p className={cn("text-[11px] @2xl:text-xs", k.accent ? "text-[#9fbdb1]" : "text-muted")}>{k.label}</p>
            <p
              className={cn(
                "mt-0.5 font-display text-lg leading-tight font-extrabold tracking-[-0.02em] tabular-nums @md:text-xl @2xl:text-2xl",
                k.accent && "text-sun",
              )}
            >
              {k.value}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-3 grid min-h-0 flex-1 gap-3 @2xl:grid-cols-[1.6fr_1fr]">
        <Card className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">Daily revenue</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 font-bold text-sea-dark">
              <TrendingUp className="size-3" /> +377%
            </span>
          </div>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="mt-2 min-h-[70px] w-full flex-1">
            <defs>
              <linearGradient id="demo-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2a9c84" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2a9c84" stopOpacity="0" />
              </linearGradient>
              <clipPath id="demo-clip">
                <rect x="0" y="0" height="100" width={300 * grow} />
              </clipPath>
            </defs>
            <g clipPath="url(#demo-clip)">
              <path d={area} fill="url(#demo-area)" />
              <path d={line} fill="none" stroke="#0e7c66" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </Card>
        <Card className="hidden @2xl:block">
          <p className="text-xs font-bold">Latest orders</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {recent.map(([name, price], i) => (
              <li
                key={`${shownOrders - i}`}
                className={cn("flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs", i === 0 ? "animate-rise bg-sun-soft" : "bg-mist")}
              >
                <span className="truncate font-semibold">{name}</span>
                <span className="font-bold tabular-nums">{gbp(price)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {recent[0] && (
        <div
          key={shownOrders}
          className="absolute top-14 right-3 flex animate-rise items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-[0_12px_30px_-10px_rgba(16,35,28,.4)] @2xl:hidden"
        >
          <span className="size-2 rounded-full bg-sea-mid" />
          New order · <b className="tabular-nums">{gbp(recent[0][1])}</b>
        </div>
      )}
    </div>
  );
}

function EndScene({ lt }: { lt: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center" style={enter(p(lt, 0, 600), 20)}>
      <LogoMark size={56} />
      <p className="mt-4 font-display text-2xl leading-tight font-extrabold tracking-[-0.03em] @2xl:text-4xl">
        Sell more on OnBuy,
        <br />
        <span className="highlight px-1">never at a loss</span>
      </p>
      <p className="mt-3 text-sm text-muted @2xl:text-base">14-day free trial · No card needed · Cancel any time</p>
    </div>
  );
}
