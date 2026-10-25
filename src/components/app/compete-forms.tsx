"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Flame, ShieldCheck, Swords, Trophy } from "lucide-react";
import { TextField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import { Input, Label } from "@/components/ui/input";
import { competitivePrice, type CompeteSettings, type CompeteStrategy } from "@/lib/competition";
import { estimatedProfit, marketplacePrice, type PricingBand, type PricingFees } from "@/lib/pricing";
import { formatGBP } from "@/lib/format";
import { cn } from "@/lib/utils";
import { saveCompeteAction } from "@/server/actions/app";

const STRATEGIES: { id: CompeteStrategy; title: string; text: string; icon: typeof ShieldCheck; tone: string }[] = [
  {
    id: "profit",
    title: "Protect profit",
    text: "Undercut cheaper sellers, but always keep at least your minimum profit on every sale, after fees.",
    icon: ShieldCheck,
    tone: "bg-mint text-sea-dark",
  },
  {
    id: "aggressive",
    title: "Win the sale",
    text: "Go below cost by up to your maximum loss to take the sale: useful for new listings that need sales and reviews.",
    icon: Flame,
    tone: "bg-sun-soft text-sun-ink",
  },
];

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function CompeteForm({ settings, fees, bands, canEdit }: { settings: CompeteSettings; fees: PricingFees; bands: PricingBand[]; canEdit: boolean }) {
  const id = useId();
  const reduce = useReducedMotion();
  const [state, action] = useActionState(saveCompeteAction, undefined);
  const [enabled, setEnabled] = useState(settings.enabled);
  const [strategy, setStrategy] = useState<CompeteStrategy>(settings.strategy);
  const [beatBy, setBeatBy] = useState(settings.beatBy.toFixed(2));
  const [maxUndercut, setMaxUndercut] = useState(settings.maxUndercut.toFixed(2));
  const [minProfit, setMinProfit] = useState(settings.minProfit.toFixed(2));
  const [maxLoss, setMaxLoss] = useState(settings.maxLoss.toFixed(2));
  const [amazon, setAmazon] = useState("24.99");
  const [rival, setRival] = useState("34.50");

  const live: CompeteSettings = { enabled: true, strategy, beatBy: num(beatBy), maxUndercut: num(maxUndercut), minProfit: num(minProfit), maxLoss: num(maxLoss) };
  const sim = useMemo(() => {
    const amz = num(amazon);
    const band = marketplacePrice(amz, bands, fees);
    if (band === null) return null;
    const lead = num(rival);
    const r = competitivePrice(band, amz, lead > 0 ? { price: lead, seenAt: new Date() } : null, fees, live);
    return { band, ...r, profit: estimatedProfit(amz, r.price, fees), lead };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amazon, rival, strategy, beatBy, maxUndercut, minProfit, maxLoss, bands, fees]);

  const outcome = !sim
    ? { label: "No band covers that Amazon price", tone: "bg-danger-soft text-danger" }
    : sim.lead <= 0
      ? { label: "No competitor: band price", tone: "bg-mist text-body" }
      : sim.reason === "undercut"
        ? { label: `Beats £${sim.lead.toFixed(2)} by £${(sim.lead - sim.price).toFixed(2)}`, tone: "bg-mint text-sea-dark" }
        : sim.reason === "floor"
          ? { label: "Leader is below your floor: holding at the floor", tone: "bg-sun-soft text-sun-ink" }
          : { label: "Already cheapest: band price", tone: "bg-mint text-sea-dark" };

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <label
          htmlFor={`${id}-on`}
          className={cn(
            "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors",
            enabled ? "border-sea bg-mint/60" : "border-line bg-white",
          )}
        >
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", enabled ? "bg-sea text-white" : "bg-mist text-muted")} aria-hidden="true">
            <Swords className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Compete on OnBuy</span>
            <span className="block text-sm text-muted">Check who is winning each listing and undercut cheaper sellers automatically.</span>
          </span>
          <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
            <input
              id={`${id}-on`}
              name="enabled"
              type="checkbox"
              role="switch"
              className="peer sr-only"
              checked={enabled}
              disabled={!canEdit}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-sea peer-focus-visible:ring-2 peer-focus-visible:ring-sea peer-focus-visible:ring-offset-2" />
            <span className="absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>

        <fieldset disabled={!canEdit} className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-bold">How low can SellSail go?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {STRATEGIES.map((s) => {
              const active = strategy === s.id;
              return (
                <label
                  key={s.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all",
                    active ? "border-sea bg-white shadow-[0_8px_24px_-12px_rgba(14,124,102,0.45)]" : "border-line bg-white hover:border-sea/40",
                  )}
                >
                  <input type="radio" name="strategy" value={s.id} checked={active} onChange={() => setStrategy(s.id)} className="sr-only" />
                  <span className={cn("flex size-9 items-center justify-center rounded-xl", s.tone)} aria-hidden="true">
                    <s.icon className="size-[18px]" />
                  </span>
                  <span className="font-bold">{s.title}</span>
                  <span className="text-[13px] leading-relaxed text-muted">{s.text}</span>
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "strategy-ring"}
                      className="pointer-events-none absolute inset-[-2px] rounded-2xl ring-2 ring-sea"
                      aria-hidden="true"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${id}-beat`}
            name="beatBy"
            label="Beat the leader by (£)"
            hint="How far under the cheapest seller to list, e.g. 0.05."
            inputMode="decimal"
            value={beatBy}
            onChange={(e) => setBeatBy(e.target.value)}
          />
          <TextField
            id={`${id}-max`}
            name="maxUndercut"
            label="Never more than (£) below"
            hint="A cap on the undercut, so a mispriced rival can't drag you down."
            inputMode="decimal"
            value={maxUndercut}
            onChange={(e) => setMaxUndercut(e.target.value)}
          />
          {strategy === "profit" ? (
            <TextField
              id={`${id}-minp`}
              name="minProfit"
              label="Minimum profit per sale (£)"
              hint="After OnBuy and payment fees. Your band price is always the ceiling."
              inputMode="decimal"
              value={minProfit}
              onChange={(e) => setMinProfit(e.target.value)}
            />
          ) : (
            <TextField
              id={`${id}-loss`}
              name="maxLoss"
              label="Maximum loss per sale (£)"
              hint="After fees. 0 means sell at cost, never below."
              inputMode="decimal"
              value={maxLoss}
              onChange={(e) => setMaxLoss(e.target.value)}
            />
          )}
          <input type="hidden" name={strategy === "profit" ? "maxLoss" : "minProfit"} value={strategy === "profit" ? maxLoss : minProfit} />
        </fieldset>

        <FormMessage state={state} />
        {canEdit && (
          <div>
            <SubmitButton variant="ink" pendingLabel="Saving…">
              Save competition settings
            </SubmitButton>
          </div>
        )}
      </div>

      <aside aria-label="Try it" className="rounded-3xl bg-ink p-5 text-white">
        <p className="flex items-center gap-2 text-sm font-bold text-sun">
          <Trophy aria-hidden="true" className="size-4" /> Try it
        </p>
        <p className="mt-1 text-[13px] text-[#9fbdb1]">Uses your bands, fees and the settings on the left.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-amz`} className="text-[#c9ddd5]">
              Amazon price (£)
            </Label>
            <Input id={`${id}-amz`} inputMode="decimal" value={amazon} onChange={(e) => setAmazon(e.target.value)} className="bg-white text-ink" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-riv`} className="text-[#c9ddd5]">
              Cheapest rival (£)
            </Label>
            <Input id={`${id}-riv`} inputMode="decimal" value={rival} onChange={(e) => setRival(e.target.value)} className="bg-white text-ink" />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-[#13261e] p-3">
            <dt className="text-[12px] text-[#9fbdb1]">Band price</dt>
            <dd className="mt-0.5 font-display text-lg font-bold">{sim ? formatGBP(sim.band) : "—"}</dd>
          </div>
          <div className="rounded-2xl bg-[#13261e] p-3">
            <dt className="text-[12px] text-[#9fbdb1]">Your floor</dt>
            <dd className="mt-0.5 font-display text-lg font-bold">{sim?.floor != null ? formatGBP(sim.floor) : "—"}</dd>
          </div>
        </dl>

        <div className="mt-3 rounded-2xl bg-white p-4 text-ink">
          <p className="text-[12px] font-semibold text-muted">You list at</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={sim ? sim.price.toFixed(2) : "none"}
              initial={reduce ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -12, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-[34px] leading-tight font-extrabold"
              aria-live="polite"
            >
              {sim ? formatGBP(sim.price) : "—"}
            </motion.p>
          </AnimatePresence>
          <p className={cn("mt-2 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold", outcome.tone)}>{outcome.label}</p>
          {sim && (
            <p className={cn("mt-2 text-[13px] font-semibold", sim.profit < 0 ? "text-danger" : "text-sea-dark")}>
              {sim.profit < 0 ? "Loss" : "Profit"} per sale: {formatGBP(Math.abs(sim.profit))}
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
