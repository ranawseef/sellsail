import type { Metadata } from "next";
import { Globe, KeyRound, Sparkles, Store } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { OnBuyForm, ProxyForm } from "@/components/app/connection-forms";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/server/auth/context";
import { loadProxy } from "@/server/connections/proxy";
import { getOnBuyAccount } from "@/server/connections/onbuy";
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
  const [proxy, onbuy] = await Promise.all([loadProxy(auth.tenantId), getOnBuyAccount(auth.tenantId)]);
  const canEdit = auth.role !== "member";
  const proxyOk = proxy?.status === "ok";
  const proxyBlocking = Boolean(proxy) && !proxyOk;

  return (
    <>
      <PageHeader
        eyebrow="Connections"
        title="OnBuy"
        intro="Your OnBuy keys are stored encrypted and never shown in your dashboard again. SellSail support can view them to help you, and every view is logged."
      />

      <Rise>
        <SectionCard
          id="onbuy"
          title={
            <span className="flex items-center gap-2.5">
              <Store aria-hidden="true" className="size-5 text-sea" /> OnBuy
            </span>
          }
          intro="Marketplace. SellSail sends your new prices and stock to OnBuy in fast batches."
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

      <Rise delay={0.1}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Coming soon">
          {[
            { name: "AliExpress", role: "Source", text: "Source products from AliExpress and reprice them with the same bands and brakes." },
            { name: "eBay", role: "Marketplace", text: "List and reprice on eBay alongside OnBuy, from one catalogue." },
          ].map((c) => (
            <li key={c.name} className="rounded-2xl border-2 border-dashed border-canvas-line bg-white/60 p-6">
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
