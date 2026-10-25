import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";
import { PAID_PLANS, PLANS, TRIAL_DAYS, formatPence } from "@/config/plans";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use the SellSail website and service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="26 October 2026">
      <p>
        These terms apply to your use of sellsail.io and the SellSail service. SellSail is a trading name of {site.company}, a
        company registered in England and Wales (company number {site.companyNumber}), registered office {site.address}, United Kingdom (&quot;we&quot;, &quot;us&quot;). By creating an account you agree to
        these terms on behalf of yourself and the business you sign up for.
      </p>

      <p>
        These terms include our <Link href="/refunds">refund and cancellation policy</Link>,{" "}
        <Link href="/acceptable-use">acceptable use policy</Link> and <Link href="/data-processing">data processing terms</Link>.
        How the service is delivered is described in <Link href="/delivery">service delivery</Link>.
      </p>

      <h2>The service</h2>
      <p>
        SellSail is business software for online sellers. It reads supplier prices, works out OnBuy prices from rules you
        set, checks competing OnBuy offers if you switch that on, and sends price and stock updates to OnBuy using your own
        API keys. It is for business use only, not for consumers.
      </p>

      <h2>An independent tool</h2>
      <p>{site.disclaimer}</p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>You are the seller of record for every sale and are responsible for your listings, prices, dispatch, returns and customer service.</li>
        <li>You are responsible for following the rules of OnBuy and of any supplier you use, including Amazon and AliExpress, and for checking that your way of selling is allowed.</li>
        <li>You choose your pricing rules, floors and competition settings, and you are responsible for the prices they produce.</li>
        <li>You are responsible for the fees, taxes and VAT that apply to your business.</li>
        <li>You must keep your account and marketplace API keys secure, and not misuse the service or try to access other customers&apos; data.</li>
      </ul>

      <h2>Prices, fees and results</h2>
      <p>
        SellSail uses fee rates and supplier data we believe to be accurate, but marketplaces and suppliers can change them
        at any time. Calculations are estimates. We do not guarantee sales, Buy Box wins, profits or any other result.
      </p>

      <h2>Free trial, plans and payment</h2>
      <ul>
        <li>New workspaces get a {TRIAL_DAYS}-day free trial. No card is needed, and nothing is charged when it ends.</li>
        <li>
          Paid plans are billed monthly in advance:{" "}
          {PAID_PLANS.map((id, i) => (
            <span key={id}>
              {PLANS[id].name} {formatPence(PLANS[id].pricePence)} (up to {PLANS[id].maxSkus.toLocaleString("en-GB")} listings)
              {i < PAID_PLANS.length - 1 ? ", " : ""}
            </span>
          ))}
          . Prices are in pounds and exclude VAT, which is added at checkout where it applies. Customers outside the UK may be
          shown the price in their own currency.
        </li>
        <li>
          Payments are taken by Stripe. Stripe may act as the reseller (merchant of record) of your subscription and collect
          any sales tax or VAT due. Invoices are available under Billing.
        </li>
        <li>You can also pay yearly, at ten times the monthly price (two months free), billed in advance.</li>
        <li>You can change plan or billing period at any time in Billing; the difference is charged or credited pro rata.</li>
        <li>
          You can cancel at any time in Billing. Cancellation takes effect at the end of the period you have paid for and
          you keep access until then. We don&apos;t refund part-used months or years unless the law requires it or we have made a
          billing mistake.
        </li>
        <li>If a payment fails, we may pause price updates until it is paid.</li>
      </ul>

      <h2>Your data and API keys</h2>
      <p>
        You keep ownership of your data. We use it only to run the service, as described in our{" "}
        <Link href="/privacy">privacy policy</Link>. Your API keys are stored encrypted. SellSail staff can view them only to
        give support or investigate a problem, and every view is logged.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep SellSail running at all times but can&apos;t promise it will be uninterrupted: OnBuy, Amazon and
        other services it depends on can be unavailable or change without notice. We may change features to keep the service
        working or improve it.
      </p>

      <h2>Suspension and closing your account</h2>
      <p>
        You can close your workspace by emailing <a href={`mailto:${site.email}`}>{site.email}</a> from your account address;
        its data is then deleted. We may suspend or close an account that breaks these terms, misuses the service or is not
        paid for, and we will tell you why.
      </p>

      <h2>Liability</h2>
      <p>
        Nothing in these terms limits liability that cannot be limited by law. Otherwise, our total liability to you is
        limited to the fees you paid us in the 12 months before the claim, and we are not liable for loss of profit,
        revenue, sales or business, or for indirect loss.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms and will tell you about significant changes by email or in your dashboard at least 14
        days before they take effect. These terms are governed by the law of England and Wales, and the courts of England
        and Wales have jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        {site.company}, {site.address}, United Kingdom. Email <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
        <a href={site.phoneHref}>{site.phone}</a>.
      </p>
    </LegalPage>
  );
}
