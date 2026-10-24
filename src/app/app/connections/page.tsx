import type { Metadata } from "next";
import { Globe, KeyRound, ShoppingCart, Sparkles, Store, Trash2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { AmazonForms, OnBuyForm, ProxyForm } from "@/components/app/connection-forms";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/server/auth/context";
import { loadProxy } from "@/server/connections/proxy";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { appClient, listAmazonAccounts } from "@/server/connections/amazon";
import { disconnectOnBuyAction, removeAmazonAction, testProxyAction } from "@/server/actions/app";
import { planFor } from "@/config/plans";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Connections" };

function Facts({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-mist p-3">
          <dt className="text-[13px] text-muted">{k}</dt>
          <dd className="mt-0.5 truncate font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const AMAZON_RESULT: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Amazon account connected." },
  cancelled: { ok: false, text: "Amazon approval was cancelled." },
  failed: { ok: false, text: "Connecting Amazon didn't work. The reason is in the activity feed on the Overview page." },
};

export default async function ConnectionsPage({ searchParams }: { searchParams: Promise<{ amazon?: string }> }) {
  const auth = await requireAuth();
  const sp = await searchParams;
  const [proxy, onbuy, amazon] = await Promise.all([loadProxy(auth.tenantId), getOnBuyAccount(auth.tenantId), listAmazonAccounts(auth.tenantId)]);
  const canEdit = auth.role !== "member";
  const proxyOk = proxy?.status === "ok";
  const plan = planFor(auth.plan);
  const result = sp.amazon ? AMAZON_RESULT[sp.amazon] : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Connections"
        title="Proxy, OnBuy and Amazon"
        intro="Keys and tokens are stored encrypted and only ever used through your proxy. We never show them again after you save them."
      />

      <Rise>
        <SectionCard
          id="proxy"
          title={
            <span className="flex items-center gap-2.5">
              <Globe aria-hidden="true" className="size-5 text-sea" /> Proxy
            </span>
          }
          intro="Every OnBuy and Amazon request leaves through this proxy. If it stops working, nothing is sent until it works again."
          actions={
            <>
              <Badge variant={!proxy ? "grey" : proxyOk ? "mint" : proxy.status === "failing" ? "danger" : "sun"}>
                {!proxy ? "Not set up" : proxyOk ? "Working" : proxy.status === "failing" ? "Failing" : "Not tested"}
              </Badge>
              {proxy && (
                <ActionButton action={testProxyAction} pendingLabel="Testing…">
                  Test again
                </ActionButton>
              )}
            </>
          }
        >
          {proxy && (
            <div className="mb-6">
              <Facts
                items={[
                  ["Proxy", proxy.hostHint || "—"],
                  ["Exit IP", proxy.egressIp ?? "—"],
                  ["Last checked", <time key="t" title={formatDateTime(proxy.lastCheckedAt)}>{timeAgo(proxy.lastCheckedAt)}</time>],
                  ["Failures in a row", proxy.failStreak],
                ]}
              />
              {proxy.lastError && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{proxy.lastError}</p>}
            </div>
          )}
          {canEdit && (
            <details open={!proxy} className="group">
              <summary className="font-semibold text-sea-dark">{proxy ? "Change proxy" : "Set up the proxy"}</summary>
              <div className="mt-4">
                <ProxyForm hostHint={proxy?.hostHint} savedType={proxy?.config?.type} savedPort={proxy?.config?.port} />
              </div>
            </details>
          )}
        </SectionCard>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard
          id="onbuy"
          title={
            <span className="flex items-center gap-2.5">
              <Store aria-hidden="true" className="size-5 text-sea" /> OnBuy
            </span>
          }
          intro="Marketplace. Prices and stock are sent with PUT /listings/by-sku, up to 1,000 per request."
          actions={
            <>
              <Badge variant={!onbuy ? "grey" : onbuy.status === "connected" ? "mint" : "danger"}>
                {!onbuy ? "Not connected" : onbuy.status === "connected" ? "Connected" : "Needs attention"}
              </Badge>
              {onbuy && canEdit && (
                <ActionButton action={disconnectOnBuyAction} variant="ghost" pendingLabel="Disconnecting…" confirm="Disconnect OnBuy and delete its keys? Repricing will stop sending updates.">
                  Disconnect
                </ActionButton>
              )}
            </>
          }
        >
          {onbuy && (
            <div className="mb-6">
              <Facts
                items={[
                  ["Consumer key", onbuy.keyHint],
                  ["Site", "OnBuy UK (2000)"],
                  ["Last success", timeAgo(onbuy.lastOkAt)],
                  ["Status", onbuy.status === "connected" ? "OK" : "Error"],
                ]}
              />
              {onbuy.lastError && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{onbuy.lastError}</p>}
            </div>
          )}
          {canEdit &&
            (proxyOk ? (
              <details open={!onbuy} className="group">
                <summary className="font-semibold text-sea-dark">{onbuy ? "Replace keys" : "Connect OnBuy"}</summary>
                <div className="mt-4">
                  <OnBuyForm keyHint={onbuy?.keyHint} />
                </div>
              </details>
            ) : (
              <p className="rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">Set up a working proxy first.</p>
            ))}
        </SectionCard>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard
          id="amazon"
          title={
            <span className="flex items-center gap-2.5">
              <ShoppingCart aria-hidden="true" className="size-5 text-sea" /> Amazon
            </span>
          }
          intro={`Source. Each account is a shard with its own rate limit; your ${plan.name} plan allows ${plan.maxAmazonAccounts}.`}
          actions={<Badge variant={amazon.length ? "mint" : "grey"}>{amazon.length} of {plan.maxAmazonAccounts}</Badge>}
        >
          {result && (
            <p role={result.ok ? "status" : "alert"} className={cn("mb-5 rounded-xl p-3 text-sm font-semibold", result.ok ? "bg-mint text-sea-dark" : "bg-danger-soft text-danger")}>
              {result.text}
            </p>
          )}
          {amazon.length > 0 && (
            <ul className="mb-6 flex flex-col gap-2">
              {amazon.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-bold">
                      {a.label}
                      <Badge variant={a.status === "connected" ? "mint" : "danger"} size="sm">
                        {a.status === "connected" ? "Connected" : "Needs attention"}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {a.mode === "oauth" ? "Seller Central approval" : "Own app"} · {a.keyHint} · last success {timeAgo(a.lastOkAt)}
                    </p>
                    {a.lastError && <p className="mt-1 text-[13px] font-semibold text-danger">{a.lastError}</p>}
                  </div>
                  {canEdit && (
                    <ActionButton
                      action={removeAmazonAction}
                      fields={{ accountId: String(a.id) }}
                      variant="ghost"
                      pendingLabel="Removing…"
                      confirm={`Remove “${a.label}” and delete its keys? Its products move to your other Amazon accounts.`}
                    >
                      <Trash2 aria-hidden="true" className="size-4" /> Remove
                    </ActionButton>
                  )}
                </li>
              ))}
            </ul>
          )}
          {canEdit &&
            (proxyOk ? (
              amazon.length < plan.maxAmazonAccounts ? (
                <details open={amazon.length === 0} className="group">
                  <summary className="font-semibold text-sea-dark">{amazon.length ? "Add another Amazon account" : "Connect Amazon"}</summary>
                  <div className="mt-4">
                    <AmazonForms oauthAvailable={Boolean(appClient())} />
                  </div>
                </details>
              ) : (
                <p className="text-sm text-muted">You&apos;re using every Amazon account your plan allows. Upgrade in Billing to add more.</p>
              )
            ) : (
              <p className="rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">Set up a working proxy first.</p>
            ))}
        </SectionCard>
      </Rise>

      <Rise delay={0.15}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Coming soon">
          {[
            { name: "AliExpress", role: "Source", text: "Source products from AliExpress and reprice them with the same bands and brakes." },
            { name: "eBay", role: "Marketplace", text: "List and reprice on eBay alongside OnBuy, from one catalogue." },
          ].map((c) => (
            <li key={c.name} className="rounded-3xl border-2 border-dashed border-line bg-white/60 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 font-display text-xl font-bold">
                  <KeyRound aria-hidden="true" className="size-5 text-muted" /> {c.name}
                </p>
                <Badge variant="solid">
                  <Sparkles aria-hidden="true" className="size-3.5" /> Coming soon
                </Badge>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-muted">{c.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-body">{c.text}</p>
            </li>
          ))}
        </ul>
      </Rise>
    </>
  );
}
