import type { Metadata } from "next";
import { LogOut, Monitor } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { ActionButton } from "@/components/app/action-button";
import { PasswordForm, WorkspaceForm } from "@/components/app/settings-forms";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/server/auth/context";
import { listUserSessions } from "@/server/auth/sessions";
import { logoutOtherSessionsAction } from "@/server/actions/app";
import { timeAgo } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Settings" };

// A short, readable name for a browser's user agent string.
function browserName(ua: string): string {
  const b = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "Mac" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${b} on ${os}` : b;
}

export default async function SettingsPage() {
  const auth = await requireAuth();
  const sessions = await listUserSessions(auth.userId);

  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace and account" />

      <Rise>
        <SectionCard title="Workspace" intro="Shown in the dashboard and on invoices.">
          {auth.role !== "member" ? <WorkspaceForm name={auth.tenantName} /> : <p className="font-semibold">{auth.tenantName}</p>}
        </SectionCard>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard title="Your account">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Name", auth.name],
              ["Email", auth.email],
              ["Role", <Badge key="r" variant="mint" size="sm">{auth.role.charAt(0).toUpperCase() + auth.role.slice(1)}</Badge>],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl bg-mist p-3">
                <dt className="text-[13px] text-muted">{k}</dt>
                <dd className="mt-0.5 truncate font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-muted">To change your email, write to {site.email}.</p>
        </SectionCard>
      </Rise>

      <Rise delay={0.1}>
        <SectionCard title="Password" intro="Changing it logs you out everywhere else.">
          <PasswordForm />
        </SectionCard>
      </Rise>

      <Rise delay={0.15}>
        <SectionCard
          title="Where you're logged in"
          actions={
            sessions.length > 1 && (
              <ActionButton action={logoutOtherSessionsAction} pendingLabel="Logging out…">
                <LogOut aria-hidden="true" className="size-4" /> Log out other browsers
              </ActionButton>
            )
          }
        >
          <ul className="flex flex-col">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
                <span className="flex items-center gap-3">
                  <Monitor aria-hidden="true" className="size-4 text-muted" />
                  <span className="text-sm">
                    <span className="font-semibold">{browserName(s.user_agent)}</span>
                    <span className="block text-muted">{s.ip || "unknown IP"}</span>
                  </span>
                </span>
                <span className="text-right text-[13px] text-muted">
                  {s.id === auth.sessionId ? <Badge variant="mint" size="sm">This browser</Badge> : `active ${timeAgo(s.last_seen_at)}`}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </Rise>

      {auth.role === "owner" && (
        <Rise delay={0.2}>
          <SectionCard
            title="Close your workspace"
            intro="To close this workspace and delete its data, email hello@sellsail.io from your account address. Cancel any paid plan in Billing first."
          />
        </Rise>
      )}
    </>
  );
}
