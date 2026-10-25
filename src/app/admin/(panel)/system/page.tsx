import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { Badge } from "@/components/ui/badge";
import { failedRuns, jobQueue } from "@/server/admin/repo";
import { configuredApps } from "@/server/connections/amazon";
import { mailConfigured } from "@/server/mail/send";
import { stripeConfigured } from "@/server/billing/stripe";
import { adminEmails } from "@/server/admin/auth";
import { q } from "@/server/db/pool";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "System health" };

const JOB = { reprice: "Reprice (Amazon)", push: "Send to OnBuy", import: "Import", compete: "Competition" } as Record<string, string>;

function Check({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: string }) {
  const Icon = ok ? CheckCircle2 : warn ? CircleDashed : CircleAlert;
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-mist p-3.5">
      <Icon aria-hidden="true" className={ok ? "mt-0.5 size-5 shrink-0 text-sea" : warn ? "mt-0.5 size-5 shrink-0 text-sun-ink" : "mt-0.5 size-5 shrink-0 text-danger"} />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-[13px] text-muted">{detail}</span>
      </span>
    </li>
  );
}

export default async function SystemPage() {
  const apps = configuredApps();
  const [queue, failed, appRows] = await Promise.all([
    jobQueue(),
    failedRuns(15),
    apps.length
      ? q<{ slot: number; status: string; last_error: string | null; last_ok_at: Date | null; next_allowed_at: Date }>(
          "SELECT slot, status, last_error, last_ok_at, next_allowed_at FROM amazon_apps WHERE slot IN (?) ORDER BY slot",
          [apps.map((a) => a.slot)],
        )
      : Promise.resolve([]),
  ]);
  const bySlot = new Map(appRows.map((r) => [r.slot, r]));
  const cron = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 24);

  return (
    <>
      <PageHeader eyebrow="Admin" title="System health" intro="Configuration, the job queue and SellSail's Amazon keys." />

      <Rise>
        <SectionCard title="Configuration" intro="Read from the server's environment. Values are never shown.">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Check ok={Boolean(process.env.APP_ENCRYPTION_KEY)} label="Encryption key" detail="APP_ENCRYPTION_KEY protects stored seller keys." />
            <Check ok={mailConfigured()} label="Email (SMTP)" detail={`Sending as ${process.env.MAIL_FROM || process.env.SMTP_USER || "nobody"}.`} />
            <Check ok={cron} label="Cron secret" detail="Lets the Hostinger cron wake the job runner." />
            <Check ok={apps.length > 0} warn label="Amazon keys" detail={apps.length ? `${apps.length} key set${apps.length === 1 ? "" : "s"} (SPAPI_n_*).` : "Add SPAPI_1_* in hPanel to start repricing."} />
            <Check ok={stripeConfigured()} warn label="Stripe" detail={stripeConfigured() ? "Checkout and webhooks enabled." : "Not set up yet: billing pages say so."} />
            <Check ok label="Admins" detail={adminEmails().join(", ")} />
          </ul>
        </SectionCard>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard title="Job queue">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-muted">
                  <th scope="col" className="py-2 pr-3 font-semibold">Kind</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Enabled</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Running</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Due now</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Failing</th>
                  <th scope="col" className="py-2 font-semibold">Last finished</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((k) => (
                  <tr key={k.kind} className="border-b border-line/70 last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{JOB[k.kind] ?? k.kind}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{k.enabled}/{k.total}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{k.running}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{k.due > 20 ? <Badge variant="sun" size="sm">{k.due}</Badge> : k.due}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{k.failing ? <Badge variant="danger" size="sm">{k.failing}</Badge> : 0}</td>
                    <td className="py-2.5 text-[13px] text-muted">{timeAgo(k.lastFinished)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </Rise>

      <div className="grid gap-6 lg:grid-cols-2">
        <Rise delay={0.08}>
          <SectionCard title="Amazon key sets" intro="Shared by every workspace. A set Amazon refuses sits out and the others carry on.">
            {apps.length === 0 ? (
              <p className="rounded-xl bg-sun-soft p-3 text-sm font-semibold text-sun-ink">No key sets configured.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {apps.map((a) => {
                  const r = bySlot.get(a.slot);
                  return (
                    <li key={a.slot} className="rounded-xl bg-mist p-3">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold">Set {a.slot}</span>
                        <Badge variant={!r || r.status === "untested" ? "grey" : r.status === "ok" ? "mint" : "danger"} size="sm">{r?.status ?? "untested"}</Badge>
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted">Last OK {timeAgo(r?.last_ok_at ?? null)}</span>
                      {r?.last_error && r.status === "error" && <span className="mt-1 block text-[13px] font-semibold text-danger">{r.last_error}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </Rise>
        <Rise delay={0.1}>
          <SectionCard title="Recent failed runs">
            {failed.length === 0 ? (
              <p className="text-sm text-muted">No failed runs.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line text-sm">
                {failed.map((f, i) => (
                  <li key={i} className="py-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/workspaces/${f.tenantId}`} className="font-semibold text-ink">{f.tenant}</Link>
                      <Badge variant="grey" size="sm">{JOB[f.kind] ?? f.kind}</Badge>
                      <span className="text-[12px] text-muted">{timeAgo(f.at)}</span>
                    </span>
                    <span className="mt-0.5 block text-body">{f.msg}</span>
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
