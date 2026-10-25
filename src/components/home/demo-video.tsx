"use client";

// "Watch the demo": a 30-second promo of SellSail running a demo shop. It is
// drawn in the page rather than shipped as a video file, so it stays sharp on
// every screen and costs a few KB. One clock drives every scene: each scene
// derives what it shows from its local time, so pause, seek and loop are
// exact. It plays muted-video style when scrolled into view; under
// prefers-reduced-motion it waits for the play button and shows the final
// sales screen meanwhile. All numbers are demo data and labelled as such.
// Text sizes use container units (cqw) so nothing overflows at any width.
//
// A presenter (two short clips, voiced) sits in a round picture-in-picture
// bubble. The clips follow the same clock: they play, pause and seek with the
// scenes, start muted (browsers block sound on autoplay) and get sound from
// the "Tap for sound" button. Scene lengths are timed to the voice-over.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Check, CheckCircle2, Crown, Pause, Play, RotateCcw, ShieldCheck, TrendingUp, Volume2, VolumeX, Zap } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { productImages } from "@/content/product-images";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "hook", label: "Intro", ms: 4000, text: "Your OnBuy shop, on autopilot." },
  { id: "import", label: "Import", ms: 4500, text: "Import 1,248 Amazon products in one click." },
  { id: "price", label: "Price", ms: 5000, text: "Every OnBuy price covers fees, VAT and your profit." },
  { id: "compete", label: "Compete", ms: 4800, text: "Win the buy box without going below your floor." },
  { id: "sales", label: "Sell", ms: 5000, text: "Watch the orders roll in, around the clock." },
  { id: "end", label: "Start", ms: 6000, text: "Start your 14-day free trial. No card needed." },
] as const;

const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].ms], []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].ms;
const SALES_DONE = STARTS[4] + SCENES[4].ms - 1;

