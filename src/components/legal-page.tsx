import { PageHero } from "@/components/sections";
import { site } from "@/lib/site";

// Shared layout for the legal pages. Company details come from lib/site.ts.
// The full list of legal pages lives in LEGAL_PAGES (footer and /legal use it).
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={`Last updated ${updated}`} />
      <section className="mx-auto max-w-[820px] px-6 py-16">
        <div className="prose-site mx-auto">{children}</div>
      </section>
    </>
  );
}

export const LEGAL_PAGES = [
  { href: "/terms", label: "Terms of service", text: "The agreement for using SellSail." },
  { href: "/privacy", label: "Privacy policy", text: "What personal data we hold and why." },
  { href: "/cookies", label: "Cookie notice", text: "The cookies sellsail.io sets." },
  { href: "/refunds", label: "Refunds and cancellation", text: "Trials, cancelling and when we refund." },
  { href: "/delivery", label: "Service delivery", text: "How and when you get access to SellSail." },
  { href: "/acceptable-use", label: "Acceptable use policy", text: "What you may and may not use SellSail for." },
  { href: "/data-processing", label: "Data processing", text: "How we process data for you, and our sub-processors." },
  { href: "/security", label: "Security", text: "How we protect your account and API keys." },
];

/** The business details block shown at the end of every legal page. */
export function CompanyDetails() {
  return (
    <>
      <h2>Who we are</h2>
      <p>
        SellSail is a trading name of {site.company}, a private limited company registered in England and Wales, company
        number {site.companyNumber}. Registered office: {site.address}, United Kingdom.
      </p>
      <p>
        Email <a href={`mailto:${site.email}`}>{site.email}</a> · Phone <a href={site.phoneHref}>{site.phone}</a>
      </p>
    </>
  );
}
