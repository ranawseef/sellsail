import Link from "next/link";
import { ArrowRight, Building2, Lock, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/config/plans";
import { footerNav, portal, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const TRUST = [
  { icon: Building2, label: "UK registered company" },
  { icon: Lock, label: "Payments secured by Stripe" },
  { icon: ShieldCheck, label: "API keys encrypted at rest" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-[#b9cfc6]">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-sea via-sun to-sea" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full bg-sea/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-6">
        {/* Top: pitch and the two ways to start */}
        <div className="flex flex-col gap-8 border-b border-white/10 py-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-white no-underline">
              <LogoMark /> SellSail
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed">
              The Amazon to OnBuy repricer for UK sellers. Fee-aware prices, competition that respects your floor, and
              stock kept in sync around the clock.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={portal("/signup")} className={cn(buttonVariants({ variant: "sun" }), "justify-center")}>
              Start {TRIAL_DAYS}-day free trial <ArrowRight aria-hidden="true" className="size-4" />
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 font-semibold text-white no-underline transition-colors hover:bg-white/10"
            >
              <MessageCircle aria-hidden="true" className="size-4" /> Book a demo
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">Get in touch</h2>
            <ul className="mt-4 flex flex-col gap-3 text-[15px]">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 text-[#b9cfc6] no-underline hover:text-white">
                  <Mail aria-hidden="true" className="size-4 text-sun" /> {site.email}
                </a>
              </li>
              <li>
                <a href={site.phoneHref} className="inline-flex items-center gap-2.5 text-[#b9cfc6] no-underline hover:text-white">
                  <Phone aria-hidden="true" className="size-4 text-sun" /> {site.phone}
                </a>
              </li>
              <li className="flex gap-2.5 text-sm leading-relaxed">
                <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sun" />
                <span>
                  {site.addressParts.street}
                  <br />
                  {site.addressParts.city} {site.addressParts.postcode}
                </span>
              </li>
            </ul>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">{group.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#b9cfc6] no-underline transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust row */}
        <ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 py-6 text-sm">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2 font-semibold text-white/90">
              <Icon aria-hidden="true" className="size-4 text-sea-mid" /> {label}
            </li>
          ))}
        </ul>

        {/* Legal */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-[13px] leading-relaxed text-[#8fa89e] lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-3xl space-y-2">
            <p>
              SellSail is a trading name of {site.company}, a company registered in England and Wales (company number{" "}
              {site.companyNumber}). Registered office: {site.address}, United Kingdom.
            </p>
            <p>{site.disclaimer}</p>
          </div>
          <p className="shrink-0 font-semibold text-[#b9cfc6]">
            © {year} {site.company}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
