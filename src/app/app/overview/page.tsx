import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, CircleCheck, Clock3, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader, SectionCard, StatTile } from "@/components/app/page-bits";
import { AnimatedNumber, ProgressBar, Rise } from "@/components/app/motion";
import { ChangesChart, Pipeline, type Stage } from "@/components/app/charts";
import { EventFeed, RunHistory } from "@/components/app/feeds";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { changesByHour, getOverview, listJobs, recentEvents, recentRuns } from "@/server/repos/dashboard";
import { amazonPoolStatus } from "@/server/connections/amazon";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { getBands } from "@/server/repos/pricing";
import { formatCount, timeAgo } from "@/lib/format";
import { one } from "@/server/db/pool";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

function greeting(name: string) {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }));
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name.split(" ")[0]}`;
}

export default async function OverviewPage() {
  const auth = await requireAuth();
  const t = auth.tenantId;
  const [o, hours, jobs, runs, events, pool, onbuy, bands] = await Promise.all([
    getOverview(t),
    changesByHour(t),
    listJobs(t),
    recentRuns(t, 8),
    recentEvents(t, 8),
    amazonPoolStatus(),
    getOnBuyAccount(t),
    getBands(t),
  ]);
  const setup = await one<{ pricing_reviewed_at: Date | null; compete_enabled: number | null }>(
    "SELECT t.pricing_reviewed_at, rs.compete_enabled FROM tenants t LEFT JOIN repricer_settings rs ON rs.tenant_id = t.id WHERE t.id = ?",
    [t],
  );
  const checklist = [
    { label: "Confirm your email", done: true, href: "/app/settings" },
    { label: "Connect OnBuy", done: Boolean(onbuy), href: "/app/onboarding?step=onbuy" },
    { label: "Check your margins", done: Boolean(setup?.pricing_reviewed_at), href: "/app/onboarding?step=pricing" },
    { label: "Import your listings", done: o.products > 0, href: "/app/onboarding?step=import" },
    { label: "Switch on competition", done: Boolean(setup?.compete_enabled), href: "/app/competition" },
    { label: "Choose a plan", done: auth.planStatus === "active" || auth.planStatus === "past_due", href: "/app/billing" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const nextStep = checklist.find((c) => !c.done);

  const reprice = jobs.filter((j) => j.kind === "reprice");
  const push = jobs.find((j) => j.kind === "push");
  const amazonOn = pool.configured > 0;
  const stageState = (set: boolean, running: boolean, failing: boolean): Stage["state"] =>
    !set ? "off" : failing ? "attention" : running ? "working" : "ok";

  const stages: [Stage, Stage, Stage] = [
    {
      title: "Amazon",
      state: stageState(amazonOn && o.products > 0, reprice.some((j) => j.running), amazonOn && (pool.healthy === 0 || reprice.some((j) => j.lastOk === false))),
      value: o.products - o.unpriced,
      unit: "priced",
      detail: amazonOn ? `Last read ${timeAgo(o.lastRepriceAt)}` : "Starting soon",
    },
    {
      title: "Pricing",
      state: bands.length && o.products ? "ok" : "off",
      value: o.inStock,
      unit: "in stock",
      detail: `${bands.length} bands · ${formatCount(o.outOfStock)} out of stock`,
    },
    {
      title: "OnBuy",
      state: stageState(Boolean(onbuy), Boolean(push?.running), onbuy?.status === "error" || push?.lastOk === false),
      value: o.pendingPush,
      unit: "to send",
      detail: onbuy ? `Last update ${timeAgo(o.lastPushAt)}` : "Connect OnBuy",
    },
  ];

  const attention = o.pushErrors + o.sourceErrors;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={greeting(auth.name)}
        intro={auth.paused ? "Syncing is paused. Here's where things stood." : "Here's what your repricer has been doing."}
        actions={
          <Link href="/app/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View products
          </Link>
        }
      />

      {nextStep && (
        <Rise>
          <section aria-labelledby="setup-title" className="relative overflow-hidden rounded-2xl border border-canvas-line bg-white p-5 shadow-[0_1px_2px_rgba(16,35,28,0.04)] sm:p-6">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sun to-sea" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-sun-soft text-sun-ink" aria-hidden="true">
                  <Rocket className="size-5" />
                </span>
                <div>
                  <h2 id="setup-title" className="font-display text-[17px] font-bold">
                    Get set up: {doneCount} of {checklist.length} done
                  </h2>
                  <p className="text-[13px] text-muted">Next: {nextStep.label.toLowerCase()}.</p>
                </div>
              </div>
              <Link href={nextStep.href} className={buttonVariants({ variant: "ink", size: "sm" })}>
                {nextStep.label} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="mt-5">
              <ProgressBar value={doneCount} max={checklist.length} label="Set-up progress" tone="sea" />
            </div>
            <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-colors",
                      c.done ? "bg-canvas text-muted" : "border border-canvas-line bg-white text-ink hover:border-sea hover:bg-mint/40",
                    )}
                  >
                    {c.done ? (
                      <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-sea" />
                    ) : (
                      <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-canvas-line" />
                    )}
                    <span className={c.done ? "line-through decoration-muted/40" : undefined}>{c.label}</span>
                    <span className="sr-only">{c.done ? "(done)" : "(to do)"}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </Rise>
      )}

      <Rise delay={0.05}>
        <section aria-label="Key figures" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Listings" tone="mist" icon={<Boxes className="size-4" />} value={<AnimatedNumber value={o.products} />} sub={`${formatCount(o.archived)} archived`} />
          <StatTile label="In stock on OnBuy" tone="mint" icon={<CircleCheck className="size-4" />} value={<AnimatedNumber value={o.inStock} />} sub={`${formatCount(o.outOfStock)} out of stock`} />
          <StatTile label="Waiting to send" tone="sun" icon={<Clock3 className="size-4" />} value={<AnimatedNumber value={o.pendingPush} />} sub={`last sent ${timeAgo(o.lastPushAt)}`} />
          <StatTile label="Changes, last 24h" tone="sky" icon={<TrendingUp className="size-4" />} value={<AnimatedNumber value={o.changes24h} />} sub="prices and stock" />
        </section>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard title="Pipeline" intro="Amazon offers are read, priced with your bands, and sent to OnBuy." actions={<Link href="/app/automation" className={buttonVariants({ variant: "ghost", size: "sm" })}>Automation</Link>}>
          <Pipeline stages={stages} />
        </SectionCard>
      </Rise>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Rise delay={0.15}>
          <SectionCard title="Changes per hour" intro="Price and stock changes made in the last 24 hours.">
            <ChangesChart data={hours} />
          </SectionCard>
        </Rise>
        <Rise delay={0.2}>
          <SectionCard title="Needs attention" intro={attention ? "Listings with an error from Amazon or OnBuy." : "Nothing is waiting on you."}>
            <ul className="flex flex-col gap-2">
              {[
                { label: "OnBuy rejected an update", n: o.pushErrors, href: "/app/products?filter=errors" },
                { label: "Amazon reads failing", n: o.sourceErrors, href: "/app/products?filter=errors" },
                { label: "Not priced yet", n: o.unpriced, href: "/app/products?filter=unpriced" },
                { label: "Archived (not on OnBuy)", n: o.archived, href: "/app/products?filter=archived" },
              ].map((row) => (
                <li key={row.label}>
                  <Link href={row.href} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-ink no-underline hover:bg-mist">
                    <span className="text-sm font-semibold">{row.label}</span>
                    <Badge variant={row.n ? (row.label.startsWith("Not") ? "sun" : "danger") : "grey"} size="sm">
                      {formatCount(row.n)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        </Rise>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Rise delay={0.25}>
          <SectionCard title="Recent runs" actions={<Link href="/app/automation" className={buttonVariants({ variant: "ghost", size: "sm" })}>All runs</Link>}>
            <RunHistory runs={runs} />
          </SectionCard>
        </Rise>
        <Rise delay={0.3}>
          <SectionCard title="Activity">
            <EventFeed events={events} />
          </SectionCard>
        </Rise>
      </div>

      <Rise delay={0.35}>
        <SectionCard title="Sources and marketplaces" intro="Where products come from and where they're sold.">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Amazon", role: "Source", on: amazonOn, note: amazonOn ? "Included in your plan" : "Starting soon", label: amazonOn ? "Included" : "Soon" },
              { name: "OnBuy", role: "Marketplace", on: Boolean(onbuy), note: onbuy ? `Key ${onbuy.keyHint}` : "Not connected" },
              { name: "AliExpress", role: "Source", soon: true, note: "Import and reprice from AliExpress" },
              { name: "eBay", role: "Marketplace", soon: true, note: "List and reprice on eBay" },
            ].map((c) => (
              <li key={c.name} className={c.soon ? "rounded-2xl border-2 border-dashed border-canvas-line p-4" : "rounded-2xl border border-canvas-line p-4"}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{c.name}</span>
                  {c.soon ? (
                    <Badge variant="solid" size="sm">
                      <Sparkles aria-hidden="true" className="size-3" /> Coming soon
                    </Badge>
                  ) : (
                    <Badge variant={c.on ? "mint" : "grey"} size="sm">
                      {"label" in c && c.label ? c.label : c.on ? "Connected" : "Off"}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {c.role} · {c.note}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </Rise>
    </>
  );
}
