import type { Metadata } from "next";
import { Globe, KeyRound, ShoppingCart, Sparkles, Store } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { OnBuyForm, ProxyForm } from "@/components/app/connection-forms";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/server/auth/context";
import { loadProxy } from "@/server/connections/proxy";
import { getOnBuyAccount } from "@/server/connections/onbuy";
import { amazonPoolStatus } from "@/server/connections/amazon";
import { disconnectOnBuyAction, removeProxyAction, testProxyAction } from "@/server/actions/app";
import { formatDateTime, timeAgo } from "@/lib/format";

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

export default async function ConnectionsPage() {
  const auth = await requireAuth();
  const [proxy, onbuy, pool] = await Promise.all([loadProxy(auth.tenantId), getOnBuyAccount(auth.tenantId), amazonPoolStatus()]);
  const canEdit = auth.role !== "member";
  const proxyOk = proxy?.status === "ok";
  const proxyBlocking = Boolean(proxy) && !proxyOk;
  const amazonState = pool.configured === 0 ? "off" : pool.healthy === 0 ? "trouble" : "ok";

  return (
    <>
      <PageHeader
        eyebrow="Connections"
        title="OnBuy and Amazon"
        intro="Your OnBuy keys are stored encrypted and never shown again after you save them. Amazon prices come from SellSail's own connection."
      />

      <Rise>
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
                  ["Sent via", proxy ? "Your proxy" : "SellSail (direct)"],
                ]}
              />
              {onbuy.lastError && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{onbuy.lastError}</p>}
            </div>
          )}
          {canEdit &&
            (proxyBlocking ? (
              <p className="rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">
                Your proxy isn&apos;t working, so OnBuy can&apos;t be reached. Fix it or remove it below.
              </p>
            ) : (
              <details open={!onbuy} className="group">
                <summary className="font-semibold text-sea-dark">{onbuy ? "Replace keys" : "Connect OnBuy"}</summary>
                <div className="mt-4">
                  <OnBuyForm keyHint={onbuy?.keyHint} />
                </div>
              </details>
            ))}
        </SectionCard>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard
          id="amazon"
          title={
            <span className="flex items-center gap-2.5">
              <ShoppingCart aria-hidden="true" className="size-5 text-sea" /> Amazon
            </span>
          }
          intro="Source. SellSail reads Amazon UK offers for your ASINs with its own Amazon connection, shared fairly between sellers. You don't need Amazon API keys."
          actions={
            <Badge variant={amazonState === "ok" ? "mint" : amazonState === "trouble" ? "danger" : "sun"}>
              {amazonState === "ok" ? "Provided by SellSail" : amazonState === "trouble" ? "Delayed" : "Starting soon"}
            </Badge>
          }
        >
          <p className="rounded-xl bg-mist p-4 text-sm text-body">
            {amazonState === "ok" ? (
              <>Amazon prices are being read{pool.lastOkAt ? <>, last at {formatDateTime(pool.lastOkAt)}</> : null}. Nothing to set up here.</>
            ) : amazonState === "trouble" ? (
              "Amazon isn't answering SellSail right now. We're on it; your listings keep their last prices, and anything without a fresh price for 24 hours is set out of stock."
            ) : (
              "Amazon price reading is being switched on. Your listings will start repricing as soon as it is, with nothing for you to do."
            )}
          </p>
        </SectionCard>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard
          id="proxy"
          title={
            <span className="flex items-center gap-2.5">
              <Globe aria-hidden="true" className="size-5 text-sea" /> Your own proxy
              <Badge variant="grey" size="sm">Optional</Badge>
            </span>
          }
          intro="By default OnBuy requests go straight from SellSail. Add a static-IP proxy if you want OnBuy to see your own fixed address, for example when you run several OnBuy accounts. Once saved, it's never bypassed: if it stops working, syncing pauses until it's fixed or removed."
          actions={
            <>
              <Badge variant={!proxy ? "grey" : proxyOk ? "mint" : proxy.status === "failing" ? "danger" : "sun"}>
                {!proxy ? "Not used" : proxyOk ? "Working" : proxy.status === "failing" ? "Failing" : "Not tested"}
              </Badge>
              {proxy && (
                <ActionButton action={testProxyAction} pendingLabel="Testing…">
                  Test again
                </ActionButton>
              )}
              {proxy && canEdit && (
                <ActionButton action={removeProxyAction} variant="ghost" pendingLabel="Removing…" confirm="Remove the proxy? OnBuy requests will go direct from SellSail.">
                  Remove
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
            <details open={proxyBlocking} className="group">
              <summary className="font-semibold text-sea-dark">{proxy ? "Change proxy" : "Add a proxy"}</summary>
              <div className="mt-4">
                <ProxyForm hostHint={proxy?.hostHint} savedType={proxy?.config?.type} savedPort={proxy?.config?.port} />
              </div>
            </details>
          )}
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
