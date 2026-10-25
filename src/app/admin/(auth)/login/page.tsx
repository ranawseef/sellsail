import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { AdminLoginForm } from "@/components/admin/admin-forms";
import { getAdmin } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Admin sign-in · SellSail", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-sea/30 blur-[120px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
      <header className="relative mx-auto w-full max-w-[1200px] px-6 py-5 [&_a]:text-white">
        <Logo />
      </header>
      <main id="main" className="relative flex flex-1 items-start justify-center px-4 pt-10 pb-16 sm:pt-20">
        <div className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-sun" aria-hidden="true">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-[28px] leading-tight font-extrabold tracking-[-0.03em]">SellSail admin</h1>
          <p className="mt-1.5 mb-6 text-sm leading-relaxed text-body">Staff only. We email a one-time code to the admin inbox; there is no password.</p>
          <AdminLoginForm />
          <a href="/admin/login" className="mt-5 block text-center text-sm font-semibold text-sea-dark underline underline-offset-4">
            Start again
          </a>
        </div>
      </main>
    </div>
  );
}
