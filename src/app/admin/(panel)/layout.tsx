import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppProviders } from "@/components/app/motion";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: { template: "%s · SellSail admin", default: "Admin · SellSail" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const until = new Date(admin.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
  return (
    <AppProviders>
      <AdminShell email={admin.email} expiresAt={until}>
        {children}
      </AdminShell>
    </AppProviders>
  );
}
