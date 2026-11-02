import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { Badge } from "@/components/ui/badge";
import { adminAuditLog } from "@/server/admin/repo";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage() {
  // The (panel) layout checks too, but layouts can be skipped on client navigation.
  await requireAdmin();
  const rows = await adminAuditLog(200);
  return (
    <>
      <PageHeader eyebrow="Admin" title="Audit log" intro="Every admin sign-in and change, newest first. Kept for a year." />
      <Rise>
        <SectionCard title="Last 200 entries">
          {rows.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">When</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Admin</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Action</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Workspace</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Detail</th>
                    <th scope="col" className="py-2 font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5 pr-3 text-[13px] whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</td>
                      <td className="py-2.5 pr-3">{r.email}</td>
                      <td className="py-2.5 pr-3"><Badge variant={r.action === "admin.signin" ? "grey" : "sky"} size="sm">{r.action}</Badge></td>
                      <td className="py-2.5 pr-3">{r.tenantId ? <Link href={`/admin/workspaces/${r.tenantId}`} className="font-semibold text-ink">{r.tenant ?? `#${r.tenantId}`}</Link> : <span className="text-muted">—</span>}</td>
                      <td className="max-w-[280px] truncate py-2.5 pr-3 text-body" title={r.detail}>{r.detail || "—"}</td>
                      <td className="py-2.5 font-mono text-[12px] text-muted">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </Rise>
    </>
  );
}