// Presenter clips: the first covers intro to price, the second starts with
// the Compete scene. `ms` is each clip's length.
const CLIPS = [
  { src: "/videos/presenter-1.mp4", at: 0, ms: 12680 },
  { src: "/videos/presenter-2.mp4", at: STARTS[3], ms: 13250 },
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0 → 1 between `start` and `start + dur` (ms of scene time), eased out. */
const p = (lt: number, start: number, dur: number) => 1 - Math.pow(1 - clamp01((lt - start) / dur), 3);
const gbp = (n: number) => `£${n.toFixed(2)}`;
const int = (n: number) => Math.round(n).toLocaleString("en-GB");
const clock = (ms: number) => `0:${String(Math.floor(ms / 1000)).padStart(2, "0")}`;
/** Fades and lifts in as `v` goes 0 → 1. */
const enter = (v: number, y = 16, scale = 1): React.CSSProperties => ({
  opacity: v,
  transform: `translateY(${(1 - v) * y}px) scale(${scale + (1 - scale) * v})`,
});

// Demo catalogue: cost + OnBuy fees and VAT + profit = OnBuy price, matching
// the worked examples in the hero (15% commission, 7% for the phone stand).
const PRODUCTS = [
  { name: "Yoga mat", img: productImages.yogaMat, cost: 13.89, fees: 7.92, profit: 3.18, price: 24.99 },
  { name: "LED desk lamp", img: productImages.deskLamp, cost: 16.9, fees: 9.5, profit: 3.59, price: 29.99 },
  { name: "Water bottle", img: productImages.waterBottle, cost: 10.89, fees: 6.33, profit: 2.77, price: 19.99 },
  { name: "Cutlery set", img: productImages.cutlery, cost: 13.9, fees: 7.43, profit: 2.15, price: 23.48 },
  { name: "Phone stand", img: productImages.phoneStand, cost: 5.49, fees: 3.08, profit: 4.42, price: 12.99 },
];
const ORDERS = [0, 1, 4, 2, 3, 0, 1, 4, 2];
const DAYS = [520, 610, 580, 720, 760, 840, 810, 930, 1010, 980, 1120, 1190, 1240, 1210, 1380, 1460, 1420, 1560, 1640, 1710, 1690, 1820, 1910, 1980, 2050, 2010, 2190, 2280, 2360, 2480];

export function DemoVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"auto" | "playing" | "paused">("auto");
  const [t, setT] = useState(0);
  const [muted, setMuted] = useState(true);
  const clipRefs = useRef<(HTMLVideoElement | null)[]>([]);

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
  const fade = Math.min(p(lt, 0, 400), 1 - p(lt, scene.ms - 350, 350));
  const drift = Math.sin(shown / 2400);

  const activeClip = CLIPS.findIndex((c) => shown >= c.at && shown < c.at + c.ms);

  // Keep the presenter in step with the scene clock.
  useEffect(() => {
    CLIPS.forEach((c, i) => {
      const v = clipRefs.current[i];
      if (!v) return;
      v.muted = muted;
      const local = (shown - c.at) / 1000;
      if (i === activeClip) {
        if (Math.abs(v.currentTime - local) > (running ? 0.35 : 0.05)) v.currentTime = local;
        if (running && v.paused) v.play().catch(() => {});
        if (!running && !v.paused) v.pause();
      } else {
        if (!v.paused) v.pause();
        if (local < 0 && v.currentTime > 0) v.currentTime = 0;
      }
    });
  }, [shown, running, muted, activeClip]);

  const seek = (i: number) => {
    setT(STARTS[i]);
    setMode("playing");
  };

  return (
    <div ref={ref} className="mx-auto max-w-[820px]">
      <div className="relative overflow-hidden rounded-[28px] bg-ink p-1.5 shadow-[0_40px_80px_-30px_rgba(16,35,28,.6)] sm:rounded-[32px] sm:p-2">
        {/* The "video" */}
        <div aria-hidden="true" className="@container relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#0b1a15] sm:aspect-video sm:rounded-[26px]">
          <div
            className="absolute -top-1/3 -left-1/4 size-[75%] rounded-full bg-sea/40 blur-[70px]"
            style={{ transform: `translate(${drift * 30}px, ${drift * -18}px)` }}
          />
          <div
            className="absolute -right-1/4 -bottom-1/3 size-[65%] rounded-full bg-sun/20 blur-[80px]"
            style={{ transform: `translate(${drift * -24}px, ${drift * 14}px)` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5 @2xl:px-6 @2xl:pt-4">
            <span className="flex items-center gap-1.5 font-display text-[13px] font-extrabold text-white">
              <LogoMark size={20} /> SellSail
            </span>
            <span className="rounded-full bg-sun px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-ink uppercase">Demo data</span>
          </div>

          <div
            className="absolute inset-0 px-5 pt-12 pb-5 @2xl:px-9 @2xl:pt-14 @2xl:pb-8"
            style={{ opacity: fade, transform: `scale(${0.985 + 0.015 * fade})` }}
          >
            {scene.id === "hook" && <HookScene lt={lt} />}
            {scene.id === "import" && <ImportScene lt={lt} />}
            {scene.id === "price" && <PriceScene lt={lt} />}
            {scene.id === "compete" && <CompeteScene lt={lt} />}
            {scene.id === "sales" && <SalesScene lt={lt} />}
            {scene.id === "end" && <EndScene lt={lt} />}
          </div>

          <div
            className="absolute bottom-3 left-3 z-10 aspect-square w-[24%] transition-all duration-500 @2xl:bottom-6 @2xl:left-6 @2xl:w-[17%]"
            style={{ opacity: activeClip >= 0 ? 1 : 0, transform: `scale(${activeClip >= 0 ? 1 : 0.6})`, transformOrigin: "bottom left" }}
          >
            {activeClip >= 0 && running && <span className="absolute -inset-1.5 animate-pulse-soft rounded-full border-2 border-sun/70" />}
            <div className="relative h-full w-full overflow-hidden rounded-full bg-ink shadow-[0_20px_40px_-10px_rgba(0,0,0,.7)] ring-[3px] ring-sun">
              {CLIPS.map((c, i) => (
                <video
                  key={c.src}
                  ref={(el) => {
                    clipRefs.current[i] = el;
                  }}
                  src={c.src}
                  muted
                  playsInline
                  preload={inView || shown > 0 ? "auto" : "none"}
                  className="absolute inset-0 h-full w-full object-cover object-[50%_22%] transition-opacity duration-300"
                  style={{ opacity: i === Math.max(activeClip, 0) ? 1 : 0 }}
                />
              ))}
            </div>
          </div>

          {!playing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/40">
              <span className="flex size-16 items-center justify-center rounded-full bg-sun shadow-[0_0_0_10px_rgba(255,210,63,.25)] @2xl:size-20">
                <Play className="ml-1 size-7 fill-ink text-ink @2xl:size-9" />
              </span>
            </div>
          )}
          {/* Warm the image cache so photos never pop in mid-scene. */}
          <div className="hidden">
            {PRODUCTS.map((pr) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={pr.name} src={pr.img} alt="" referrerPolicy="no-referrer" />
            ))}
          </div>
        </div>
        {!playing && (
          <button
            type="button"
            onClick={() => setMode("playing")}
            className="absolute inset-0 cursor-pointer rounded-[28px] sm:rounded-[32px]"
            aria-label="Play the demo"
          />
        )}

        {muted && playing && (
          <button
            type="button"
            onClick={() => setMuted(false)}
            className="absolute top-3 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg hover:bg-sun sm:top-4"
          >
            <Volume2 aria-hidden="true" className="size-4" /> Tap for sound
          </button>
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
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            aria-pressed={!muted}
            className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            {muted ? <VolumeX aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
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
          <li key={s.id}>{s.text}</li>
        ))}
      </ol>
      <p className="mt-4 text-center text-[13px] text-muted">
        Demo shop with sample data. Real results depend on your products, prices and competition.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function Photo({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={cn("block overflow-hidden rounded-xl bg-white", className)} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-[6%]" />
    </span>
  );
}

function Title({ lt, step, children, sub }: { lt: number; step: string; children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div style={enter(p(lt, 100, 550), 22)}>
      <p className="text-[11px] font-bold tracking-[0.18em] text-sun uppercase @2xl:text-xs">{step}</p>
      <h3 className="mt-2 font-display text-[clamp(22px,4.6cqw,38px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white">
        {children}
      </h3>
      {sub && <div className="mt-3 text-[13px] text-[#b9cfc6] @2xl:text-sm">{sub}</div>}
    </div>
  );
}

/** Title on the left and the visual on the right; stacked on narrow frames. */
function Split({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:gap-8">
      <div className="shrink-0 @2xl:w-[36%] @2xl:self-start @2xl:pt-[3%]">{title}</div>
      <div className="relative min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Hi({ children }: { children: React.ReactNode }) {
  return <span className="text-sun">{children}</span>;
}

function HookScene({ lt }: { lt: number }) {
  const chips = [
    { icon: Zap, label: "Live Amazon prices" },
    { icon: ShieldCheck, label: "Fees always covered" },
    { icon: Crown, label: "Buy box wins" },
  ];
  return (
    <div className="relative flex h-full flex-col items-center text-center">
      <h3
        className="mt-[4%] font-display text-[clamp(28px,7.2cqw,60px)] leading-[0.98] font-extrabold tracking-[-0.04em] text-white"
        style={enter(p(lt, 150, 600), 26)}
      >
        Your OnBuy shop,
        <br />
        <span className="relative inline-block">
          <span className="relative z-10 text-ink">on autopilot.</span>
          <span
            className="absolute inset-x-[-4%] bottom-[6%] top-[12%] origin-left rounded-lg bg-sun"
            style={{ transform: `scaleX(${p(lt, 700, 600)})` }}
          />
        </span>
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-2 @2xl:mt-5">
        {chips.map(({ icon: Icon, label }, i) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white @2xl:text-[13px]"
            style={enter(p(lt, 1200 + i * 220, 450), 10)}
          >
            <Icon className="size-3.5 text-sun" /> {label}
          </span>
        ))}
      </div>
      <div className="relative mt-auto h-[42%] w-full @2xl:ml-[16%] @2xl:w-[84%]">
        {PRODUCTS.map((pr, i) => {
          const off = i - 2;
          const v = p(lt, 300 + i * 130, 800);
          return (
            <Photo
              key={pr.name}
              src={pr.img}
              className="absolute bottom-[14%] aspect-square w-[22%] rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,.6)] @2xl:w-[17%]"
              style={{
                left: `${50 + off * 19}%`,
                opacity: v,
                transform: `translateX(-50%) translateY(${(1 - v) * 90 + Math.abs(off) * 14}px) rotate(${off * 6 * v}deg)`,
                zIndex: 10 - Math.abs(off),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ImportScene({ lt }: { lt: number }) {
  const bar = p(lt, 300, 3600);
  return (
    <Split
      title={
        <Title
          lt={lt}
          step="01 · Import"
          sub={
            <>
              <div className="flex justify-between font-semibold text-white tabular-nums">
                <span>Importing from Amazon UK</span>
                <span>{int(1248 * bar)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-sea-mid to-sun" style={{ width: `${bar * 100}%` }} />
              </div>
            </>
          }
        >
          1,248 products. <Hi>One click.</Hi>
        </Title>
      }
    >
      <div className="mx-auto grid grid-cols-3 gap-2 @2xl:max-w-[86%] @2xl:gap-2.5">
        {PRODUCTS.map((pr, i) => {
          const v = p(lt, 450 + i * 300, 450);
          const done = lt > 900 + i * 300;
          return (
            <div key={pr.name} className="rounded-2xl bg-white p-1.5 shadow-[0_16px_30px_-16px_rgba(0,0,0,.7)] @2xl:p-2" style={enter(v, 18, 0.85)}>
              <div className="relative">
                <Photo src={pr.img} className="aspect-[5/4] bg-mist" />
                <span
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-sea text-white transition-transform duration-300"
                  style={{ transform: `scale(${done ? 1 : 0})` }}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              </div>
              <p className="mt-1.5 truncate px-0.5 text-[11px] font-bold text-ink @2xl:text-xs">{pr.name}</p>
              <p className="px-0.5 text-[10px] text-muted tabular-nums @2xl:text-[11px]">Amazon {gbp(pr.cost)}</p>
            </div>
          );
        })}
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5 p-2 text-center text-white"
          style={enter(p(lt, 2000, 500), 18, 0.85)}
        >
          <span className="font-display text-[clamp(16px,3.4cqw,26px)] font-extrabold text-sun tabular-nums">+{int(1243 * bar)}</span>
          <span className="text-[10px] text-white/70 @2xl:text-[11px]">more products</span>
        </div>
      </div>
    </Split>
  );
}

function PriceScene({ lt }: { lt: number }) {
  const pr = PRODUCTS[0];
  const rows = [
    { label: "Amazon cost", value: gbp(pr.cost), at: 700 },
    { label: "OnBuy fees + VAT", value: gbp(pr.fees), at: 1300 },
    { label: "Your profit", value: `+${gbp(pr.profit)}`, at: 1900, good: true },
  ];
  const total = p(lt, 2500, 700);
  return (
    <Split
      title={
        <Title lt={lt} step="02 · Price" sub="Fees, VAT and your minimum profit are built into every price.">
          Every price <Hi>pays you.</Hi>
        </Title>
      }
    >
      <div className="rounded-3xl bg-white p-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,.7)] @2xl:p-4" style={enter(p(lt, 300, 500), 20, 0.95)}>
        <div className="flex gap-3 @2xl:gap-4">
          <Photo src={pr.img} className="aspect-square w-[34%] shrink-0 bg-mist" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{pr.name}</p>
            <ul className="mt-1.5 flex flex-col gap-1 text-[12px] @2xl:text-[13px]">
              {rows.map((r) => (
                <li
                  key={r.label}
                  className={cn("flex justify-between gap-2 rounded-lg px-2 py-1", r.good ? "bg-mint font-bold text-sea-dark" : "text-body")}
                  style={enter(p(lt, r.at, 400), 8)}
                >
                  <span className="truncate">{r.label}</span>
                  <span className="tabular-nums">{r.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-end justify-between gap-2 border-t-2 border-dashed border-line pt-2" style={{ opacity: total }}>
              <span className="text-[12px] font-semibold text-muted">OnBuy price</span>
              <span className="font-display text-[clamp(20px,4.2cqw,34px)] leading-none font-extrabold text-ink tabular-nums">
                {gbp(pr.cost + (pr.price - pr.cost) * total)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2" style={enter(p(lt, 3300, 500), 10)}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white @2xl:text-xs">
          <ShieldCheck className="size-3.5 text-sun" /> Floor £21.80 · never crossed
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-3 pl-1 text-[11px] font-semibold text-white @2xl:text-xs">
          <span className="flex -space-x-2">
            {PRODUCTS.slice(1).map((x) => (
              <Photo key={x.name} src={x.img} className="size-6 rounded-full ring-2 ring-[#0b1a15]" />
            ))}
          </span>
          +1,247 priced
        </span>
      </div>
    </Split>
  );
}

function CompeteScene({ lt }: { lt: number }) {
  const pr = PRODUCTS[0];
  const yours = lt > 1600 ? 24.69 : 24.99;
  const won = lt > 2300;
  const sellers = [
    { name: "You", price: yours, you: true },
    { name: "HomeDeals UK", price: 24.79, you: false },
    { name: "BestBuyz", price: 26.5, you: false },
  ];
  const rank = [...sellers].sort((a, b) => a.price - b.price).map((s) => s.name);
  // Price track from £20 to £28.
  const at = (n: number) => `${((n - 20) / 8) * 100}%`;
  return (
    <Split
      title={
        <Title lt={lt} step="03 · Compete" sub="Checked every few minutes. Cheaper rival? Answered in seconds.">
          Win the buy box. <Hi>Keep your margin.</Hi>
        </Title>
      }
    >
      <div className="relative rounded-3xl bg-white p-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,.7)] @2xl:p-4" style={enter(p(lt, 300, 500), 20, 0.95)}>
        <div className="flex items-center gap-2.5">
          <Photo src={pr.img} className="size-10 shrink-0 bg-mist @2xl:size-12" />
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{pr.name}</p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-500",
              won ? "scale-105 bg-sun text-ink shadow-[0_0_0_6px_rgba(255,210,63,.3)]" : "bg-coral text-[#8a3b22]",
            )}
          >
            <Crown className="size-3.5" /> {won ? "Buy box won" : "Undercut"}
          </span>
        </div>
        <div className="relative mt-3 h-[108px]">
          {sellers.map((s) => (
            <div
              key={s.name}
              className={cn(
                "absolute inset-x-0 flex h-8 items-center justify-between rounded-xl px-3 text-[13px] transition-transform duration-700 ease-out",
                s.you ? "z-10 bg-mint font-bold text-sea-dark ring-2 ring-sea" : "bg-mist text-body",
              )}
              style={{ transform: `translateY(${rank.indexOf(s.name) * 38}px)` }}
            >
              <span>
                {rank.indexOf(s.name) + 1}. {s.name}
              </span>
              <span className="tabular-nums">{gbp(s.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-1 border-t border-dashed border-line pt-3">
          <div className="relative h-2 rounded-full bg-mist">
            <span className="absolute inset-y-0 left-0 rounded-l-full bg-danger/15" style={{ width: at(21.8) }} />
            <span className="absolute -top-1 h-4 w-0.5 bg-danger" style={{ left: at(21.8) }} />
            <span
              className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-sea shadow transition-[left] duration-700"
              style={{ left: at(yours) }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-muted @2xl:text-[11px]">
            <span className="text-danger">Floor £21.80</span>
            <span>Your price {gbp(yours)}</span>
          </div>
        </div>
      </div>
      <div
        className="absolute -right-1 -bottom-10 hidden items-center gap-2 rounded-2xl bg-sun px-3 py-2 text-[12px] font-bold text-ink shadow-xl @2xl:flex"
        style={enter(p(lt, 3300, 500), 14, 0.9)}
      >
        <TrendingUp className="size-4" /> Desk lamp rival sold out · raised to £31.49
      </div>
    </Split>
  );
}

function SalesScene({ lt }: { lt: number }) {
  const grow = p(lt, 200, 4200);
  const max = Math.max(...DAYS);
  const pts = DAYS.map((d, i) => [(i / (DAYS.length - 1)) * 300, 96 - (d / max) * 84] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const shownCount = Math.min(ORDERS.length, Math.max(0, Math.floor((lt - 600) / 700) + 1));
  const latest = Array.from({ length: Math.min(3, shownCount) }, (_, k) => shownCount - 1 - k);

  return (
    <Split
      title={
        <Title lt={lt} step="04 · Sell" sub="More buy boxes, more orders. Day and night.">
          Watch the <Hi>orders roll in.</Hi>
        </Title>
      }
    >
      <div className="flex h-full flex-col gap-3 @2xl:h-auto">
        <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-3.5 text-white backdrop-blur @2xl:p-4" style={enter(p(lt, 200, 500), 18)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#b9cfc6] @2xl:text-xs">Revenue this month</p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sea px-2 py-0.5 text-[11px] font-bold">
              <TrendingUp className="size-3" /> +377%
            </span>
          </div>
          <p className="mt-0.5 font-display text-[clamp(28px,6.4cqw,48px)] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap text-sun tabular-nums">
            £{int(48917 * grow)}
          </p>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="mt-2 h-[clamp(44px,11cqw,80px)] w-full">
            <defs>
              <linearGradient id="demo-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffd23f" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ffd23f" stopOpacity="0" />
              </linearGradient>
              <clipPath id="demo-clip">
                <rect x="0" y="0" height="100" width={300 * grow} />
              </clipPath>
            </defs>
            <g clipPath="url(#demo-clip)">
              <path d={`${line} L300,100 L0,100 Z`} fill="url(#demo-area)" />
              <path d={line} fill="none" stroke="#ffd23f" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            {[
              [int(1932 * grow), "orders"],
              [`${Math.round(87 * grow)}%`, "buy box"],
              ["£3.41", "avg profit"],
            ].map(([v, l]) => (
              <div key={l} className="min-w-0 rounded-xl bg-white/10 px-1 py-1.5">
                <p className="truncate font-display text-[clamp(13px,2.6cqw,18px)] font-extrabold tabular-nums">{v}</p>
                <p className="text-[10px] text-white/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <ul className="grid gap-2 @2xl:grid-cols-2">
          {latest.slice(0, 2).map((k, i) => {
            const pr = PRODUCTS[ORDERS[k]];
            const v = p(lt, 600 + k * 700, 450);
            return (
              <li
                key={k}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl bg-white p-2 pr-3 text-ink shadow-[0_18px_40px_-14px_rgba(0,0,0,.7)]",
                  i > 0 && "hidden @2xl:flex",
                )}
                style={{ ...enter(v, 0, 0.9), transform: `translateX(${(1 - v) * 40}px) scale(${0.9 + 0.1 * v})` }}
              >
                <Photo src={pr.img} className="size-9 shrink-0 bg-mist" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-sea-dark">
                    <CheckCircle2 className="size-3.5" /> New order
                  </span>
                  <span className="block truncate text-[12px] font-semibold">{pr.name}</span>
                </span>
                <span className="font-display text-sm font-extrabold tabular-nums">{gbp(pr.price)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Split>
  );
}

function EndScene({ lt }: { lt: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div style={enter(p(lt, 0, 500), 20, 0.8)}>
        <LogoMark size={52} />
      </div>
      <h3
        className="mt-4 font-display text-[clamp(26px,6.4cqw,54px)] leading-[1] font-extrabold tracking-[-0.04em] text-white"
        style={enter(p(lt, 200, 600), 22)}
      >
        Sell more on OnBuy,
        <br />
        <Hi>never at a loss.</Hi>
      </h3>
      <p className="mt-4 rounded-full bg-sun px-5 py-2 text-[13px] font-bold text-ink @2xl:text-base" style={enter(p(lt, 700, 500), 12, 0.9)}>
        Start your 14-day free trial
      </p>
      <p className="mt-2 text-[12px] text-white/70 @2xl:text-sm" style={enter(p(lt, 900, 500), 10)}>
        No card needed · Cancel any time
      </p>
      <div className="mt-5 flex gap-2">
        {PRODUCTS.map((pr, i) => (
          <Photo
            key={pr.name}
            src={pr.img}
            className="size-[clamp(36px,8cqw,56px)] rounded-2xl shadow-lg"
            style={enter(p(lt, 1100 + i * 120, 450), 16, 0.7)}
          />
        ))}
      </div>
    </div>
  );
}
