import Link from "next/link";
import { AlertTriangle, Building2, CircleDollarSign, Package, Swords, Users, Zap } from "lucide-react";
import { PageHeader, SectionCard, StatTile } from "@/components/app/page-bits";
import { AnimatedNumber, Rise } from "@/components/app/motion";
import { DailyBars, Ring } from "@/components/admin/admin-charts";
import { Badge } from "@/components/ui/badge";
import { activitySeries, platformStats, recentProblems, recentSignups, signupSeries } from "@/server/admin/repo";
import { needsAttention } from "@/server/admin/activity-repo";
import { ATTENTION_LOOKBACK_DAYS } from "@/server/admin/activity-rules";
import { requireAdmin } from "@/server/admin/auth";
import { amazonPoolStatus } from "@/server/connections/amazon";
import { planFor } from "@/config/plans";
import { formatCount, timeAgo } from "@/lib/format";

/** How many sellers the overview lists; the rest are counted. */
const ATTENTION_SHOWN = 12;

export default async function AdminOverview() {
  // The (panel) layout checks too, but layouts can be skipped on client navigation.
  await requireAdmin();
  const [s, signups, activity, latest, problems, pool, attention] = await Promise.all([
    platformStats(),
    signupSeries(30),
    activitySeries(14),
    recentSignups(6),
    recentProblems(8),
    amazonPoolStatus(),
    needsAttention(),
  ]);
  const paying = s.active - s.free + s.pastDue;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Platform overview" intro="Everything happening across SellSail, live from the database." />

      <Rise>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="MRR" tone="mint" icon={<CircleDollarSign className="size-4" />} value={<AnimatedNumber value={s.mrrPence / 100} format="gbp" />} sub={`${paying} paying workspace${paying === 1 ? "" : "s"}`} />
          <StatTile label="Workspaces" tone="sky" icon={<Building2 className="size-4" />} value={<AnimatedNumber value={s.workspaces} />} sub={`+${s.signups7d} in 7 days`} />
          <StatTile label="Users" tone="mist" icon={<Users className="size-4" />} value={<AnimatedNumber value={s.users} />} sub={s.unverified ? `${s.unverified} unverified` : "All verified"} />
          <StatTile label="Listings" tone="sun" icon={<Package className="size-4" />} value={<AnimatedNumber value={s.listings} />} sub={`${formatCount(s.inStock)} in stock`} />
        </div>
      </Rise>

      <Rise delay={0.03}>
        <SectionCard
          title="Needs attention"
          intro={`Sellers who may be stuck: sign-ups from the last ${ATTENTION_LOOKBACK_DAYS} days, trials ending soon and repricing that keeps failing. Open one to see their activity.`}
          actions={attention.length > 0 && <Badge variant="sun">{attention.length}</Badge>}
        >
          {attention.length === 0 ? (
            <p className="text-sm text-muted">Nobody looks stuck right now.</p>
          ) : (
            <>
              <ul className="grid gap-2 lg:grid-cols-2">
                {attention.slice(0, ATTENTION_SHOWN).map(({ facts: f, reasons }) => {
                  const urgent = reasons[0].key === "repeated_errors" || reasons[0].key === "no_reprice";
                  return (
                    <li key={f.tenantId} className="flex gap-2.5 rounded-xl bg-mist p-3 text-sm">
                      <AlertTriangle aria-hidden="true" className={urgent ? "mt-0.5 size-4 shrink-0 text-danger" : "mt-0.5 size-4 shrink-0 text-sun-ink"} />
                      <span className="min-w-0">
                        <Link href={`/admin/users/${f.userId}`} prefetch={false} className="font-semibold break-all text-ink">
                          {f.email}
                        </Link>{" "}
                        <span className="break-all text-muted">· {f.tenantName}</span>
                        {reasons.map((r) => (
                          <span key={r.key} className="mt-0.5 block text-body">
                            <span className="font-semibold">{r.label}.</span> {r.detail}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {attention.length > ATTENTION_SHOWN && <p className="mt-3 text-[13px] text-muted">And {attention.length - ATTENTION_SHOWN} more, less urgent, not shown.</p>}
            </>
          )}
        </SectionCard>
      </Rise>

      <div className="grid gap-6 lg:grid-cols-3">
        <Rise delay={0.05} className="lg:col-span-2">
          <SectionCard title="New workspaces" intro="Sign-ups per day, last 30 days.">
            <DailyBars data={signups} label="New workspaces" unit="sign-ups" />
          </SectionCard>
        </Rise>
        <Rise delay={0.08}>
          <SectionCard title="Subscriptions">
            <Ring value={paying} max={Math.max(1, s.workspaces)} label="Paying" sub={`${paying} of ${s.workspaces} workspaces`} />
            <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
              {[
                ["Trialing", s.trialing],
                ["Paying", s.active - s.free],
                ["Free access", s.free],
                ["Past due", s.pastDue],
                ["Ended", s.churned],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-mist px-3 py-2">
                  <dt className="text-[12px] text-muted">{k}</dt>
                  <dd className="font-display text-lg font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        </Rise>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Rise delay={0.1} className="lg:col-span-2">
          <SectionCard title="Repricing activity" intro="Price and stock changes per day, all workspaces, last 14 days.">
            <DailyBars data={activity} label="Price changes" unit="changes" />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Changes 24h" value={formatCount(s.priceChanges24h)} icon={<Zap className="size-4" />} />
              <StatTile label="Pushed 24h" value={formatCount(s.pushed24h)} />
              <StatTile label="OnBuy linked" value={s.onbuyConnected} />
              <StatTile label="Competing" value={s.competing} icon={<Swords className="size-4" />} />
            </div>
          </SectionCard>
        </Rise>
        <Rise delay={0.12}>
          <SectionCard title="Health" actions={<Link href="/admin/system" className="text-sm font-semibold text-sea-dark">Details</Link>}>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center justify-between gap-2">
                Amazon keys
                <Badge variant={pool.configured === 0 ? "sun" : pool.healthy === 0 ? "danger" : "mint"}>
                  {pool.configured === 0 ? (pool.idle ? `${pool.idle} stored, none in use` : "Not set") : `${pool.healthy}/${pool.configured} healthy`}
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-2">
                Jobs failing
                <Badge variant={s.jobsFailing ? "danger" : "mint"}>{s.jobsFailing}</Badge>
              </li>
              <li className="flex items-center justify-between gap-2">
                Jobs overdue 15m+
                <Badge variant={s.jobsOverdue ? "sun" : "mint"}>{s.jobsOverdue}</Badge>
              </li>
              <li className="flex items-center justify-between gap-2">
                Paused workspaces
                <Badge variant="grey">{s.paused}</Badge>
              </li>
            </ul>
          </SectionCard>
        </Rise>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Rise delay={0.14}>
          <SectionCard title="Latest sign-ups" actions={<Link href="/admin/workspaces" className="text-sm font-semibold text-sea-dark">All</Link>}>
            {latest.length === 0 ? (
              <p className="text-sm text-muted">No workspaces yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {latest.map((t) => (
                  <li key={t.id}>
                    <Link href={`/admin/workspaces/${t.id}`} className="flex items-center gap-3 py-2.5 no-underline hover:bg-mist/60">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint font-display font-bold text-sea-dark" aria-hidden="true">
                        {t.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">{t.name}</span>
                        <span className="block truncate text-[13px] text-muted">{t.email}</span>
                      </span>
                      <span className="text-right text-[13px] text-muted">
                        <Badge variant={t.planStatus === "active" ? "mint" : "grey"} size="sm">
                          {planFor(t.plan).name}
                        </Badge>
                        <span className="mt-0.5 block">{timeAgo(t.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </Rise>
        <Rise delay={0.16}>
          <SectionCard title="Recent problems" intro="Warnings and errors sellers were shown.">
            {problems.length === 0 ? (
              <p className="text-sm text-muted">Nothing has gone wrong recently.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {problems.map((p, i) => (
                  <li key={i} className="flex gap-2.5 rounded-xl bg-mist p-3 text-sm">
                    <AlertTriangle aria-hidden="true" className={p.level === "error" ? "mt-0.5 size-4 shrink-0 text-danger" : "mt-0.5 size-4 shrink-0 text-sun-ink"} />
                    <span className="min-w-0">
                      <Link href={`/admin/workspaces/${p.tenantId}`} className="font-semibold text-ink">
                        {p.tenant}
                      </Link>{" "}
                      <span className="text-muted">· {timeAgo(p.createdAt)}</span>
                      <span className="mt-0.5 block text-body">{p.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </Rise>
      </div>
    </>
  );
}
