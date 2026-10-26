import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/page-bits";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { EventRow, RunRow } from "@/server/repos/dashboard";
import { cn } from "@/lib/utils";

// The activity feed and run history, in the style of the marketing site's
// "Activity" mock-up: an icon square, then one line of what happened.

const LEVEL = {
  info: { icon: Info, box: "bg-sky text-[#1f5f8b]", label: "Info" },
  warn: { icon: AlertTriangle, box: "bg-sun-soft text-sun-ink", label: "Warning" },
  error: { icon: XCircle, box: "bg-danger-soft text-danger", label: "Error" },
};

export function EventFeed({ events, empty = "Nothing has happened yet." }: { events: EventRow[]; empty?: string }) {
  if (events.length === 0) return <EmptyState icon={<Info className="size-5" />} title={empty} />;
  return (
    <ul className="flex flex-col gap-2">
      {events.map((e) => {
        const l = LEVEL[e.level];
        const Icon = l.icon;
        return (
          <li key={e.id} className="flex items-start gap-3 rounded-xl bg-mist/60 p-3">
            <span className={cn("flex size-8 flex-none items-center justify-center rounded-lg", l.box)}>
              <Icon aria-hidden="true" className="size-4" />
              <span className="sr-only">{l.label}</span>
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block leading-snug break-words">{e.message}</span>
              <time dateTime={new Date(e.createdAt).toISOString()} title={formatDateTime(e.createdAt)} className="text-[12px] text-muted">
                {timeAgo(e.createdAt)}
              </time>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const KIND = { reprice: "Reprice", push: "OnBuy sync", import: "Import", compete: "Competition" } as Record<string, string>;

export function RunHistory({ runs }: { runs: RunRow[] }) {
  if (runs.length === 0) return <EmptyState icon={<CheckCircle2 className="size-5" />} title="No runs yet">Runs appear here once your connections are set up.</EmptyState>;
  return (
    <ul className="flex flex-col">
      {runs.map((r) => {
        const secs = Math.max(0, Math.round((new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime()) / 1000));
        return (
          <li key={r.id} className="flex items-start justify-between gap-3 border-b border-canvas-line py-3 last:border-0">
            <span className="flex min-w-0 items-start gap-3">
              {r.ok ? (
                <CheckCircle2 aria-label="Succeeded" className="mt-0.5 size-4 shrink-0 text-sea" />
              ) : (
                <XCircle aria-label="Failed" className="mt-0.5 size-4 shrink-0 text-danger" />
              )}
              <span className="min-w-0 text-sm">
                <span className="font-semibold">{KIND[r.kind] ?? r.kind}</span>
                <span className="block break-words text-muted">{r.msg}</span>
              </span>
            </span>
            <span className="shrink-0 text-right text-[12px] text-muted">
              <time dateTime={new Date(r.startedAt).toISOString()} title={formatDateTime(r.startedAt)}>
                {timeAgo(r.startedAt)}
              </time>
              <span className="block">{secs}s{r.via === "cron" ? " · cron" : ""}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function StatusBadge({ ok, running, enabled }: { ok: boolean | null; running?: boolean; enabled?: boolean }) {
  if (enabled === false) return <Badge variant="grey" size="sm">Off</Badge>;
  if (running) {
    return (
      <Badge variant="sky" size="sm">
        <span className="size-1.5 animate-pulse-soft rounded-full bg-current" aria-hidden="true" /> Running
      </Badge>
    );
  }
  if (ok === null) return <Badge variant="grey" size="sm">Waiting</Badge>;
  return ok ? <Badge variant="mint" size="sm">OK</Badge> : <Badge variant="danger" size="sm">Failed</Badge>;
}
