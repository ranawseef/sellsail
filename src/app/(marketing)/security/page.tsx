import type { Metadata } from "next";
import { CompanyDetails, LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security: how SellSail protects your account",
  description: "How SellSail protects your account, your OnBuy API keys and your store data: encryption at rest, secure sign-in, access controls and safe pricing limits.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security" updated="26 October 2026">
      <p>Your OnBuy keys control your shop, so we treat them that way. This is how SellSail protects them and your data.</p>

      <h2>Your API keys</h2>
      <ul>
        <li>OnBuy API keys, access tokens and proxy passwords are encrypted with AES-256-GCM before they are stored.</li>
        <li>They are never shown again in your dashboard after you save them.</li>
        <li>A small number of SellSail staff can view them to give support. Every view is recorded with who viewed them and when.</li>
        <li>You can disconnect OnBuy at any time; the keys are deleted straight away.</li>
      </ul>

      <h2>Your account</h2>
      <ul>
        <li>Passwords are stored only as a salted one-way hash.</li>
        <li>New accounts confirm their email with a one-time code, and password resets use one-time codes that expire after 15 minutes.</li>
        <li>Sign-in sessions are stored as hashes, so a leaked database can&apos;t be used to log in, and you can sign out other devices from Settings.</li>
        <li>Sign-in and code attempts are rate-limited.</li>
      </ul>

      <h2>Infrastructure</h2>
      <ul>
        <li>All traffic uses HTTPS.</li>
        <li>Each workspace&apos;s data is separated in every database query.</li>
        <li>Staff access to the admin panel needs a one-time code sent to a SellSail inbox, and every admin action is logged.</li>
        <li>Payments are handled by Stripe; card details never reach our servers.</li>
      </ul>

      <h2>Safety brakes for your prices</h2>
      <ul>
        <li>Sudden large price drops are confirmed before they reach OnBuy.</li>
        <li>Listings go out of stock if no fresh Amazon price arrives for 24 hours.</li>
        <li>One switch pauses all updates to OnBuy.</li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        If you think you&apos;ve found a security problem, email <a href={`mailto:${site.email}`}>{site.email}</a> with
        &quot;Security&quot; in the subject. Please give us a reasonable time to fix it before sharing it.
      </p>

      <CompanyDetails />
    </LegalPage>
  );
}
