import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use the SellSail website and service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="15 October 2026">
      <p>
        These terms apply to your use of sellsail.io and the SellSail service, provided by Horizon Retail Solutions Ltd, a company
        registered in England and Wales (company number 15884637), registered office 2nd Floor College House, 17 King Edwards Road, Ruislip, London, HA4 7AE.
      </p>
      <h2>An independent tool</h2>
      <p>{site.disclaimer}</p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>You are the seller of record for every sale and are responsible for your listings, prices, dispatch, returns and customer service.</li>
        <li>You are responsible for following the rules of OnBuy and of any supplier you use, including Amazon and AliExpress, and for checking that your way of selling is allowed.</li>
        <li>You are responsible for the fees, taxes and VAT that apply to your business.</li>
        <li>You must keep your account and marketplace API keys secure.</li>
      </ul>
      <h2>Prices, fees and results</h2>
      <p>
        SellSail uses fee rates and supplier data we believe to be accurate, but marketplaces and suppliers can change them
        at any time. Calculations are estimates. We do not guarantee sales, Buy Box wins, profits or any other result.
      </p>
      <h2>Plans and payment</h2>
      <p>
        Paid plans are billed monthly in advance and exclude VAT. You can cancel at any time; cancellation takes effect at
        the end of the current billing period. The beta is free.
      </p>
      <h2>Liability</h2>
      <p>
        Nothing in these terms limits liability that cannot be limited by law. Otherwise, our total liability to you is
        limited to the fees you paid us in the 12 months before the claim, and we are not liable for loss of profit or
        indirect loss.
      </p>
      <h2>Changes and law</h2>
      <p>
        We may update these terms and will tell you about significant changes. These terms are governed by the law of
        England and Wales.
      </p>
      <h2>Contact</h2>
      <p>Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}
