import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LEGAL_PAGES, LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal information and company details",
  description: "SellSail's legal documents in one place, plus company details for VIVIDDEALS LTD: registered office, company number and how to contact us.",
  alternates: { canonical: "/legal" },
};

export default function LegalIndexPage() {
  return (
    <LegalPage title="Legal information" updated="26 October 2026">
      <h2>Company details</h2>
      <dl>
        <dt><strong>Trading name</strong></dt>
        <dd>SellSail</dd>
        <dt><strong>Company</strong></dt>
        <dd>{site.company}, a private limited company registered in England and Wales</dd>
        <dt><strong>Company number</strong></dt>
        <dd>{site.companyNumber}</dd>
        <dt><strong>Registered office</strong></dt>
        <dd>{site.address}, United Kingdom</dd>
        <dt><strong>Email</strong></dt>
        <dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
        <dt><strong>Phone</strong></dt>
        <dd><a href={site.phoneHref}>{site.phone}</a></dd>
      </dl>

      <h2>Documents</h2>
      <ul className="not-prose mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
        {LEGAL_PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-sea">
              <span>
                <span className="block font-bold">{p.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{p.text}</span>
              </span>
              <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
