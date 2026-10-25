import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How SellSail, run by VIVIDDEALS LTD, collects, uses, stores and protects your personal data under UK GDPR, and the rights you have over it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="25 October 2026">
      <p>
        This policy explains how {site.company} (&quot;SellSail&quot;, &quot;we&quot;) uses personal data. SellSail is a trading name of{" "}
        {site.company}, registered in England and Wales, company number {site.companyNumber}, registered office {site.address}, United Kingdom. We are the data controller for the data described here. Contact us at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> or on <a href={site.phoneHref}>{site.phone}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address and workspace name. Your password is stored only as a
          one-way hash; we can&apos;t read it.
        </li>
        <li>
          <strong>Store data:</strong> your OnBuy API keys, an optional proxy login, your listings, SKUs, ASINs, prices,
          stock levels, price history and the competition data OnBuy returns for your listings.
        </li>
        <li>
          <strong>Billing data:</strong> your plan, subscription status and invoices. Card details are entered on Stripe&apos;s
          pages and never reach us.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type, sign-in sessions and server logs, used to keep accounts
          secure.
        </li>
        <li>
          <strong>Messages</strong> you send us.
        </li>
      </ul>
      <p>The fee calculator runs in your browser. Nothing you type into it is sent to us.</p>

      <h2>Why we use it and our lawful basis</h2>
      <ul>
        <li>To provide the service you signed up for: pricing your listings and sending updates to OnBuy (contract).</li>
        <li>To send account emails such as sign-up codes, password resets and payment problems (contract).</li>
        <li>To keep the service secure, prevent abuse and give support (legitimate interests).</li>
        <li>To keep accounting and tax records (legal obligation).</li>
      </ul>

      <h2>Who we share it with</h2>
      <ul>
        <li>
          <strong>Hostinger</strong> hosts the website, database and our email.
        </li>
        <li>
          <strong>Stripe</strong> takes subscription payments. Stripe may act as the reseller (merchant of record) of your
          subscription and handle sales tax and VAT; for that it uses your billing details under its own privacy policy
          (stripe.com/privacy).
        </li>
        <li>
          <strong>OnBuy</strong> receives your price and stock updates through your own API keys, and{" "}
          <strong>Amazon</strong> is asked for public offer prices for your ASINs. Neither receives your personal details from
          us.
        </li>
        <li>Your proxy provider, if you add one, carries your OnBuy requests.</li>
        <li>
          <strong>Google Analytics</strong>, only if you allow analytics cookies on sellsail.io, receives information about
          how you use the public website (pages visited, device and approximate location). Our lawful basis is your
          consent, which you can withdraw at any time with &quot;Cookie settings&quot;.
        </li>
      </ul>
      <p>
        The full list of the suppliers who process data for us is on our{" "}
        <Link href="/data-processing">data processing</Link> page. Our suppliers only process data to provide their service to us. We never sell your data. Some suppliers, such as
        Stripe, may process data outside the UK; where they do, they use safeguards approved under UK law, such as the
        International Data Transfer Addendum.
      </p>

      <h2>Your API keys and support access</h2>
      <p>
        Marketplace API keys, tokens and proxy passwords are encrypted (AES-256-GCM) before they are stored, and are never
        shown in your dashboard again after you save them. A small number of SellSail staff can decrypt them in our admin
        panel to help you with support or investigate a problem. Every such view is recorded with who viewed it and when.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account and store data: while your workspace is open. When it is closed, it is deleted straight away.</li>
        <li>Price history and activity logs: 30 days. Background job logs: 14 days.</li>
        <li>Invoices and billing records: 6 years, as UK tax law requires.</li>
      </ul>

      <h2>Security</h2>
      <p>
        All connections use HTTPS. Keys and passwords are encrypted or hashed as described above, sign-in sessions are
        stored as hashes, and new accounts confirm their email with a one-time code. Staff access to the admin panel needs a
        code sent to a SellSail inbox, and admin actions are logged.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK GDPR you can ask to access, correct, delete or move your data, object to or restrict how we use it, and
        withdraw consent. Email <a href={`mailto:${site.email}`}>{site.email}</a> and we will reply within one month. You can
        also complain to the Information Commissioner&apos;s Office (ico.org.uk).
      </p>

      <h2>Cookies</h2>
      <p>
        See our <Link href="/cookies">cookie notice</Link>.
      </p>
    </LegalPage>
  );
}
