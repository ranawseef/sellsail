// The activity view shared by /admin/users/[id] and
// /admin/workspaces/[id]/activity: a summary (last seen, plan, onboarding,
// repricer health, recent problems) and the filtered timeline. Server
// components only; the filters are a plain GET form.

import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { SectionCard, StatTile } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { SelectField, TextField } from "@/components/app/field";
import { statusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ACTIVITY_TYPE_LIST,
  ACTIVITY_TYPES,
  CATEGORY_BADGE,
  CATEGORY_LABEL,
  describeActivity,
  isProblem,
  type ActivityCategory,
} from "@/lib/activity";
import { onboardingSteps, type AccountFacts, type AttentionReason } from "@/server/admin/activity-rules";
import { TIMELINE_PAGE, type ProblemRow, type RepricerHealth, type TimelineFilter, type TimelineRow } from "@/server/admin/activity-repo";
import { planFor } from "@/config/plans";
import { formatCount, formatDateTime, timeAgo } from "@/lib/format";

const labelOf = (type: string) => (ACTIVITY_TYPES as Record<string, { label: string }>)[type]?.label ?? type;

// ---- summary ---------------------------------------------------------------------------

export function ActivitySummary({
  facts,
  health,
  problems,
  lastSeenAt,
  attention,
}: {
  facts: AccountFacts | null;
  health: RepricerHealth | null;
  problems: ProblemRow[];
  lastSeenAt: Date | null;
  attention: AttentionReason[];
}) {
  const steps = facts ? onboardingSteps(facts) : [];
  const done = steps.filter((s) => s.done).length;
  const plan = facts ? planFor(facts.plan) : null;

  return (
    <>
      <Rise>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Last seen" tone="mist" value={timeAgo(lastSeenAt)} sub={lastSeenAt ? formatDateTime(lastSeenAt) : "No sign of use yet"} />
          <StatTile
            label="Plan"
            tone={facts?.planStatus === "past_due" ? "danger" : "mint"}
            value={plan?.name ?? "—"}
            sub={
              facts
                ? facts.compUntil
                  ? `Free until ${formatDateTime(facts.compUntil)}`
                  : facts.planStatus === "trialing"
                    ? `Trial ends ${formatDateTime(facts.trialEndsAt)}`
                    : facts.planStatus.replace("_", " ")
                : "No workspace"
            }
          />
          <StatTile
            label="Reprice runs, 7 days"
            tone={health && health.failed7d > 0 ? "danger" : "sky"}
            value={formatCount(health?.runs7d ?? 0)}
            sub={health ? `${formatCount(health.failed7d)} failed` : undefined}
          />
          <StatTile label="Changes, 7 days" tone="sun" value={formatCount(health?.changes7d ?? 0)} sub={health ? `Price and stock · ${formatCount(health.listings)} listings` : undefined} />
        </div>
      </Rise>

      {attention.length > 0 && (
        <Rise delay={0.03}>
          <div className="rounded-2xl bg-sun-soft p-4 text-sm text-sun-ink" role="status">
            <p className="font-bold">Needs attention</p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {attention.map((a) => (
                <li key={a.key}>
                  <span className="font-semibold">{a.label}:</span> {a.detail}
                </li>
              ))}
            </ul>
          </div>
        </Rise>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Rise delay={0.05}>
          <SectionCard title="Onboarding" intro={facts ? `${done} of ${steps.length} steps done.` : "This user has no workspace."}>
            {steps.length > 0 && (
              <ol className="grid gap-2 sm:grid-cols-2">
                {steps.map((s) => {
                  const Icon = s.done ? CheckCircle2 : CircleDashed;
                  return (
                    <li key={s.key} className="flex items-start gap-3 rounded-2xl bg-mist p-3.5">
                      <Icon aria-hidden="true" className={s.done ? "mt-0.5 size-5 shrink-0 text-sea" : "mt-0.5 size-5 shrink-0 text-sun-ink"} />
                      <span className="min-w-0">
                        <span className="block font-semibold">
                          {s.label}
                          <span className="sr-only">{s.done ? ": done" : ": not yet"}</span>
                        </span>
                        <span className="block text-[13px] text-muted">
                          {s.done ? (s.at ? formatDateTime(s.at) : "Done") : "Not yet"}
                          {s.note && ` · ${s.note}`}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>
        </Rise>
        <Rise delay={0.08}>
          <SectionCard title="Repricer health" intro="From the reprice job and its runs in the last 7 days.">
            {health ? (
              <>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  {!health.jobEnabled ? (
                    <Badge variant="grey" size="sm">Off</Badge>
                  ) : facts?.paused ? (
                    <Badge variant="danger" size="sm">Paused</Badge>
                  ) : health.lastOk === false ? (
                    <Badge variant="danger" size="sm">Failing</Badge>
                  ) : health.lastOk ? (
                    <Badge variant="mint" size="sm">OK</Badge>
                  ) : (
                    <Badge variant="grey" size="sm">Not run yet</Badge>
                  )}
                  <span className="min-w-0 text-body">{health.lastMsg || "No runs yet."}</span>
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {(
                    [
                      ["Last run", timeAgo(health.lastRunAt)],
                      ["Last success", timeAgo(health.lastSuccessAt)],
                      ["Runs", formatCount(health.runs7d)],
                      ["Failed runs", formatCount(health.failed7d)],
                      ["Listings checked", formatCount(health.checked7d)],
                      ["Listings repriced", formatCount(health.repriced7d)],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-mist px-3 py-2">
                      <dt className="text-[12px] text-muted">{k}</dt>
                      <dd className="font-display text-lg font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">No workspace, so no repricer.</p>
            )}
          </SectionCard>
        </Rise>
      </div>

      <Rise delay={0.1}>
        <SectionCard title="Recent problems" intro="Errors shown to the seller and failures recorded in the last 7 days, newest first.">
          {problems.length === 0 ? (
            <p className="text-sm text-muted">Nothing has gone wrong in the last 7 days.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {problems.map((p, i) => (
                <li key={i} className="flex gap-2.5 rounded-xl bg-mist p-3 text-sm">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
                  <span className="min-w-0">
                    <span className="font-semibold text-ink">{p.source === "notice" ? `Seller notice (${p.type})` : labelOf(p.type)}</span>{" "}
                    <span className="text-muted">· {timeAgo(p.createdAt)}</span>
                    <span className="mt-0.5 block break-words text-body">{p.source === "notice" ? p.message : describeActivity(p.type, p.detail) || "—"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </Rise>
    </>
  );
}

// ---- timeline -----------------------------------------------------------------------------

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ActivityCategory[];

/** The timeline's URL with this filter, for links (pagination, clearing). */
function timelineHref(basePath: string, f: TimelineFilter, page: number): string {
  const u = new URLSearchParams();
  if (f.type) u.set("type", f.type);
  if (f.from) u.set("from", f.from);
  if (f.to) u.set("to", f.to);
  if (page > 1) u.set("page", String(page));
  const qs = u.toString();
  return `${basePath}${qs ? `?${qs}` : ""}#activity`;
}

export function ActivityTimeline({
  basePath,
  filter,
  rows,
  total,
  showUser,
}: {
  basePath: string;
  filter: TimelineFilter;
  rows: TimelineRow[];
  total: number;
  /** Name who did it on each row (the workspace view, which can have several members). */
  showUser: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / TIMELINE_PAGE));
  const filtered = Boolean(filter.type || filter.from || filter.to);
  return (
    <Rise delay={0.12}>
      <SectionCard
        id="activity"
        title="Activity"
        intro={`${formatCount(total)} event${total === 1 ? "" : "s"}${filtered ? " matching the filter" : ""}, newest first. Kept for 12 months.`}
      >
        <form method="get" action={`${basePath}#activity`} className="flex flex-wrap items-end gap-3">
          <SelectField id="activity-type" name="type" label="Type" defaultValue={filter.type} className="min-w-[220px] flex-1">
            <option value="">All activity</option>
            <optgroup label="Groups">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </optgroup>
            {CATEGORIES.filter((c) => c !== "errors").map((c) => (
              <optgroup key={c} label={CATEGORY_LABEL[c]}>
                {ACTIVITY_TYPE_LIST.filter((t) => ACTIVITY_TYPES[t].category === c).map((t) => (
                  <option key={t} value={t}>
                    {ACTIVITY_TYPES[t].label}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
          <TextField id="activity-from" name="from" type="date" label="From" defaultValue={filter.from} className="w-full sm:w-44" />
          <TextField id="activity-to" name="to" type="date" label="To (inclusive)" defaultValue={filter.to} className="w-full sm:w-44" />
          <div className="flex gap-2">
            <Button type="submit" variant="ink" size="sm">
              Filter
            </Button>
            {filtered && (
              <Link href={`${basePath}#activity`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Clear
              </Link>
            )}
          </div>
        </form>

        {rows.length === 0 ? (
          <p className="mt-5 text-sm text-muted">{filtered ? "No activity matches the filter." : "No activity recorded yet."}</p>
        ) : (
          <ul className="mt-5 flex flex-col divide-y divide-line text-sm">
            {rows.map((r) => {
              const problem = isProblem(r.type, r.detail);
              const info = (ACTIVITY_TYPES as Record<string, { category: ActivityCategory }>)[r.type];
              const text = describeActivity(r.type, r.detail);
              return (
                <li key={r.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-3">
                  <span className="shrink-0 text-[12px] text-muted sm:w-32" title={timeAgo(r.createdAt)}>
                    <time dateTime={new Date(r.createdAt).toISOString()}>{formatDateTime(r.createdAt)}</time>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {problem && <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-danger" />}
                      <span className={problem ? "font-semibold text-danger" : "font-semibold"}>{labelOf(r.type)}</span>
                      {info && (
                        <Badge variant={problem ? "danger" : "grey"} size="sm">
                          {CATEGORY_BADGE[info.category]}
                        </Badge>
                      )}
                    </span>
                    {text && <span className="mt-0.5 block break-words text-body">{text}</span>}
                    {(showUser || r.ip) && (
                      <span className="mt-0.5 block text-[12px] text-muted">
                        {showUser && (r.userId ? (r.userEmail ?? `user #${r.userId}`) : "SellSail (automatic)")}
                        {showUser && r.ip && " · "}
                        {r.ip && `IP ${r.ip}`}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">
              Page {filter.page} of {pages}
            </span>
            <span className="flex gap-2">
              {filter.page > 1 && (
                <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={timelineHref(basePath, filter, filter.page - 1)}>
                  Newer
                </Link>
              )}
              {filter.page < pages && (
                <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={timelineHref(basePath, filter, filter.page + 1)}>
                  Older
                </Link>
              )}
            </span>
          </div>
        )}
      </SectionCard>
    </Rise>
  );
}

/** A workspace's subscription state, for page headers. */
export function PlanBadge({ facts }: { facts: AccountFacts | null }) {
  return facts ? statusBadge(facts.planStatus, facts.trialEndsAt) : null;
}
