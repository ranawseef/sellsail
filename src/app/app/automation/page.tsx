import type { Metadata } from "next";
import { Pause, Play, RefreshCw } from "lucide-react";
import { EmptyState, PageHeader, SectionCard } from "@/components/app/page-bits";
import { ProgressBar, Rise } from "@/components/app/motion";
import { EventFeed, RunHistory, StatusBadge } from "@/components/app/feeds";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { listJobs, recentEvents, recentRuns } from "@/server/repos/dashboard";
import { runJobNowAction, setPausedAction } from "@/server/actions/app";
import { canRunJobs, planFor } from "@/config/plans";
import { formatDateTime, timeAgo, timeUntil } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Automation" };

const KIND: Record<string, { title: string; what: string }> = {
  reprice: { title: "Reprice", what: "Reads live Amazon prices and sets each listing's OnBuy price and stock from your rules." },
  push: { title: "Send to OnBuy", what: "Sends changed prices and stock to OnBuy in batches." },
  import: { title: "Import from OnBuy", what: "Reads your OnBuy listings, 500 at a time." },
  compete: { title: "Competition", what: "Asks OnBuy who is winning each listing, 100 at a time, and undercuts cheaper sellers down to your floor." },
};

export default async function AutomationPage() {
  const auth = await requireAuth();
  const [jobs, runs, errors] = await Promise.all([listJobs(auth.tenantId), recentRuns(auth.tenantId, 30), recentEvents(auth.tenantId, 15, ["warn", "error"])]);
  const allowed = canRunJobs({ plan: auth.plan, planStatus: auth.planStatus, trialEndsAt: auth.trialEndsAt, paused: false });
  const canEdit = auth.role !== "member";

  return (
    <>
      <PageHeader
        eyebrow="Automation"
        title="Jobs and history"
        intro={`Reprice runs keep going while there's work; OnBuy updates go out every ${Math.round(planFor(auth.plan).pushIntervalS / 60)} minutes on your plan.`}
      />

      <Rise>
        <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6", auth.paused ? "bg-sun" : "bg-ink text-white")}>
          <div>
            <p className="font-display text-xl font-bold">{auth.paused ? "Syncing is paused" : allowed ? "Syncing is on" : "Syncing is stopped"}</p>
            <p className={cn("mt-1 text-sm", auth.paused ? "text-sun-ink" : "text-[#c9ddd5]")}>
              {auth.paused
                ? "Nothing is sent to OnBuy or Amazon. Your listings keep their current prices."
                : allowed
                  ? "The kill switch stops every job for this workspace at once, mid-run included."
                  : "Your plan isn't active, so no jobs run. Choose a plan in Billing."}
            </p>
          </div>
          {canEdit && (
            <form action={setPausedAction}>
              <input type="hidden" name="paused" value={auth.paused ? "0" : "1"} />
              <Button type="submit" variant={auth.paused ? "ink" : "sun"}>
                {auth.paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
                {auth.paused ? "Resume syncing" : "Pause everything"}
              </Button>
            </form>
          )}
        </div>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard title="Jobs" intro="The background jobs that keep your listings priced and in stock. They run on their own.">
          {jobs.length === 0 ? (
            <EmptyState icon={<RefreshCw className="size-5" />} title="No jobs yet">
              Jobs appear when you connect OnBuy and Amazon.
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {jobs.map((j) => (
                <li key={j.id} className="rounded-2xl border border-canvas-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-bold">
                        {KIND[j.kind].title}
                        {j.kind === "reprice" && <span className="font-medium text-muted">· {j.targetLabel}</span>}
                        <StatusBadge ok={j.lastOk} running={j.running} enabled={j.enabled} />
                      </p>
                      <p className="mt-1 text-sm text-muted">{KIND[j.kind].what}</p>
                    </div>
                    {j.enabled && (
                      <form action={runJobNowAction}>
                        <input type="hidden" name="jobId" value={j.id} />
                        <Button type="submit" variant="outline" size="sm" disabled={j.running || j.runNow || auth.paused || !allowed}>
                          <RefreshCw aria-hidden="true" className="size-4" /> {j.runNow ? "Queued" : "Run now"}
                        </Button>
                      </form>
                    )}
                  </div>
                  {j.progTotal > 0 && (
                    <div className="mt-3">
                      <ProgressBar value={j.progDone} max={j.progTotal} label={`${KIND[j.kind].title} progress`} />
                    </div>
                  )}
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-4">
                    <div>
                      <dt className="text-muted">Last run</dt>
                      <dd className="font-semibold" title={formatDateTime(j.lastStartedAt)}>{timeAgo(j.lastStartedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Next run</dt>
                      <dd className="font-semibold">{!j.enabled ? "Off" : j.running ? "Running now" : timeUntil(j.nextRunAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Runs</dt>
                      <dd className="font-semibold">{j.runs}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Last result</dt>
                      <dd className="font-semibold break-words">{j.lastMsg || "—"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </Rise>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Rise delay={0.1}>
          <SectionCard title="Run history" intro="The last 30 runs. Kept for 14 days.">
            <RunHistory runs={runs} />
          </SectionCard>
        </Rise>
        <Rise delay={0.15}>
          <SectionCard title="Errors and warnings" intro="Problems from Amazon, OnBuy or your proxy. Kept for 30 days.">
            <EventFeed events={errors} empty="No errors. All quiet." />
          </SectionCard>
        </Rise>
      </div>
    </>
  );
}
