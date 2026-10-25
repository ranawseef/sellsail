import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie notice: how sellsail.io uses cookies",
  description: "Which cookies sellsail.io sets, why each one is needed, how long they last, and how to give or withdraw consent for optional analytics cookies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice" updated="25 October 2026">
      <p>
        sellsail.io is run by {site.company} (company number {site.companyNumber}). It never sets advertising cookies. It uses
        cookies that are strictly necessary for the site to work, which don&apos;t need your consent, and optional
        analytics cookies only if you allow them.
      </p>
      <h2>Cookies we set</h2>
      <ul>
        <li>
          <strong>Sign-in session</strong> (<code>__Host-ss_session</code>): keeps you logged in to your dashboard. It lasts
          up to 90 days, or until you log out.
        </li>
        <li>
          <strong>Admin session</strong> (<code>__Host-ss_admin</code>): only for SellSail staff, for up to 12 hours.
        </li>
      </ul>
      <h2>Payments</h2>
      <p>
        When you choose a plan, payment happens on Stripe&apos;s own pages, which set their own cookies to process the
        payment and prevent fraud. See stripe.com/cookies-policy.
      </p>
      <h2>Analytics (optional)</h2>
      <p>
        With your permission we use Google Analytics to understand how visitors use sellsail.io, such as which pages are
        read and how people find us. It sets cookies named <code>_ga</code> and <code>_ga_*</code>, which last up to 2
        years. These cookies stay off until you choose &quot;Allow analytics&quot; in the cookie banner. You can change
        your choice at any time with the &quot;Cookie settings&quot; link at the bottom of every page, and you can delete
        existing cookies in your browser settings.
      </p>
    </LegalPage>
  );
}
