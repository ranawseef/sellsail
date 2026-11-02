import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-bits";
import { ActivitySummary, ActivityTimeline, PlanBadge } from "@/components/admin/activity-view";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { adminAudit, requireAdmin } from "@/server/admin/auth";
import { accountFacts, activityTimeline, activityUser, parseTimelineFilter, recentProblems, repricerHealth } from "@/server/admin/activity-repo";
import { attentionReasons } from "@/server/admin/activity-rules";
import { requestInfo } from "@/server/auth/context";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "User activity" };

export default async function UserActivityPage({
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
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();
  const user = await activityUser(userId);
  if (!user) notFound();

  const filter = parseTimelineFilter(await searchParams);
  const tenantIds = user.workspaces.map((w) => w.id);
  const primary = user.workspaces[0] ?? null;
  const scope = { userId, tenantIds };
  const [facts, health, problems, timeline] = await Promise.all([
    primary ? accountFacts(primary.id, userId) : Promise.resolve(null),
    primary ? repricerHealth(primary.id) : Promise.resolve(null),
    recentProblems(scope, tenantIds),
    activityTimeline(scope, filter),
  ]);

  // Every look at a seller's activity is on the record.
  const { ip } = await requestInfo();
  await adminAudit(admin.email, "user.view_activity", primary?.id ?? null, `#${user.id} ${user.email}`, ip);

  const verified = facts?.emailVerifiedAt !== null && facts?.emailVerifiedAt !== undefined;
  return (
    <>
      <Link href="/admin/users" className="-mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sea-dark no-underline">
        <ArrowLeft aria-hidden="true" className="size-4" /> Users
      </Link>
      <PageHeader
        eyebrow={`User #${user.id}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="break-all">{user.name}</span>
            {facts && (verified ? <Badge variant="mint">Verified</Badge> : <Badge variant="sun">Unverified</Badge>)}
            <PlanBadge facts={facts} />
          </span>
        }
        intro={`${user.email} · joined ${formatDateTime(user.createdAt)}${primary ? ` · ${primary.role} of ${primary.name}` : " · no workspace"}`}
        actions={user.workspaces.map((w) => (
          <Link key={w.id} href={`/admin/workspaces/${w.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {user.workspaces.length > 1 ? w.name : "Workspace details"}
          </Link>
        ))}
      />

      <ActivitySummary facts={facts} health={health} problems={problems} lastSeenAt={user.lastSeenAt} attention={facts ? attentionReasons(facts) : []} />

      {user.workspaces.length > 1 && (
        <p className="text-[13px] text-muted">
          Onboarding and repricer health are for {primary?.name}, this user&apos;s first workspace. The timeline covers all {user.workspaces.length}.
        </p>
      )}

      <ActivityTimeline basePath={`/admin/users/${user.id}`} filter={filter} rows={timeline.rows} total={timeline.total} showUser={false} />
    </>
  );
}
