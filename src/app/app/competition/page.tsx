import type { Metadata } from "next";
import Link from "next/link";
import { CircleSlash, Crown, Radar, Swords, TrendingDown } from "lucide-react";
import { EmptyState, PageHeader, SectionCard, StatTile } from "@/components/app/page-bits";
import { AnimatedNumber, ProgressBar, Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { CompeteForm } from "@/components/app/compete-forms";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { getBands, getSettings } from "@/server/repos/pricing";
import { COMPETE_FILTERS, COMPETE_PAGE, competeRows, competeStats, type CompeteFilter } from "@/server/repos/competition";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { checkCompetitionNowAction, setListingCompeteAction } from "@/server/actions/app";
import { formatCount, formatGBP, timeAgo } from "@/lib/format";
import { planFor } from "@/config/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Competition" };

const FILTER_LABEL: Record<CompeteFilter, string> = {
  losing: "Losing",
  winning: "Winning",
  unchecked: "Not checked yet",
  off: "Switched off",
  all: "All",
};

export default async function CompetitionPage({ searchParams }: { searchParams: Promise<{ filter?: string; page?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const filter: CompeteFilter = (COMPETE_FILTERS as string[]).includes(sp.filter ?? "") ? (sp.filter as CompeteFilter) : "losing";
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1));
  const [settings, bands, stats, onbuy, list] = await Promise.all([
    getSettings(auth.tenantId),
    getBands(auth.tenantId),
    competeStats(auth.tenantId),
    getOnBuyAccount(auth.tenantId),
    competeRows(auth.tenantId, filter, page),
  ]);
  const canEdit = auth.role !== "member";
  const on = settings.compete.enabled;
  const winRate = stats.winning + stats.losing > 0 ? Math.round((stats.winning / (stats.winning + stats.losing)) * 100) : null;
  const every = Math.round(planFor(auth.plan).competeIntervalS / 60);
  const pages = Math.max(1, Math.ceil(list.total / COMPETE_PAGE));

  return (
    <>
      <PageHeader
        eyebrow="Competition"
        title={
          <span className="flex flex-wrap items-center gap-3">
            Win the sale
            <Badge variant={on ? "mint" : "grey"}>{on ? "On" : "Off"}</Badge>
          </span>
        }
        intro={`SellSail asks OnBuy who is winning each of your listings every ${every} minutes and, when another seller is cheaper, prices just under them, never below the floor you set.`}
        actions={
          onbuy && on ? (
            <ActionButton action={checkCompetitionNowAction} variant="outline" pendingLabel="Queuing…">
              <Radar aria-hidden="true" className="size-4" /> Check now
            </ActionButton>
          ) : null
        }
      />

      <Rise>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Winning" tone="mint" icon={<Crown className="size-4" />} value={<AnimatedNumber value={stats.winning} />} sub={winRate === null ? "No checks yet" : `${winRate}% of checked listings`} />
          <StatTile label="Losing" tone={stats.losing ? "sun" : "mist"} icon={<TrendingDown className="size-4" />} value={<AnimatedNumber value={stats.losing} />} sub="A cheaper seller leads" />
          <StatTile label="Priced to compete" tone="sky" icon={<Swords className="size-4" />} value={<AnimatedNumber value={stats.undercut} />} sub={`${formatCount(stats.changes24h)} price moves in 24h`} />
          <StatTile label="Checked" tone="mist" icon={<Radar className="size-4" />} value={<AnimatedNumber value={stats.checked} />} sub={stats.lastCheckAt ? `Last ${timeAgo(stats.lastCheckAt)}` : "Not yet"} />
        </div>
        {stats.inPlay > 0 && (
          <div className="mt-4">
            <ProgressBar value={stats.checked} max={stats.inPlay} label="Listings checked against OnBuy" />
            <p className="mt-1.5 text-[13px] text-muted">
              {formatCount(stats.checked)} of {formatCount(stats.inPlay)} in-stock listings checked
              {stats.optedOut ? ` · ${formatCount(stats.optedOut)} switched off` : ""}
            </p>
          </div>
        )}
      </Rise>

      <Rise delay={0.05}>
        <SectionCard
          title="Rules"
          intro="Competition only ever lowers a price: your band price stays the ceiling. When you're winning, SellSail holds the price for a few hours, then tries the band price again in case the rival has gone."
        >
          {!onbuy && <p className="mb-5 rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">Connect OnBuy first: competition checks use your OnBuy keys.</p>}
          <CompeteForm settings={settings.compete} fees={settings.fees} bands={bands} canEdit={canEdit} />
        </SectionCard>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard title="Listings" intro="Who's ahead on each listing, as OnBuy last told us.">
          <nav aria-label="Filter listings" className="-mx-1 mb-4 flex flex-wrap gap-1.5">
            {COMPETE_FILTERS.map((f) => (
              <Link
                key={f}
                href={`/app/competition?filter=${f}`}
                aria-current={f === filter ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline transition-colors",
                  f === filter ? "bg-ink text-white" : "bg-mist text-body hover:bg-mint",
                )}
              >
                {FILTER_LABEL[f]}
              </Link>
            ))}
          </nav>

          {list.rows.length === 0 ? (
            <EmptyState icon={<CircleSlash className="size-5" />} title={filter === "losing" ? "Nobody is beating you" : "Nothing here"}>
              {filter === "losing"
                ? on
                  ? "No checked listing has a cheaper seller right now."
                  : "Switch competition on to start checking your listings."
                : "No listings match this filter."}
            </EmptyState>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">Listing</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Amazon</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Your price</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Leader</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Checked</th>
                    {canEdit && <th scope="col" className="py-2 font-semibold"><span className="sr-only">Compete</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {list.rows.map((r) => {
                    const gap = r.competitorPrice !== null && r.price !== null ? r.price - r.competitorPrice : null;
                    return (
                      <tr key={r.id} className="border-b border-line/70 last:border-0">
                        <td className="max-w-[280px] py-2.5 pr-3">
                          <p className="truncate font-semibold" title={r.title ?? r.sku}>{r.title || r.sku}</p>
                          <p className="truncate font-mono text-[12px] text-muted">{r.sku}</p>
                        </td>
                        <td className="py-2.5 pr-3">
                          {!r.compete ? (
                            <Badge variant="grey" size="sm">Off</Badge>
                          ) : r.winning === null ? (
                            <Badge variant="grey" size="sm">Waiting</Badge>
                          ) : r.winning ? (
                            <Badge variant="mint" size="sm">Winning</Badge>
                          ) : (
                            <Badge variant="sun" size="sm">Losing</Badge>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{formatGBP(r.sourcePrice)}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{formatGBP(r.price)}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {r.competitorPrice === null ? "—" : formatGBP(r.competitorPrice)}
                          {gap !== null && gap > 0.004 && <span className="block text-[12px] font-semibold text-sun-ink">£{gap.toFixed(2)} under you</span>}
                        </td>
                        <td className="py-2.5 pr-3 text-[13px] text-muted">{timeAgo(r.checkedAt)}</td>
                        {canEdit && (
                          <td className="py-2.5 text-right">
                            <form action={setListingCompeteAction}>
                              <input type="hidden" name="productId" value={r.id} />
                              <input type="hidden" name="on" value={r.compete ? "0" : "1"} />
                              <Button type="submit" variant="ghost" size="sm">
                                {r.compete ? "Switch off" : "Switch on"}
                              </Button>
                            </form>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">
                Page {page} of {pages} · {formatCount(list.total)} listings
              </span>
              <span className="flex gap-2">
                {page > 1 && (
                  <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/app/competition?filter=${filter}&page=${page - 1}`}>
                    Previous
                  </Link>
                )}
                {page < pages && (
                  <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/app/competition?filter=${filter}&page=${page + 1}`}>
                    Next
                  </Link>
                )}
              </span>
            </div>
          )}
        </SectionCard>
      </Rise>
    </>
  );
}
