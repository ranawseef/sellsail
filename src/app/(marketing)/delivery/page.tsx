import type { Metadata } from "next";
import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Service delivery",
  description: "How SellSail is delivered: online software, available straight after sign-up. No physical goods are shipped.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <LegalPage title="Service delivery" updated="26 October 2026">
      <p>
        SellSail is online software (software as a service). We do not sell or ship any physical goods, and nothing is
        posted to you.
      </p>

      <h2>When you get access</h2>
      <ul>
        <li>Your account is ready as soon as you confirm your email address with the code we send you.</li>
        <li>Your free trial starts immediately, with full access to the features of the trial plan.</li>
        <li>When you pay for a plan, the new plan applies within seconds of Stripe confirming the payment.</li>
      </ul>

      <h2>How you use it</h2>
      <p>
        You use SellSail in a web browser at sellsail.io. After you connect your OnBuy account and import your listings, the
        service runs automatically on our servers, 24 hours a day: reading Amazon prices, working out OnBuy prices, checking
        competition and sending updates to OnBuy.
      </p>

      <h2>Receipts and invoices</h2>
      <p>
        Every payment produces an invoice, emailed by Stripe and always available in your dashboard under Billing, with a
        PDF download.
      </p>

      <h2>Availability and support</h2>
      <p>
        We aim to keep SellSail running at all times. Planned maintenance is kept short and done outside UK business hours
        where possible. Support is by email and phone; see <Link href="/contact">contact</Link>.
      </p>

      <CompanyDetails />
    </LegalPage>
  );
}
