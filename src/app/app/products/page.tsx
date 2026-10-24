import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ChevronLeft, ChevronRight, PackageOpen, Search, Send } from "lucide-react";
import { EmptyState, PageHeader, SectionCard } from "@/components/app/page-bits";
import { ActionButton } from "@/components/app/action-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAuth } from "@/server/auth/context";
import { listArchived, listProducts, PAGE_SIZE, PRODUCT_FILTERS, type ProductFilter, type ProductRow } from "@/server/repos/dashboard";
import { requestFullPushAction } from "@/server/actions/app";
import { formatCount, formatDateTime, formatGBP, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const FILTER_LABELS: Record<ProductFilter | "archived", string> = {
  all: "All",
  "in-stock": "In stock",
  "out-of-stock": "Out of stock",
  pending: "Waiting to send",
  errors: "Errors",
  unpriced: "Not priced",
  archived: "Archived",
};

function status(p: ProductRow): { label: string; variant: "mint" | "sun" | "danger" | "grey" | "sky" } {
  if (p.error) return { label: "Error", variant: "danger" };
  if (p.price === null) return { label: "Not priced", variant: "grey" };
  if (p.needsPush) return { label: "Waiting to send", variant: "sun" };
  if ((p.stock ?? 0) === 0) return { label: "Out of stock", variant: "grey" };
  return { label: "In sync", variant: "mint" };
}

function href(params: { q?: string; filter?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.filter && params.filter !== "all") sp.set("filter", params.filter);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const s = sp.toString();
  return `/app/products${s ? `?${s}` : ""}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; page?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 64) : "";
  const filter = (PRODUCT_FILTERS as readonly string[]).includes(sp.filter ?? "") || sp.filter === "archived" ? (sp.filter as ProductFilter | "archived") : "all";
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1));

  const archivedView = filter === "archived";
  const [{ rows, total }, archived] = await Promise.all([
    archivedView ? Promise.resolve({ rows: [], total: 0 }) : listProducts(auth.tenantId, { search: q, filter: filter as ProductFilter, page }),
    archivedView ? listArchived(auth.tenantId) : Promise.resolve([]),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        intro="Every OnBuy listing SellSail manages, with the Amazon price it was worked out from."
        actions={
          auth.role !== "member" && (
            <>
              <Link href="/app/onboarding?step=import" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <PackageOpen aria-hidden="true" className="size-4" /> Import
              </Link>
              <ActionButton action={requestFullPushAction} pendingLabel="Queuing…" confirm="Send every priced listing to OnBuy again? This uses some of your OnBuy update allowance.">
                <Send aria-hidden="true" className="size-4" /> Send all again
              </ActionButton>
            </>
          )
        }
      />

      <SectionCard
        title={archivedView ? "Archived SKUs" : `${formatCount(total)} listing${total === 1 ? "" : "s"}`}
        intro={archivedView ? "OnBuy said these SKUs don't exist, so SellSail stopped sending them. Re-import with “also bring back archived SKUs” if you relist them." : undefined}
      >
        <div className="flex flex-col gap-4">
          {!archivedView && (
            <form role="search" action="/app/products" className="flex flex-wrap gap-2.5">
              {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
              <label htmlFor="product-search" className="sr-only">
                Search by SKU, ASIN or title
              </label>
              <Input id="product-search" name="q" defaultValue={q} placeholder="Search SKU, ASIN or title" className="min-h-11 max-w-sm flex-1" />
              <Button type="submit" variant="ink" size="sm">
                <Search aria-hidden="true" className="size-4" /> Search
              </Button>
            </form>
          )}

          <nav aria-label="Filter products" className="-mx-1 overflow-x-auto">
            <ul className="flex gap-1 px-1">
              {(["all", "in-stock", "out-of-stock", "pending", "errors", "unpriced", "archived"] as const).map((f) => (
                <li key={f}>
                  <Link
                    href={href({ q: f === "archived" ? undefined : q, filter: f })}
                    aria-current={filter === f ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap no-underline transition-colors",
                      filter === f ? "bg-ink text-white" : "text-ink hover:bg-mint",
                    )}
                  >
                    {f === "archived" && <Archive aria-hidden="true" className="size-3.5" />}
                    {FILTER_LABELS[f]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {archivedView ? (
            archived.length === 0 ? (
              <EmptyState icon={<Archive className="size-5" />} title="Nothing archived" />
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-[13px] text-muted">
                      <th scope="col" className="py-2 pr-3 font-semibold">SKU</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">OnBuy said</th>
                      <th scope="col" className="py-2 font-semibold">Archived</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archived.map((a) => (
                      <tr key={a.sku} className="border-b border-line last:border-0">
                        <td className="py-3 pr-3 font-mono text-[13px]">{a.sku}</td>
                        <td className="py-3 pr-3 text-body">{a.reason}</td>
                        <td className="py-3 text-muted">{formatDateTime(a.archived_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : rows.length === 0 ? (
            <EmptyState icon={<PackageOpen className="size-5" />} title={q || filter !== "all" ? "No listings match" : "No listings yet"}>
              {q || filter !== "all" ? (
                <Link href="/app/products" className="font-semibold text-sea-dark underline underline-offset-4">
                  Clear the search
                </Link>
              ) : (
                <>
                  Import your OnBuy listings or upload a CSV.{" "}
                  <Link href="/app/onboarding?step=import" className="font-semibold text-sea-dark underline underline-offset-4">
                    Import listings
                  </Link>
                </>
              )}
            </EmptyState>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <caption className="sr-only">Listings, page {page} of {pages}</caption>
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">Product</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Amazon</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">OnBuy price</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Stock</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                    <th scope="col" className="py-2 font-semibold">Priced</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const st = status(p);
                    const changed = p.needsPush && p.pushedPrice !== null && p.price !== null && p.pushedPrice !== p.price;
                    return (
                      <tr key={p.id} className="border-b border-line align-top last:border-0">
                        <td className="max-w-[320px] py-3 pr-3">
                          <span className="line-clamp-1 font-semibold">{p.title || p.sku}</span>
                          <span className="block font-mono text-[12px] text-muted">
                            {p.sku}
                            {p.asin !== p.sku && ` · ${p.asin}`}
                          </span>
                          {p.error && <span className="mt-1 block text-[12px] font-semibold text-danger">{p.error}</span>}
                          {p.note && <span className="mt-1 block text-[12px] text-muted">{p.note}</span>}
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums">{formatGBP(p.sourcePrice)}</td>
                        <td className="py-3 pr-3 text-right tabular-nums">
                          <span className="font-bold">{formatGBP(p.price)}</span>
                          {changed && <span className="block text-[12px] text-muted">OnBuy has {formatGBP(p.pushedPrice)}</span>}
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums">{p.stock ?? "—"}</td>
                        <td className="py-3 pr-3">
                          <Badge variant={st.variant} size="sm">
                            {st.label}
                          </Badge>
                        </td>
                        <td className="py-3 whitespace-nowrap text-muted">
                          <time title={formatDateTime(p.pricedAt)}>{timeAgo(p.pricedAt)}</time>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!archivedView && pages > 1 && (
            <nav aria-label="Pages" className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">
                Page {page} of {formatCount(pages)}
              </span>
              <span className="flex gap-2">
                {page > 1 && (
                  <Link href={href({ q, filter, page: page - 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <ChevronLeft aria-hidden="true" className="size-4" /> Previous
                  </Link>
                )}
                {page < pages && (
                  <Link href={href({ q, filter, page: page + 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Next <ChevronRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
              </span>
            </nav>
          )}
        </div>
      </SectionCard>
    </>
  );
}
