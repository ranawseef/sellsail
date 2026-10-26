import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, Globe, KeyRound, PackageOpen, SlidersHorizontal } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { ProgressBar, Rise } from "@/components/app/motion";
import { CsvImportForm, OnBuyForm, OnBuyImportForm, ProxyForm } from "@/components/app/connection-forms";
import { ActionButton } from "@/components/app/action-button";
import { BandsEditor } from "@/components/app/pricing-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { getOnboardingState, listJobs } from "@/server/repos/dashboard";
import { loadProxy } from "@/server/connections/proxy";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { getBands, getSettings } from "@/server/repos/pricing";
import { finishOnboardingAction, removeProxyAction } from "@/server/actions/app";
import { WIZARD_STEPS, type WizardStep } from "@/server/onboarding";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Set up" };

const STEPS: Record<WizardStep, { title: string; short: string; icon: typeof Globe }> = {
  onbuy: { title: "Connect OnBuy", short: "OnBuy", icon: KeyRound },
  pricing: { title: "Your margins", short: "Pricing", icon: SlidersHorizontal },
  import: { title: "Bring in your listings", short: "Import", icon: PackageOpen },
};

const step = (s: WizardStep) => `/app/onboarding?step=${s}`;

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const state = await getOnboardingState(auth.tenantId);
  const done: Record<WizardStep, boolean> = {
    onbuy: state.onbuyConnected,
    pricing: state.pricingReviewed,
    import: state.products > 0,
  };
  const firstOpen = WIZARD_STEPS.find((s) => !done[s]) ?? "import";
  // Old links to the removed proxy and Amazon steps land on the OnBuy step.
  const asked = sp.step === "proxy" || sp.step === "amazon" ? "onbuy" : sp.step;
  const current: WizardStep = (WIZARD_STEPS as readonly string[]).includes(asked ?? "") ? (asked as WizardStep) : firstOpen;
  const completed = WIZARD_STEPS.filter((s) => done[s]).length;
  const canEdit = auth.role !== "member";
  const nextOf = (s: WizardStep) => {
    const i = WIZARD_STEPS.indexOf(s);
    return i < WIZARD_STEPS.length - 1 ? step(WIZARD_STEPS[i + 1]) : undefined;
  };

  const [proxy, onbuy, bands, settings, jobs] = await Promise.all([
    loadProxy(auth.tenantId),
    getOnBuyAccount(auth.tenantId),
    getBands(auth.tenantId),
    getSettings(auth.tenantId),
    listJobs(auth.tenantId),
  ]);
  const importJob = jobs.find((j) => j.kind === "import");
  const meta = STEPS[current];
  const ready = done.onbuy && !state.proxyBlocking;

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Get SellSail repricing"
        intro="Three short steps. Amazon prices come from SellSail's own connection, so there's nothing to set up on the Amazon side."
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
              current === "onbuy"
                ? "Your OnBuy API keys let SellSail read your listings and update their prices and stock. They're stored encrypted."
                : current === "pricing"
                  ? "Margins by Amazon price. These are our suggested starting points: check them against your own costs before anything is priced."
                  : "Import your current OnBuy listings, or upload a CSV of SKUs. SellSail then prices them from Amazon and keeps OnBuy in step."
            }
          >
            {current === "onbuy" && (
              <>
                {state.proxyBlocking && (
                  <p role="alert" className="mb-5 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">
                    Your proxy isn&apos;t working, so nothing can be sent to OnBuy. Fix it below, or remove it to connect directly.
                  </p>
                )}
                {onbuy?.status === "connected" && (
                  <p role="status" className="mb-5 rounded-xl bg-mint p-3 text-sm font-semibold text-sea-dark">
                    Connected with consumer key {onbuy.keyHint}.{" "}
                    <Link href={step("pricing")} className="underline underline-offset-4">
                      Continue to pricing
                    </Link>
                  </p>
                )}
                {canEdit ? (
                  <OnBuyForm keyHint={onbuy?.keyHint} next={nextOf("onbuy")} disabled={state.proxyBlocking} />
                ) : (
                  <p className="text-body">Ask a workspace admin to connect OnBuy.</p>
                )}

                {canEdit && (
                  <details className="group mt-8 rounded-2xl border border-canvas-line bg-paper/60" open={state.proxySaved}>
                    <summary className="flex min-h-12 items-center gap-3 px-4 py-3 font-semibold">
                      <Globe aria-hidden="true" className="size-4 text-sea" />
                      Use your own proxy
                      <Badge variant="grey" size="sm">Optional</Badge>
                      {proxy?.status === "ok" && <Badge variant="mint" size="sm">Working</Badge>}
                      {state.proxyBlocking && <Badge variant="danger" size="sm">Not working</Badge>}
                      <ChevronDown aria-hidden="true" className="ml-auto size-4 text-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-canvas-line p-4">
                      <p className="mb-4 text-sm text-body">
                        By default OnBuy requests go straight from SellSail. If you run several OnBuy accounts or want OnBuy to see your own
                        fixed IP address, send them through your own static-IP proxy instead. Once a proxy is saved, SellSail never goes
                        around it: if it stops working, syncing pauses until it&apos;s fixed or removed.
                      </p>
                      {proxy?.status === "ok" && (
                        <p role="status" className="mb-4 rounded-xl bg-mint p-3 text-sm font-semibold text-sea-dark">
                          Working. OnBuy sees the IP address {proxy.egressIp}.
                        </p>
                      )}
                      <ProxyForm hostHint={proxy?.hostHint} savedType={proxy?.config?.type} savedPort={proxy?.config?.port} next={step("onbuy")} />
                      {state.proxySaved && (
                        <div className="mt-4 border-t border-canvas-line pt-4">
                          <ActionButton action={removeProxyAction} pendingLabel="Removing…" confirm="Remove the proxy? OnBuy requests will go direct from SellSail.">
                            Remove proxy and connect directly
                          </ActionButton>
                        </div>
                      )}
                    </div>
                  </details>
                )}
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
                <div className="rounded-2xl border border-canvas-line p-5">
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
                <div className="rounded-2xl border border-canvas-line p-5">
                  <h3 className="font-bold">From a CSV file</h3>
                  <p className="mt-1 mb-4 text-sm text-muted">For listings you&apos;re about to create, or a subset to start with.</p>
                  {canEdit && <CsvImportForm />}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mint p-5 md:col-span-2">
                  <p className="font-semibold text-sea-dark">
                    {state.products > 0 ? `${formatCount(state.products)} listing${state.products === 1 ? "" : "s"} ready.` : "No listings yet."}{" "}
                    {state.products > 0 && !ready && "Connect OnBuy first so they can be kept in step."}
                  </p>
                  <form action={finishOnboardingAction}>
                    <Button type="submit" variant="ink" disabled={!canEdit || state.products === 0 || !ready}>
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
