import type { Metadata } from "next";
import Link from "next/link";
import { CompanyDetails, LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acceptable use policy",
  description: "What you may and may not use SellSail for: marketplace rules, lawful products, fair use of the service, and what happens if the policy is broken.",
  alternates: { canonical: "/acceptable-use" },
};

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable use policy" updated="26 October 2026">
      <p>
        This policy forms part of our <Link href="/terms">terms of service</Link>. It applies to everyone who uses SellSail.
      </p>

      <h2>You must</h2>
      <ul>
        <li>only connect marketplace accounts and API keys that you own or are authorised to use;</li>
        <li>follow the seller rules of OnBuy and the terms of any supplier you source from, including Amazon;</li>
        <li>sell only products that are legal in the UK and allowed on OnBuy;</li>
        <li>keep your account details secure and tell us straight away if you think someone else has used them.</li>
      </ul>

      <h2>You must not</h2>
      <ul>
        <li>list counterfeit, stolen, unsafe, recalled or prohibited goods, or goods that infringe anyone&apos;s rights;</li>
        <li>use SellSail to mislead buyers, manipulate prices together with other sellers, or break competition or consumer law;</li>
        <li>try to access another customer&apos;s data, get around plan limits, or probe, scan or overload our systems;</li>
        <li>copy, resell or reverse-engineer the service, or use it to build a competing product;</li>
        <li>share one account between unrelated businesses;</li>
        <li>use automated tools to scrape the website or the dashboard.</li>
      </ul>

      <h2>If this policy is broken</h2>
      <p>
        We may pause repricing, suspend or close the account, and where required tell the relevant marketplace or
        authority. Where we can, we will warn you first and explain why. To report misuse, email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <CompanyDetails />
    </LegalPage>
  );
}
