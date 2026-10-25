"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Activity, Building2, LayoutDashboard, LogOut, Menu, ScrollText, ShieldCheck, Users, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/server/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/system", label: "System health", icon: Activity },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="relative">
              {active && (
                <motion.span
                  layoutId={reduce ? undefined : "admin-nav"}
                  className="absolute inset-0 rounded-xl bg-[#13261e]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  aria-hidden="true"
                />
              )}
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold no-underline transition-colors",
                  active ? "text-white" : "text-[#c9ddd5] hover:bg-[#13261e]/60 hover:text-white",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-[18px] shrink-0", active && "text-sun")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-[-0.03em] text-white no-underline">
      <LogoMark size={28} />
      SellSail
      <span className="rounded-md bg-sun px-1.5 py-0.5 font-sans text-[11px] font-extrabold tracking-wide text-ink uppercase">Admin</span>
    </Link>
  );
}

function Who({ email, expiresAt }: { email: string; expiresAt: string }) {
  return (
    <div className="mt-auto pt-8">
      <div className="rounded-2xl border border-[#2a4038] p-3.5 text-[13px] text-[#9fbdb1]">
        <p className="flex items-center gap-1.5 font-bold text-white">
          <ShieldCheck aria-hidden="true" className="size-4 text-sun" /> Signed in
        </p>
        <p className="mt-1 truncate" title={email}>
          {email}
        </p>
        <p className="mt-0.5">Until {expiresAt}</p>
      </div>
    </div>
  );
}

export function AdminShell({ email, expiresAt, children }: { email: string; expiresAt: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-1 bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto overscroll-contain bg-ink px-4 py-5 scrollbar-none lg:flex">
        <Brand />
        <p className="mt-1 mb-6 pl-[38px] text-[13px] text-[#9fbdb1]">Platform control</p>
        <Nav />
        <Who email={email} expiresAt={expiresAt} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside id="admin-mobile-nav" className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto overscroll-contain bg-ink px-4 py-5 scrollbar-none">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-[#13261e]">
                <X aria-hidden="true" />
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
            <Who email={email} expiresAt={expiresAt} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mint lg:hidden"
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <span className="font-semibold lg:hidden">Admin</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm font-semibold text-body sm:inline">{email}</span>
              <form action={adminLogoutAction}>
                <Button type="submit" variant="ghost" size="sm" className="px-3">
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sr-only sm:hidden">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
