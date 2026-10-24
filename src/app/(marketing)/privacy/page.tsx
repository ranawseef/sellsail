import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How SellSail collects, uses and protects your personal data under UK GDPR.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="15 October 2026">
      <p>
        This policy explains how Horizon Retail Solutions Ltd (&quot;SellSail&quot;, &quot;we&quot;) uses personal data. We are the
        data controller for the data described here. Company number 15884637, registered office 2nd Floor College House, 17 King Edwards Road, Ruislip, London, HA4 7AE.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Contact details</strong> you give us, such as your email address when you join the beta or email us.</li>
        <li><strong>Account and store data</strong> once the service launches, such as your OnBuy API keys, listings, orders and supplier links, which we need to run the service.</li>
        <li><strong>Technical data</strong> such as server logs needed to keep the site secure.</li>
      </ul>
      <p>The fee calculator runs in your browser. Nothing you type into it is sent to us.</p>
      <h2>Why we use it and our lawful basis</h2>
      <ul>
        <li>To provide the service you sign up for (contract).</li>
        <li>To tell you about the beta when you ask us to (consent). You can withdraw consent at any time.</li>
        <li>To keep the site and service secure and working (legitimate interests).</li>
        <li>To meet legal and tax obligations (legal obligation).</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>
        We use trusted suppliers such as our hosting provider and email provider to run the service. They only process
        data on our instructions. We never sell your data.
      </p>
      <h2>How long we keep it</h2>
      <p>
        We keep data only as long as we need it for the purposes above, then delete it. Beta list emails are deleted when
        you unsubscribe or the beta ends, whichever comes first.
      </p>
      <h2>Security</h2>
      <p>Connections are encrypted with HTTPS. Marketplace API keys will be stored encrypted.</p>
      <h2>Your rights</h2>
      <p>
        Under UK GDPR you can ask to access, correct, delete or move your data, object to or restrict how we use it, and
        withdraw consent. Email <a href={`mailto:${site.email}`}>{site.email}</a>. You can also complain to the
        Information Commissioner&apos;s Office (ico.org.uk).
      </p>
      <h2>Cookies</h2>
      <p>See our <Link href="/cookies">cookie notice</Link>.</p>
    </LegalPage>
  );
}
