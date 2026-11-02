import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { ActivitySummary, ActivityTimeline, PlanBadge } from "@/components/admin/activity-view";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { adminAudit, requireAdmin } from "@/server/admin/auth";
import { accountFacts, activityTimeline, parseTimelineFilter, recentProblems, repricerHealth, workspaceMembers } from "@/server/admin/activity-repo";
import { attentionReasons } from "@/server/admin/activity-rules";
import { requestInfo } from "@/server/auth/context";
import { planFor } from "@/config/plans";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Workspace activity" };

export default async function WorkspaceActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The (panel) layout checks too, but layouts can be skipped on client
  // navigation, and this page shows one seller's activity.
  const admin = await requireAdmin();
  const { id } = await params;
  const tenantId = Number(id);
  if (!Number.isInteger(tenantId) || tenantId <= 0) notFound();
  const facts = await accountFacts(tenantId);
  if (!facts) notFound();

  const filter = parseTimelineFilter(await searchParams);
  const scope = { tenantId };
  const [health, problems, timeline, members] = await Promise.all([
    repricerHealth(tenantId),
    recentProblems(scope, [tenantId]),
    activityTimeline(scope, filter),
    workspaceMembers(tenantId),
  ]);
  const lastSeenAt = members.reduce<Date | null>((a, m) => (m.lastSeenAt && (!a || m.lastSeenAt > a) ? m.lastSeenAt : a), null);

  // Every look at a seller's activity is on the record.
  const { ip } = await requestInfo();
  await adminAudit(admin.email, "tenant.view_activity", tenantId, "", ip);

  return (
    <>
      <Link href={`/admin/workspaces/${tenantId}`} className="-mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sea-dark no-underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> <span className="break-all">{facts.tenantName}</span>
      </Link>
      <PageHeader
        eyebrow={`Workspace #${tenantId}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="break-all">Activity</span>
            <PlanBadge facts={facts} />
            {facts.paused && <Badge variant="danger">Paused</Badge>}
          </span>
        }
        intro={`${facts.tenantName} · ${planFor(facts.plan).name} plan · owner ${facts.email}`}
        actions={
          <Link href={`/admin/workspaces/${tenantId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Workspace details
          </Link>
        }
      />

      <ActivitySummary facts={facts} health={health} problems={problems} lastSeenAt={lastSeenAt} attention={attentionReasons(facts)} />

      <Rise delay={0.11}>
        <SectionCard title="Members" intro="Onboarding above is the owner's. Open a member for their own activity.">
          <ul className="flex flex-col divide-y divide-line">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={`/admin/users/${m.id}`} prefetch={false} className="min-w-0 truncate font-semibold text-ink">
                  {m.email}
                </Link>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Badge variant="grey" size="sm">{m.role}</Badge>
                  <span className="text-[12px] text-muted">seen {timeAgo(m.lastSeenAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </Rise>

      <ActivityTimeline basePath={`/admin/workspaces/${tenantId}/activity`} filter={filter} rows={timeline.rows} total={timeline.total} showUser />
    </>
  );
}
