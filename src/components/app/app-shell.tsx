"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgePoundSterling,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plug,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Swords,
  Workflow,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/server/actions/auth";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/app/products", label: "Products", icon: Package },
    ],
  },
  {
    label: "Repricing",
    items: [
      { href: "/app/pricing", label: "Pricing rules", icon: BadgePoundSterling },
      { href: "/app/competition", label: "Competition", icon: Swords },
      { href: "/app/automation", label: "Automation", icon: Workflow },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/app/connections", label: "Connections", icon: Plug },
      { href: "/app/billing", label: "Billing", icon: CreditCard },
      { href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];
const ALL = GROUPS.flatMap((g) => g.items);

type ShellProps = {
  workspace: string;
  userName: string;
  planLabel: string;
  planTone: "mint" | "sun" | "grey" | "danger";
  onboarded: boolean;
  paused?: boolean;
  banners?: React.ReactNode;
  children: React.ReactNode;
};

const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "S";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function SideNav({ onboarded, onNavigate }: { onboarded: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = onboarded
    ? GROUPS
    : [{ label: "Get started", items: [{ href: "/app/onboarding", label: "Finish setup", icon: Rocket }] }, ...GROUPS];
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 px-3 text-[11px] font-bold tracking-[0.12em] text-white/40 uppercase">{g.label}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold no-underline transition-colors",
                      active ? "bg-white/10 text-white" : "text-[#b9cfc6] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-sun" />}
                    <Icon aria-hidden="true" className={cn("size-[18px] shrink-0", active ? "text-sun" : "text-[#7f9c91] group-hover:text-white")} />
                    {label}
                    {href === "/app/onboarding" && <span className="ml-auto size-2 animate-pulse-soft rounded-full bg-sun" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ workspace, planLabel, onboarded, paused, onNavigate }: Pick<ShellProps, "workspace" | "planLabel" | "onboarded" | "paused"> & { onNavigate?: () => void }) {
  return (
    <>
      <Link href="/app/overview" onClick={onNavigate} className="flex items-center gap-2.5 px-1 font-display text-xl font-extrabold tracking-[-0.03em] text-white no-underline">
        <LogoMark size={30} />
        SellSail
      </Link>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sun font-display text-sm font-extrabold text-ink">
          {initials(workspace)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-white" title={workspace}>
            {workspace}
          </span>
          <span className="block truncate text-[12px] text-[#9fbdb1]">{planLabel}</span>
        </span>
      </div>

      <div className="mt-6">
        <SideNav onboarded={onboarded} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5 text-[13px] font-semibold text-white">
          <span aria-hidden="true" className="relative flex size-2.5">
            {!paused && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sea-mid opacity-60" />}
            <span className={cn("relative inline-flex size-2.5 rounded-full", paused ? "bg-sun" : "bg-sea-mid")} />
          </span>
          {paused ? "Syncing paused" : "Repricer running"}
        </div>
        <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-[#9fbdb1]">
          <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-sun" />
          eBay and AliExpress are coming soon.
        </p>
      </div>
    </>
  );
}

export function AppShell({ workspace, userName, planLabel, planTone, onboarded, paused, banners, children }: ShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = ALL.find((i) => isActive(pathname, i.href))?.label ?? (pathname.startsWith("/app/onboarding") ? "Setup" : "Dashboard");

  return (
    <div className="flex min-h-screen flex-1 bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto overscroll-contain bg-ink px-4 py-5 scrollbar-none lg:flex">
        <SidebarBody workspace={workspace} planLabel={planLabel} onboarded={onboarded} paused={paused} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside id="app-mobile-nav" className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto overscroll-contain bg-ink px-4 py-5 scrollbar-none">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <SidebarBody workspace={workspace} planLabel={planLabel} onboarded={onboarded} paused={paused} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-canvas-line bg-white/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-mist lg:hidden"
              aria-expanded={open}
              aria-controls="app-mobile-nav"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>

            <p className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden truncate text-muted sm:inline">{workspace}</span>
              <ChevronRight aria-hidden="true" className="hidden size-4 shrink-0 text-muted/60 sm:inline" />
              <span className="truncate font-bold text-ink">{current}</span>
            </p>

            <form action="/app/products" role="search" className="ml-auto hidden md:block">
              <label htmlFor="app-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="app-search"
                  name="q"
                  type="search"
                  placeholder="Search SKU, ASIN or title"
                  className="h-10 w-64 rounded-xl border border-canvas-line bg-canvas pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-sea focus:bg-white lg:w-72"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-1.5 md:ml-2">
              <Link href="/app/billing" className="hidden no-underline sm:block">
                <Badge variant={planTone}>{planLabel}</Badge>
              </Link>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get help on WhatsApp"
                title="Help"
                className="inline-flex size-10 items-center justify-center rounded-xl text-body hover:bg-mist hover:text-ink"
              >
                <LifeBuoy aria-hidden="true" className="size-5" />
              </a>
              <details className="relative">
                <summary className="flex cursor-pointer items-center gap-2 rounded-xl py-1 pr-2 pl-1 hover:bg-mist" aria-label="Account menu">
                  <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-sea font-display text-[13px] font-extrabold text-white">
                    {initials(userName)}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-semibold text-ink lg:inline">{userName}</span>
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-60 rounded-2xl border border-canvas-line bg-white p-2 shadow-[0_20px_40px_-20px_rgba(16,35,28,.35)]">
                  <p className="truncate px-3 pt-1.5 pb-2 text-[13px] text-muted">
                    Signed in as <span className="font-semibold text-ink">{userName}</span>
                  </p>
                  <Link href="/app/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink no-underline hover:bg-mist">
                    <Settings aria-hidden="true" className="size-4 text-muted" /> Settings
                  </Link>
                  <Link href="/app/billing" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink no-underline hover:bg-mist">
                    <CreditCard aria-hidden="true" className="size-4 text-muted" /> Billing
                  </Link>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink no-underline hover:bg-mist"
                  >
                    <MessageCircle aria-hidden="true" className="size-4 text-muted" /> Contact support
                  </a>
                  <form action={logoutAction} className="mt-1 border-t border-canvas-line pt-1">
                    <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-danger hover:bg-danger-soft">
                      <LogOut aria-hidden="true" className="size-4" /> Log out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main id="main" className="app-main mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-6 px-4 py-7 sm:px-6 sm:py-8">
          {banners}
          {children}
        </main>

      </div>
    </div>
  );
}

/** A coloured notice across the top of the content. */
export function Banner({ tone, title, children, action }: { tone: "sun" | "danger" | "sky"; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  const box = tone === "danger" ? "border-danger/20 bg-danger-soft text-danger" : tone === "sky" ? "border-[#1f5f8b]/15 bg-sky text-[#1f5f8b]" : "border-sun/50 bg-sun-soft text-sun-ink";
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4", box)}>
      <div className="min-w-0">
        <p className="font-bold">{title}</p>
        {children && <div className="mt-0.5 text-sm">{children}</div>}
      </div>
      {action}
    </div>
  );
}
