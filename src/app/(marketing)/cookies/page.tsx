import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie notice",
  description: "How sellsail.io uses cookies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice" updated="25 October 2026">
      <p>
        sellsail.io is run by {site.company} (company number {site.companyNumber}). It does not set any analytics or
        advertising cookies. We only use cookies that are strictly necessary for the site to work, which don&apos;t need
        your consent.
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
      <h2>If this changes</h2>
      <p>
        If we add analytics in future, we will ask for your consent first and non-essential cookies will be off until you
        say yes. You will be able to change your choice at any time.
      </p>
    </LegalPage>
  );
}
