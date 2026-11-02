import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { Badge } from "@/components/ui/badge";
import { failedRuns, jobQueue } from "@/server/admin/repo";
import { configuredApps, describeSpapiEnv, type SpapiEnvReport, type SpapiField, type SpapiValueShape } from "@/server/connections/amazon";
import { mailConfigured } from "@/server/mail/send";
import { stripeConfigured } from "@/server/billing/stripe";
import { adminEmails, requireAdmin } from "@/server/admin/auth";
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

const FIELDS: SpapiField[] = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN"];

const bad = (text: string) => <Badge variant="danger" size="sm">{text}</Badge>;
const warn = (text: string) => <Badge variant="sun" size="sm">{text}</Badge>;

/** One row per fact; columns are the three vars of a set. A missing var shows a dash after "Present". */
const KEY_ROWS: { label: string; cell: (v: SpapiValueShape) => React.ReactNode }[] = [
  { label: "Length", cell: (v) => <span className="tabular-nums">{v.length}</span> },
  { label: "Empty after trim", cell: (v) => (v.emptyAfterTrim ? bad("yes") : "no") },
  { label: "Starts with a quote", cell: (v) => (v.startsWithQuote ? warn("yes") : "no") },
  { label: "Ends with a quote", cell: (v) => (v.endsWithQuote ? warn("yes") : "no") },
  { label: "Contains |", cell: (v) => (v.hasPipe ? "yes" : "no") },
  { label: "Whitespace", cell: (v) => (v.whitespace === "inside" ? bad("inside") : v.whitespace === "edges" ? "at the ends" : "no") },
  { label: "Newline", cell: (v) => (v.hasNewline ? bad("yes") : "no") },
  { label: "Odd characters", cell: (v) => (v.oddChars ? bad("yes") : "no") },
  { label: "Expected prefix", cell: (v) => (v.prefixOk ? "yes" : bad("no")) },
];

/** Why SPAPI_n_* may not be picked up: value shapes and env names, never values. */
function SpapiKeyCheck({ report }: { report: SpapiEnvReport }) {
  return (
    <div className="mt-4 flex flex-col gap-4 text-sm">
      <p className="text-[13px] text-muted">
        How each SPAPI_n_* value looks to this server. Values are never shown. Prefixes are checked after trimming and removing one pair of
        matching quotes: CLIENT_ID amzn1.application-oa2-client., CLIENT_SECRET amzn1.oa2-cs., REFRESH_TOKEN Atzr|.
      </p>
      {report.slots.length === 0 ? (
        <p className="rounded-xl bg-sun-soft p-3 font-semibold text-sun-ink">No SPAPI_n_CLIENT_ID, _CLIENT_SECRET or _REFRESH_TOKEN variable reaches this server.</p>
      ) : (
        report.slots.map((s) => (
          <div key={s.slot} className="relative overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <caption className="pb-2 text-left">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Set {s.slot}</span>
                  {s.used ? (
                    <Badge variant="mint" size="sm">used</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      not used: {FIELDS.filter((f) => !s.fields[f].present || s.fields[f].emptyAfterTrim).join(", ") || "a value is empty"}
                    </Badge>
                  )}
                </span>
              </caption>
              <thead>
                <tr className="border-b border-line text-[13px] text-muted">
                  <th scope="col" className="py-2 pr-3 font-semibold">Check</th>
                  {FIELDS.map((f) => (
                    <th key={f} scope="col" className="py-2 pr-3 font-mono text-[12px] font-semibold">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line/70">
                  <th scope="row" className="py-2.5 pr-3 font-semibold">Present</th>
                  {FIELDS.map((f) => (
                    <td key={f} className="py-2.5 pr-3">{s.fields[f].present ? "yes" : bad("no")}</td>
                  ))}
                </tr>
                {KEY_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line/70 last:border-0">
                    <th scope="row" className="py-2.5 pr-3 font-semibold">{row.label}</th>
                    {FIELDS.map((f) => (
                      <td key={f} className="py-2.5 pr-3">{s.fields[f].present ? row.cell(s.fields[f]) : <span className="text-muted">–</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
      <div>
        <p className="font-semibold">Amazon-looking variable names</p>
        <p className="text-[13px] text-muted">Every name containing spapi, sp_api or amazon, in quotes so stray spaces show. Names SellSail does not read are marked.</p>
        {report.names.length === 0 ? (
          <p className="mt-2 rounded-xl bg-sun-soft p-3 font-semibold text-sun-ink">None. No such variable reaches this server.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {report.names.map((n, i) => (
              <li key={`${i}:${n.name}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-mist px-3 py-2">
                <span className="font-mono text-[12px] break-all whitespace-pre-wrap">{JSON.stringify(n.name)}</span>
                {n.hidden && bad("part hidden: looks like a key")}
                {!n.recognised && warn("not read by SellSail")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default async function SystemPage() {
  // The (panel) layout checks too, but layouts can be skipped on client
  // navigation; this page shows env names, so it checks for itself.
  await requireAdmin();
  const apps = configuredApps();
  const keyReport = describeSpapiEnv();
  const keyProblem =
    apps.length === 0 ||
    keyReport.slots.some((s) => !s.used || FIELDS.some((f) => !s.fields[f].prefixOk)) ||
    keyReport.names.some((n) => !n.recognised || n.hidden);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <details open={keyProblem} className="group mt-4">
              <summary className="font-semibold text-sea-dark">Key check</summary>
              <SpapiKeyCheck report={keyReport} />
            </details>
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
