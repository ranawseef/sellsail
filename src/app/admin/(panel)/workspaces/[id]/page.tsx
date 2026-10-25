import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gift, Pause, Play, RefreshCw } from "lucide-react";
import { PageHeader, SectionCard, StatTile } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { DeleteTenantForm, FreeAccessForm, PlanForm } from "@/components/admin/admin-forms";
import { statusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tenantDetail } from "@/server/admin/repo";
import { endFreeAccessAction, runTenantJobAction, setTenantPausedAction } from "@/server/admin/actions";
import { PLANS, planFor } from "@/config/plans";
import { formatCount, formatDateTime, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Workspace" };

/** Tomorrow as YYYY-MM-DD, the earliest end date for free access. */
function tomorrowIso(): string {
  return new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
}

const JOB = { reprice: "Reprice", push: "Send to OnBuy", import: "Import", compete: "Competition" } as Record<string, string>;

export default async function WorkspaceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenantId = Number(id);
  if (!Number.isInteger(tenantId) || tenantId <= 0) notFound();
  const t = await tenantDetail(tenantId);
  if (!t) notFound();
  const plan = planFor(t.plan);

  return (
    <>
      <Link href="/admin/workspaces" className="-mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sea-dark no-underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> Workspaces
      </Link>
      <PageHeader
        eyebrow={`Workspace #${t.id}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {t.name}
            {statusBadge(t.planStatus, t.trialEndsAt)}
            {t.compUntil && <Badge variant="sky">Free until {formatDateTime(t.compUntil)}</Badge>}
            {t.paused && <Badge variant="danger">Paused</Badge>}
          </span>
        }
        intro={`${plan.name} plan · joined ${formatDateTime(t.createdAt)}${t.trialEndsAt && t.planStatus === "trialing" ? ` · trial ends ${formatDateTime(t.trialEndsAt)}` : ""}`}
        actions={
          <form action={setTenantPausedAction}>
            <input type="hidden" name="tenantId" value={t.id} />
            <input type="hidden" name="paused" value={t.paused ? "0" : "1"} />
            <Button type="submit" variant={t.paused ? "sea" : "outline"} size="sm">
              {t.paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
              {t.paused ? "Resume workspace" : "Pause workspace"}
            </Button>
          </form>
        }
      />

      <Rise>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Listings" tone="mint" value={formatCount(t.counts.total)} sub={`${formatCount(t.counts.inStock)} in stock · limit ${formatCount(plan.maxSkus)}`} />
          <StatTile label="Waiting to push" tone="sky" value={formatCount(t.counts.pending)} sub={`${formatCount(t.counts.pushErrors)} push errors`} />
          <StatTile label="Amazon errors" tone={t.counts.sourceErrors ? "sun" : "mist"} value={formatCount(t.counts.sourceErrors)} />
          <StatTile
            label="Competition"
            tone="mist"
            value={t.competing ? `${t.counts.winning}/${t.counts.winning + t.counts.losing}` : "Off"}
            sub={t.competing ? `Winning · ${t.competeStrategy === "aggressive" ? "win the sale" : "protect profit"}` : undefined}
          />
        </div>
      </Rise>

      <div className="grid gap-6 lg:grid-cols-2">
        <Rise delay={0.05}>
          <SectionCard title="Subscription">
            <PlanForm tenantId={t.id} plan={t.plan} status={t.planStatus} plans={Object.values(PLANS).map((p) => ({ id: p.id, name: p.name }))} />
            {t.stripeCustomerId && <p className="mt-4 text-[13px] text-muted">Stripe customer {t.stripeCustomerId}</p>}
          </SectionCard>
        </Rise>
        <Rise delay={0.08}>
          <SectionCard title="Members and OnBuy">
            <ul className="flex flex-col divide-y divide-line">
              {t.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{m.name}</span>
                    <span className="block truncate text-[13px] text-muted">{m.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="grey" size="sm">{m.role}</Badge>
                    {!m.verified && <Badge variant="sun" size="sm">Unverified</Badge>}
                    <span className="text-[12px] text-muted">{m.lastLoginAt ? timeAgo(m.lastLoginAt) : "never"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl bg-mist p-4 text-sm">
              {t.onbuy ? (
                <>
                  <p className="flex items-center gap-2 font-semibold">
                    OnBuy <Badge variant={t.onbuy.status === "connected" ? "mint" : "danger"} size="sm">{t.onbuy.status}</Badge>
                  </p>
                  <p className="mt-1 text-muted">Key {t.onbuy.keyHint} · last OK {timeAgo(t.onbuy.lastOkAt)}</p>
                  {t.onbuy.lastError && <p className="mt-1 font-semibold text-danger">{t.onbuy.lastError}</p>}
                </>
              ) : (
                <p className="text-muted">OnBuy not connected.</p>
              )}
            </div>
          </SectionCard>
        </Rise>
      </div>

      <Rise delay={0.09}>
        <SectionCard
          title={
            <span className="flex items-center gap-2.5">
              <Gift aria-hidden="true" className="size-5 text-sea" /> Free access
            </span>
          }
          intro="Give this workspace a plan at no charge, or a free trial, for a set period. It ends by itself on the date; if they subscribe through Stripe before then, the subscription takes over."
        >
          {t.compUntil && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky p-4 text-sm text-[#1f5f8b]">
              <span>
                <span className="block font-bold">Free {plan.name} until {formatDateTime(t.compUntil)}</span>
                {t.compNote && <span className="block">{t.compNote}</span>}
              </span>
              <form action={endFreeAccessAction}>
                <input type="hidden" name="tenantId" value={t.id} />
                <Button type="submit" variant="outline" size="sm">End now</Button>
              </form>
            </div>
          )}
          {t.stripeSubscriptionId && ["active", "past_due"].includes(t.planStatus) && !t.compUntil ? (
            <p className="rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">This workspace pays through Stripe. Use a coupon in Stripe instead, or cancel the subscription first.</p>
          ) : (
            <FreeAccessForm tenantId={t.id} tomorrow={tomorrowIso()} plans={Object.values(PLANS).filter((p) => p.id !== "trial").map((p) => ({ id: p.id, name: p.name }))} />
          )}
        </SectionCard>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard title="Jobs">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-muted">
                  <th scope="col" className="py-2 pr-3 font-semibold">Job</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">State</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Last result</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Next</th>
                  <th scope="col" className="py-2 font-semibold"><span className="sr-only">Run</span></th>
                </tr>
              </thead>
              <tbody>
                {t.jobs.map((j) => (
                  <tr key={j.id} className="border-b border-line/70 last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{JOB[j.kind] ?? j.kind}<span className="block text-[12px] font-normal text-muted">{j.runs} runs</span></td>
                    <td className="py-2.5 pr-3">
                      {!j.enabled ? <Badge variant="grey" size="sm">Off</Badge> : j.running ? <Badge variant="sky" size="sm">Running</Badge> : j.lastOk === false ? <Badge variant="danger" size="sm">Failing</Badge> : <Badge variant="mint" size="sm">OK</Badge>}
                    </td>
                    <td className="max-w-[340px] py-2.5 pr-3 text-[13px] text-body">
                      <span className="line-clamp-2">{j.lastMsg || "—"}</span>
                      <span className="text-muted">{timeAgo(j.lastFinishedAt)}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-[13px] text-muted">{formatDateTime(j.nextRunAt)}</td>
                    <td className="py-2.5 text-right">
                      <form action={runTenantJobAction}>
                        <input type="hidden" name="tenantId" value={t.id} />
                        <input type="hidden" name="jobId" value={j.id} />
                        <Button type="submit" variant="ghost" size="sm" disabled={j.running}>
                          <RefreshCw aria-hidden="true" className="size-4" /> Run now
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </Rise>

      <div className="grid gap-6 lg:grid-cols-2">
        <Rise delay={0.12}>
          <SectionCard title="Seller notices" intro="What this workspace was told, newest first.">
            {t.events.length === 0 ? (
              <p className="text-sm text-muted">None.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {t.events.map((e, i) => (
                  <li key={i} className="rounded-xl bg-mist p-3">
                    <span className="flex items-center gap-2">
                      <Badge variant={e.level === "error" ? "danger" : e.level === "warn" ? "sun" : "grey"} size="sm">{e.level}</Badge>
                      <span className="text-[12px] text-muted">{e.kind} · {timeAgo(e.createdAt)}</span>
                    </span>
                    <span className="mt-1 block text-body">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </Rise>
        <Rise delay={0.14}>
          <SectionCard title="Admin changes" intro="What admins did to this workspace.">
            {t.audit.length === 0 ? (
              <p className="text-sm text-muted">None yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line text-sm">
                {t.audit.map((a, i) => (
                  <li key={i} className="py-2">
                    <span className="font-semibold">{a.action}</span> <span className="text-body">{a.detail}</span>
                    <span className="block text-[12px] text-muted">{a.email} · {timeAgo(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </Rise>
      </div>

      <Rise delay={0.16}>
        <SectionCard
          title="Delete workspace"
          intro="Deletes every listing, key, token, price history and log for this workspace, and members with no other workspace. It can't be undone."
          className="border-danger/30"
        >
          <DeleteTenantForm tenantId={t.id} name={t.name} />
        </SectionCard>
      </Rise>
    </>
  );
}
