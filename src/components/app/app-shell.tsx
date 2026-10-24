"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BadgePoundSterling, CreditCard, LayoutDashboard, LogOut, Menu, Package, Plug, Rocket, Settings, Workflow, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/app/products", label: "Products", icon: Package },
  { href: "/app/pricing", label: "Pricing", icon: BadgePoundSterling },
  { href: "/app/automation", label: "Automation", icon: Workflow },
  { href: "/app/connections", label: "Connections", icon: Plug },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

type ShellProps = {
  workspace: string;
  userName: string;
  planLabel: string;
  planTone: "mint" | "sun" | "grey" | "danger";
  onboarded: boolean;
  banners?: React.ReactNode;
  children: React.ReactNode;
};

function SideNav({ onboarded, onNavigate }: { onboarded: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = onboarded ? NAV : [{ href: "/app/onboarding", label: "Finish setup", icon: Rocket }, ...NAV];
  return (
    <nav aria-label="Dashboard">
      <ul className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold no-underline transition-colors",
                  active ? "bg-[#13261e] text-white" : "text-[#c9ddd5] hover:bg-[#13261e] hover:text-white",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-[18px] shrink-0", active && "text-sun")} />
                {label}
                {href === "/app/onboarding" && <span className="ml-auto size-2 animate-pulse-soft rounded-full bg-sun" aria-hidden="true" />}
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
    <Link href="/app/overview" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-[-0.03em] text-white no-underline">
      <LogoMark size={28} />
      SellSail
    </Link>
  );
}

function SoonList() {
  return (
    <div className="mt-8 rounded-2xl border border-[#2a4038] p-3.5 text-[13px] text-[#9fbdb1]">
      <p className="font-bold text-white">Coming soon</p>
      <p className="mt-1">eBay as a marketplace and AliExpress as a source.</p>
    </div>
  );
}

export function AppShell({ workspace, userName, planLabel, planTone, onboarded, banners, children }: ShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-1 bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto bg-ink px-4 py-5 lg:flex">
        <Brand />
        <p className="mt-1 mb-6 truncate pl-[38px] text-[13px] text-[#9fbdb1]" title={workspace}>
          {workspace}
        </p>
        <SideNav onboarded={onboarded} />
        <SoonList />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside id="app-mobile-nav" className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-ink px-4 py-5">
            <div className="flex items-center justify-between">
              <Brand />
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-[#13261e]">
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 mb-6 truncate pl-[38px] text-[13px] text-[#9fbdb1]">{workspace}</p>
            <SideNav onboarded={onboarded} onNavigate={() => setOpen(false)} />
            <SoonList />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-mint lg:hidden"
              aria-expanded={open}
              aria-controls="app-mobile-nav"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <span className="truncate font-semibold lg:hidden">{workspace}</span>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/app/billing" className="no-underline">
                <Badge variant={planTone}>{planLabel}</Badge>
              </Link>
              <span className="hidden text-sm font-semibold text-body sm:inline">{userName}</span>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" className="px-3">
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Log out</span>
                  <span className="sr-only sm:hidden">Log out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
          {banners}
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1200px] border-t border-line px-4 py-6 text-[13px] leading-relaxed text-muted sm:px-6">
          <p>{site.disclaimer}</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {site.name} ·{" "}
            <Link href="/terms" className="text-muted underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="text-muted underline-offset-4 hover:underline">
              Privacy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

/** A coloured notice across the top of the content. */
export function Banner({ tone, title, children, action }: { tone: "sun" | "danger" | "sky"; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  const box = tone === "danger" ? "bg-danger-soft text-danger" : tone === "sky" ? "bg-sky text-[#1f5f8b]" : "bg-sun-soft text-sun-ink";
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4", box)}>
      <div className="min-w-0">
        <p className="font-bold">{title}</p>
        {children && <div className="mt-0.5 text-sm">{children}</div>}
      </div>
      {action}
    </div>
  );
}
