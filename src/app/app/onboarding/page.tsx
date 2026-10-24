import type { Metadata } from "next";
import Link from "next/link";
import { Check, Globe, KeyRound, PackageOpen, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { ProgressBar, Rise } from "@/components/app/motion";
import { AmazonForms, CsvImportForm, OnBuyForm, OnBuyImportForm, ProxyForm } from "@/components/app/connection-forms";
import { BandsEditor } from "@/components/app/pricing-forms";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { getOnboardingState, listJobs } from "@/server/repos/dashboard";
import { loadProxy } from "@/server/connections/proxy";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { appClient, listAmazonAccounts } from "@/server/connections/amazon";
import { getBands, getSettings } from "@/server/repos/pricing";
import { finishOnboardingAction } from "@/server/actions/app";
import { WIZARD_STEPS, type WizardStep } from "@/server/onboarding";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Set up" };

const STEPS: Record<WizardStep, { title: string; short: string; icon: typeof Globe }> = {
  proxy: { title: "Your proxy", short: "Proxy", icon: Globe },
  onbuy: { title: "Connect OnBuy", short: "OnBuy", icon: KeyRound },
  amazon: { title: "Connect Amazon", short: "Amazon", icon: ShoppingCart },
  pricing: { title: "Your margins", short: "Pricing", icon: SlidersHorizontal },
  import: { title: "Bring in your listings", short: "Import", icon: PackageOpen },
};

const step = (s: WizardStep) => `/app/onboarding?step=${s}`;

function AmazonReturn({ result }: { result?: string }) {
  if (!result) return null;
  const text =
    result === "connected"
      ? "Amazon account connected."
      : result === "cancelled"
        ? "Amazon approval was cancelled. Try again when you're ready."
        : "Connecting Amazon didn't work. The reason is in your activity feed on the Overview page.";
  return (
    <p role={result === "connected" ? "status" : "alert"} className={cn("mb-5 rounded-xl p-3 text-sm font-semibold", result === "connected" ? "bg-mint text-sea-dark" : "bg-danger-soft text-danger")}>
      {text}
    </p>
  );
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string; amazon?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const state = await getOnboardingState(auth.tenantId);
  const done: Record<WizardStep, boolean> = {
    proxy: state.proxyOk,
    onbuy: state.onbuyConnected,
    amazon: state.amazonAccounts > 0,
    pricing: state.pricingReviewed,
    import: state.products > 0,
  };
  const firstOpen = WIZARD_STEPS.find((s) => !done[s]) ?? "import";
  const current: WizardStep = (WIZARD_STEPS as readonly string[]).includes(sp.step ?? "") ? (sp.step as WizardStep) : firstOpen;
  const completed = WIZARD_STEPS.filter((s) => done[s]).length;
  const canEdit = auth.role !== "member";
  const nextOf = (s: WizardStep) => {
    const i = WIZARD_STEPS.indexOf(s);
    return i < WIZARD_STEPS.length - 1 ? step(WIZARD_STEPS[i + 1]) : undefined;
  };

  const [proxy, onbuy, amazon, bands, settings, jobs] = await Promise.all([
    loadProxy(auth.tenantId),
    getOnBuyAccount(auth.tenantId),
    listAmazonAccounts(auth.tenantId),
    getBands(auth.tenantId),
    getSettings(auth.tenantId),
    listJobs(auth.tenantId),
  ]);
  const importJob = jobs.find((j) => j.kind === "import");
  const meta = STEPS[current];

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Get SellSail repricing"
        intro="Five short steps. Every OnBuy and Amazon request goes through your own proxy, so we start there."
      />
      <div className="max-w-md">
        <ProgressBar value={completed} max={WIZARD_STEPS.length} label="Setup progress" />
        <p className="mt-2 text-[13px] font-semibold text-muted">
          {completed} of {WIZARD_STEPS.length} done
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Setup steps">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {WIZARD_STEPS.map((s, i) => {
              const Icon = STEPS[s].icon;
              const active = s === current;
              return (
                <li key={s} className="shrink-0">
                  <Link
                    href={step(s)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 font-semibold no-underline transition-colors",
                      active ? "border-ink bg-white text-ink shadow-[0_10px_24px_-14px_rgba(16,35,28,.35)]" : "border-transparent text-body hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold",
                        done[s] ? "bg-sea text-white" : active ? "bg-sun text-ink" : "bg-mist text-muted",
                      )}
                      aria-hidden="true"
                    >
                      {done[s] ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className="flex flex-col leading-tight">
                      {STEPS[s].short}
                      <span className="text-xs font-medium text-muted">{done[s] ? "Done" : active ? "Now" : "To do"}</span>
                    </span>
                    <Icon aria-hidden="true" className="ml-auto hidden size-4 text-muted lg:block" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <Rise key={current}>
          <SectionCard
            title={
              <span className="flex items-center gap-2.5">
                {meta.title}
                {done[current] && <Badge variant="mint" size="sm">Done</Badge>}
              </span>
            }
            intro={
              current === "proxy"
                ? "Several sellers share SellSail's servers. Sending your requests from your own proxy keeps your OnBuy and Amazon accounts from ever appearing linked to anyone else's. Without a working proxy, nothing is sent at all."
                : current === "onbuy"
                  ? "Your OnBuy API keys let SellSail read your listings and update their prices and stock. They're stored encrypted and only used through your proxy."
                  : current === "amazon"
                    ? "SellSail reads Amazon's offers for each ASIN to find the price you'd pay. Add more than one account later to reprice a big catalogue faster."
                    : current === "pricing"
                      ? "Margins by Amazon price. These are our suggested starting points: check them against your own costs before anything is priced."
                      : "Import your current OnBuy listings, or upload a CSV of SKUs. SellSail then prices them from Amazon and keeps OnBuy in step."
            }
          >
            {current === "proxy" && (
              <>
                {proxy?.status === "ok" && (
                  <p role="status" className="mb-5 rounded-xl bg-mint p-3 text-sm font-semibold text-sea-dark">
                    Working. OnBuy and Amazon see the IP address {proxy.egressIp}.{" "}
                    <Link href={step("onbuy")} className="underline underline-offset-4">
                      Continue to OnBuy
                    </Link>
                  </p>
                )}
                {canEdit ? <ProxyForm hostHint={proxy?.hostHint} savedType={proxy?.config?.type} savedPort={proxy?.config?.port} next={nextOf("proxy")} /> : <p className="text-body">Ask a workspace admin to set up the proxy.</p>}
              </>
            )}

            {current === "onbuy" && (
              <>
                {!state.proxyOk && <NeedsProxy />}
                {onbuy?.status === "connected" && (
                  <p role="status" className="mb-5 rounded-xl bg-mint p-3 text-sm font-semibold text-sea-dark">
                    Connected with consumer key {onbuy.keyHint}.{" "}
                    <Link href={step("amazon")} className="underline underline-offset-4">
                      Continue to Amazon
                    </Link>
                  </p>
                )}
                {canEdit && <OnBuyForm keyHint={onbuy?.keyHint} next={nextOf("onbuy")} disabled={!state.proxyOk} />}
              </>
            )}

            {current === "amazon" && (
              <>
                <AmazonReturn result={sp.amazon} />
                {!state.proxyOk && <NeedsProxy />}
                {amazon.length > 0 && (
                  <ul className="mb-5 flex flex-col gap-2">
                    {amazon.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-4 py-3">
                        <span className="font-semibold">{a.label}</span>
                        <Badge variant={a.status === "connected" ? "mint" : "danger"} size="sm">
                          {a.status === "connected" ? "Connected" : "Needs attention"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
                {amazon.length > 0 && (
                  <p className="mb-5 text-sm">
                    <Link href={step("pricing")} className={buttonVariants({ variant: "ink", size: "sm" })}>
                      Continue to pricing
                    </Link>
                  </p>
                )}
                {canEdit && <AmazonForms oauthAvailable={Boolean(appClient())} next={nextOf("amazon")} disabled={!state.proxyOk} />}
              </>
            )}

            {current === "pricing" &&
              (canEdit ? (
                <BandsEditor bands={bands} fees={settings.fees} next={nextOf("pricing")} submitLabel="Save and continue" />
              ) : (
                <p className="text-body">Ask a workspace admin to set the pricing bands.</p>
              ))}

            {current === "import" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-line p-5">
                  <h3 className="font-bold">From OnBuy</h3>
                  <p className="mt-1 mb-4 text-sm text-muted">Reads every listing on your account, 500 at a time. SKUs that aren&apos;t an ASIN (or prefix + ASIN) are skipped.</p>
                  {importJob && (importJob.enabled || importJob.progTotal > 0) && (
                    <div className="mb-4">
                      <ProgressBar value={importJob.progDone} max={Math.max(importJob.progTotal, 1)} label="OnBuy import progress" />
                      <p className="mt-1.5 text-[13px] text-muted">{importJob.lastMsg || "Waiting for a free worker…"}</p>
                    </div>
                  )}
                  {canEdit && <OnBuyImportForm disabled={!state.onbuyConnected} />}
                  {!state.onbuyConnected && <p className="mt-3 text-[13px] text-muted">Connect OnBuy first.</p>}
                </div>
                <div className="rounded-2xl border border-line p-5">
                  <h3 className="font-bold">From a CSV file</h3>
                  <p className="mt-1 mb-4 text-sm text-muted">For listings you&apos;re about to create, or a subset to start with.</p>
                  {canEdit && <CsvImportForm />}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mint p-5 md:col-span-2">
                  <p className="font-semibold text-sea-dark">
                    {state.products > 0 ? `${formatCount(state.products)} listing${state.products === 1 ? "" : "s"} ready.` : "No listings yet."}{" "}
                    {state.products > 0 && !(done.proxy && done.onbuy && done.amazon) && "Finish the earlier steps so they can be priced."}
                  </p>
                  <form action={finishOnboardingAction}>
                    <Button type="submit" variant="ink" disabled={!canEdit || state.products === 0 || !(done.proxy && done.onbuy && done.amazon)}>
                      Start repricing <span aria-hidden="true">→</span>
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </SectionCard>
        </Rise>
      </div>
    </>
  );
}

function NeedsProxy() {
  return (
    <p role="status" className="mb-5 rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">
      Set up a working proxy first: this step talks to the marketplace through it.{" "}
      <Link href={step("proxy")} className="underline underline-offset-4">
        Go to the proxy step
      </Link>
    </p>
  );
}
