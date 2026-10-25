import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE, listTenants } from "@/server/admin/repo";
import { planFor } from "@/config/plans";
import { formatCount, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { statusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Workspaces" };

const STATUS = [
  ["all", "All"],
  ["trialing", "Trialing"],
  ["active", "Paying"],
  ["free", "Free access"],
  ["past_due", "Past due"],
  ["churned", "Ended"],
  ["paused", "Paused"],
] as const;

export default async function WorkspacesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const search = (sp.q ?? "").slice(0, 100).trim();
  const status = STATUS.some(([k]) => k === sp.status) ? (sp.status as string) : "all";
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1));
  const { rows, total } = await listTenants(search, status, page);
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE));
  const link = (p: Record<string, string | number>) => {
    const u = new URLSearchParams({ ...(search ? { q: search } : {}), ...(status !== "all" ? { status } : {}), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    return `/admin/workspaces?${u.toString()}`;
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Workspaces" intro={`${formatCount(total)} workspace${total === 1 ? "" : "s"}${search ? ` matching “${search}”` : ""}.`} />
      <Rise>
        <SectionCard title="Find a workspace">
          <form className="flex flex-wrap gap-2" role="search">
            <label htmlFor="ws-q" className="sr-only">Search by name, owner email or id</label>
            <div className="relative min-w-[240px] flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <Input id="ws-q" name="q" defaultValue={search} placeholder="Name, owner email or id" className="pl-9" />
            </div>
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            <Button type="submit" variant="ink" size="sm">Search</Button>
          </form>
          <nav aria-label="Filter by status" className="mt-4 flex flex-wrap gap-1.5">
            {STATUS.map(([k, label]) => (
              <Link
                key={k}
                href={link({ status: k, page: 1 }).replace(/status=all&?/, "")}
                aria-current={k === status ? "page" : undefined}
                className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline transition-colors", k === status ? "bg-ink text-white" : "bg-mist text-body hover:bg-mint")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SectionCard>
      </Rise>
      <Rise delay={0.05}>
        <SectionCard title="Results">
          {rows.length === 0 ? (
            <p className="text-sm text-muted">No workspaces match.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">Workspace</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Plan</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Listings</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">OnBuy</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Jobs</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Last activity</th>
                    <th scope="col" className="py-2 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-line/70 last:border-0 hover:bg-mist/50">
                      <td className="max-w-[260px] py-2.5 pr-3">
                        <Link href={`/admin/workspaces/${t.id}`} className="block truncate font-semibold text-ink">
                          {t.name}
                        </Link>
                        <span className="block truncate text-[13px] text-muted">#{t.id} · {t.ownerEmail ?? "no members"}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="flex flex-wrap items-center gap-1.5">
                          {planFor(t.plan).name} {statusBadge(t.planStatus, t.trialEndsAt)}
                          {t.free && <Badge variant="sky" size="sm">Free</Badge>}
                          {t.paused && <Badge variant="danger" size="sm">Paused</Badge>}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatCount(t.listings)}</td>
                      <td className="py-2.5 pr-3">
                        {t.onbuy === null ? <Badge variant="grey" size="sm">None</Badge> : t.onbuy === "connected" ? <Badge variant="mint" size="sm">Connected</Badge> : <Badge variant="danger" size="sm">{t.onbuy}</Badge>}
                        {t.competing && <Badge variant="sky" size="sm" className="ml-1">Competing</Badge>}
                      </td>
                      <td className="py-2.5 pr-3">{t.failing ? <Badge variant="danger" size="sm">{t.failing} failing</Badge> : <span className="text-muted">OK</span>}</td>
                      <td className="py-2.5 pr-3 text-[13px] text-muted">{timeAgo(t.lastActivity)}</td>
                      <td className="py-2.5 text-[13px] text-muted">{timeAgo(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">Page {page} of {pages}</span>
              <span className="flex gap-2">
                {page > 1 && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link({ page: page - 1 })}>Previous</Link>}
                {page < pages && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link({ page: page + 1 })}>Next</Link>}
              </span>
            </div>
          )}
        </SectionCard>
      </Rise>
    </>
  );
}
