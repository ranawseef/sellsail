import type { Metadata } from "next";
import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data processing and sub-processors",
  description: "How SellSail processes store and customer data on behalf of sellers under UK GDPR, the security measures we use, and our list of sub-processors.",
  alternates: { canonical: "/data-processing" },
};

const SUBPROCESSORS = [
  ["Hostinger International Ltd", "Hosting of the website, application, database and email", "EU / UK"],
  ["Stripe Payments Europe Ltd and Stripe, Inc.", "Subscription payments, invoicing and tax", "EU, UK, USA"],
  ["GitHub, Inc.", "Source code hosting and deployment (no customer data)", "USA"],
];

export default function DataProcessingPage() {
  return (
    <LegalPage title="Data processing and sub-processors" updated="26 October 2026">
      <p>
        This page forms part of our <Link href="/terms">terms of service</Link> and applies where SellSail processes personal
        data on your behalf. For data we use for our own purposes, see our <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Roles</h2>
      <p>
        For the store data you bring into SellSail (listings, SKUs, prices and stock, and any personal data they contain),
        you are the controller and {site.company} is the processor. We process it only to provide the service, on your
        documented instructions, which are these terms and the settings you choose.
      </p>

      <h2>Our commitments (UK GDPR Article 28)</h2>
      <ul>
        <li>We process your data only on your instructions, unless the law requires otherwise, in which case we tell you first where allowed.</li>
        <li>Everyone who can access it is bound by confidentiality.</li>
        <li>We protect it with appropriate technical and organisational measures; see <Link href="/security">security</Link>.</li>
        <li>We use only the sub-processors listed below, under written terms that give the same protection, and we will update this page before adding a new one.</li>
        <li>We help you answer requests from individuals and meet your security, breach-notification and impact-assessment duties.</li>
        <li>We tell you without undue delay, and within 72 hours, after becoming aware of a personal data breach affecting your data.</li>
        <li>When your workspace is closed we delete your store data, unless the law requires us to keep it.</li>
        <li>We make available the information you need to show compliance, and allow reasonable audits by agreement.</li>
      </ul>

      <h2>International transfers</h2>
      <p>
        Where a sub-processor handles data outside the UK, the transfer is covered by UK adequacy regulations or the UK
        International Data Transfer Addendum to the EU Standard Contractual Clauses.
      </p>

      <h2>Sub-processors</h2>
      <div className="not-prose relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-3 font-semibold">Sub-processor</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Purpose</th>
              <th scope="col" className="py-2 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map(([n, p, l]) => (
              <tr key={n} className="border-b border-line/70">
                <td className="py-2 pr-3 font-semibold">{n}</td>
                <td className="py-2 pr-3">{p}</td>
                <td className="py-2">{l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        OnBuy and Amazon are not our sub-processors: OnBuy receives updates through your own API keys, and Amazon is only
        asked for public offer prices, with no personal data.
      </p>
      <p>
        Need a signed data processing agreement? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <CompanyDetails />
    </LegalPage>
  );
}
