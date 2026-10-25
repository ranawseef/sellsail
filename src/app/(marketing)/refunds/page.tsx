import type { Metadata } from "next";
import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";
import { TRIAL_DAYS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Refund and cancellation policy",
  description: "How SellSail's 14-day free trial works, how to cancel a monthly or annual subscription at any time, and when we give refunds.",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund and cancellation policy" updated="26 October 2026">
      <p>
        This policy explains how trials, cancellations and refunds work for SellSail subscriptions. It forms part of our{" "}
        <Link href="/terms">terms of service</Link>.
      </p>

      <h2>Free trial</h2>
      <p>
        Every new workspace starts with a {TRIAL_DAYS}-day free trial. No payment card is needed, and you are never charged
        automatically when the trial ends: the service simply stops repricing until you choose a paid plan.
      </p>

      <h2>Subscriptions</h2>
      <ul>
        <li>Plans are billed in advance, monthly or yearly, in pounds sterling. Prices exclude VAT, which is added at checkout where it applies.</li>
        <li>Your subscription renews automatically at the end of each billing period until you cancel.</li>
        <li>You can change plan or billing period at any time in Billing. Upgrades and downgrades are charged or credited pro rata.</li>
      </ul>

      <h2>How to cancel</h2>
      <p>
        Cancel at any time in your dashboard under <strong>Billing → Manage billing → Cancel plan</strong>, or email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> from your account address. Cancellation takes effect at the end of
        the period you have already paid for, and you keep full access until then. There are no cancellation fees.
      </p>

      <h2>Refunds</h2>
      <p>Because you can try SellSail free before paying, payments are generally non-refundable. We will refund you when:</p>
      <ul>
        <li>you were charged in error, for example twice for the same period, or after you had cancelled;</li>
        <li>SellSail was unavailable for a significant part of a billing period because of a fault on our side;</li>
        <li>you upgraded by mistake and tell us within 48 hours without having used the higher limits;</li>
        <li>the law requires it.</li>
      </ul>
      <p>
        To ask for a refund, email <a href={`mailto:${site.email}`}>{site.email}</a> within 30 days of the charge with your
        workspace name and the invoice number. Approved refunds go back to the original payment method, usually within 5 to
        10 working days.
      </p>

      <h2>Business customers</h2>
      <p>
        SellSail is sold to businesses. The 14-day cancellation right for consumers under the Consumer Contracts Regulations
        does not apply to business purchases. If you are buying as a consumer, contact us and we will apply your statutory
        rights in full.
      </p>

      <h2>Failed payments and disputes</h2>
      <p>
        If a payment fails, Stripe retries it automatically and we show a notice in your dashboard. Repricing may pause until
        the payment succeeds. If you think a
        charge is wrong, please contact us first: we can usually fix it the same day, faster than a card dispute.
      </p>

      <CompanyDetails />
    </LegalPage>
  );
}
