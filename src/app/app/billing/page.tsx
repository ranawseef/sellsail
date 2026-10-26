import type { Metadata } from "next";
import Link from "next/link";
import { Check, CreditCard, Download, ExternalLink } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { ProgressBar, Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/server/auth/context";
import { usage } from "@/server/repos/dashboard";
import { checkoutAction, portalAction } from "@/server/actions/app";
import { listInvoices, stripeConfigured } from "@/server/billing/stripe";
import { one } from "@/server/db/pool";
import { PAID_PLANS, PLANS, planFor, formatPence, yearlyPence } from "@/config/plans";
import { daysLeft, formatCount, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

const STATUS: Record<string, { label: string; variant: "mint" | "sun" | "danger" | "grey" }> = {
  trialing: { label: "Free trial", variant: "sun" },
  active: { label: "Active", variant: "mint" },
  past_due: { label: "Payment due", variant: "danger" },
  canceled: { label: "Cancelled", variant: "danger" },
  expired: { label: "Expired", variant: "danger" },
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string; interval?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const yearly = sp.interval === "year";
  const [use, tenant, invoices] = await Promise.all([
    usage(auth.tenantId),
    one<{ stripe_customer_id: string | null; stripe_subscription_id: string | null; comp_until: Date | null }>(
      "SELECT stripe_customer_id, stripe_subscription_id, comp_until FROM tenants WHERE id = ?",
      [auth.tenantId],
    ),
    listInvoices(auth.tenantId),
  ]);
  const plan = planFor(auth.plan);
  const status = STATUS[auth.planStatus] ?? STATUS.expired;
  const subscribed = Boolean(tenant?.stripe_subscription_id) && (auth.planStatus === "active" || auth.planStatus === "past_due");
  const canPay = auth.role !== "member";
  const live = stripeConfigured();

  return (
    <>
      <PageHeader eyebrow="Billing" title="Plan and payments" intro="Prices in pounds, billed monthly by Stripe. Cancel any time from the billing portal." />

      {sp.checkout === "success" && (
        <p role="status" className="rounded-2xl bg-mint p-4 font-semibold text-sea-dark">
          Thank you. Your plan updates here as soon as Stripe confirms the payment, usually within a few seconds.
        </p>
      )}

      <Rise>
        <SectionCard
          title={
            <span className="flex flex-wrap items-center gap-2.5">
              {auth.planStatus === "trialing" ? "Free trial" : plan.name}
              <Badge variant={status.variant} size="sm">
                {auth.planStatus === "trialing" ? `${daysLeft(auth.trialEndsAt)} day${daysLeft(auth.trialEndsAt) === 1 ? "" : "s"} left` : status.label}
              </Badge>
            </span>
          }
          intro={
            auth.planStatus === "trialing"
              ? `Ends ${formatDateTime(auth.trialEndsAt)}. Choose a plan to keep repricing after that.`
              : tenant?.comp_until
                ? `Free of charge until ${formatDateTime(tenant.comp_until)}, courtesy of SellSail. Choose a plan below to keep it after that.`
                : auth.planStatus === "past_due"
                ? "Your last payment failed. Update your card in the billing portal to keep syncing."
                : undefined
          }
          actions={
            canPay &&
            tenant?.stripe_customer_id &&
            live && (
              <ActionButton action={portalAction} pendingLabel="Opening Stripe…">
                <CreditCard aria-hidden="true" className="size-4" /> Manage billing
              </ActionButton>
            )
          }
        >
          <div className="grid gap-5">
            <div>
              <p className="flex justify-between text-sm">
                <span className="font-semibold">Listings</span>
                <span className="text-muted">
                  {formatCount(use.skus)} of {formatCount(plan.maxSkus)}
                </span>
              </p>
              <div className="mt-2">
                <ProgressBar value={use.skus} max={plan.maxSkus} label="Listings used" tone={use.skus >= plan.maxSkus ? "danger" : "sea"} />
              </div>
            </div>
          </div>
        </SectionCard>
      </Rise>

      {!live && (
        <p className="rounded-2xl bg-sun-soft p-4 text-sm font-semibold text-sun-ink">Online payment isn&apos;t switched on yet. Email us to start a paid plan.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Billing period" className="inline-flex rounded-full border border-canvas-line bg-white p-1 text-sm font-semibold">
          <Link href="/app/billing" aria-current={!yearly ? "page" : undefined} className={cn("rounded-full px-4 py-2 no-underline", !yearly ? "bg-ink text-white" : "text-body hover:bg-mint")}>
            Monthly
          </Link>
          <Link href="/app/billing?interval=year" aria-current={yearly ? "page" : undefined} className={cn("rounded-full px-4 py-2 no-underline", yearly ? "bg-ink text-white" : "text-body hover:bg-mint")}>
            Annual <span className={cn("ml-1 rounded-full px-2 py-0.5 text-[11px]", yearly ? "bg-sun text-ink" : "bg-mint text-sea-dark")}>2 months free</span>
          </Link>
        </nav>
      </div>

      <Rise delay={0.05}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Plans">
          {PAID_PLANS.map((id) => {
            const p = PLANS[id];
            const current = subscribed && auth.plan === id;
            const featured = id === "growth";
            return (
              <li key={id} className={cn("flex flex-col rounded-2xl border bg-white p-6", featured ? "border-2 border-sea" : "border-canvas-line")}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-bold">{p.name}</h2>
                  {current ? <Badge variant="mint" size="sm">Your plan</Badge> : featured && <Badge variant="solid" size="sm">Most popular</Badge>}
                </div>
                <p className="mt-3 font-display text-[40px] leading-none font-extrabold tracking-[-0.04em]">
                  {formatPence(yearly ? yearlyPence(p) : p.pricePence)}
                  <span className="ml-1 font-sans text-base font-semibold text-muted">{yearly ? "/year" : "/month"}</span>
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  {yearly ? `${formatPence(Math.round(yearlyPence(p) / 12))}/month, billed yearly + VAT` : "+ VAT, billed monthly"}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
                  {[
                    `Up to ${formatCount(p.maxSkus)} listings`,
                    "Amazon prices included",
                    `OnBuy updates every ${Math.round(p.pushIntervalS / 60)} minutes`,
                    "Fee-aware pricing, brakes and history",
                  ].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sea" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {current ? (
                    <p className="text-sm font-semibold text-muted">Change or cancel in Manage billing.</p>
                  ) : subscribed ? (
                    canPay && live ? (
                      <ActionButton action={portalAction} variant="outline" pendingLabel="Opening Stripe…">
                        Switch in billing portal
                      </ActionButton>
                    ) : null
                  ) : (
                    canPay && (
                      <ActionButton action={checkoutAction} fields={{ plan: id, interval: yearly ? "year" : "month" }} variant={featured ? "sea" : "ink"} pendingLabel="Opening checkout…" disabled={!live}>
                        Choose {p.name}
                      </ActionButton>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Rise>
      {invoices.length > 0 && (
        <Rise delay={0.08}>
          <SectionCard title="Invoices" intro="Every invoice Stripe has sent you. Your VAT number, if you added one, is on each.">
            <ul className="flex flex-col divide-y divide-line">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{inv.number ?? "Invoice"}</span>
                    <span className="block text-[13px] text-muted">{formatDateTime(inv.created)}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: inv.currency.toUpperCase() }).format(inv.total / 100)}
                  </span>
                  <Badge variant={inv.status === "paid" ? "mint" : inv.status === "open" ? "sun" : "grey"} size="sm">
                    {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Due" : inv.status === "void" ? "Void" : "Unpaid"}
                  </Badge>
                  <span className="flex gap-1">
                    {inv.url && (
                      <a href={inv.url} target="_blank" rel="noopener noreferrer" className="inline-flex size-9 items-center justify-center rounded-full text-sea-dark hover:bg-mint" aria-label={`Open ${inv.number ?? "invoice"} on Stripe`}>
                        <ExternalLink aria-hidden="true" className="size-4" />
                      </a>
                    )}
                    {inv.pdf && (
                      <a href={inv.pdf} className="inline-flex size-9 items-center justify-center rounded-full text-sea-dark hover:bg-mint" aria-label={`Download ${inv.number ?? "invoice"} as PDF`}>
                        <Download aria-hidden="true" className="size-4" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </Rise>
      )}

      <p className="text-[13px] text-muted">
        Need several OnBuy accounts? The Agency plan starts at £249 a month: email us.
      </p>
    </>
  );
}
