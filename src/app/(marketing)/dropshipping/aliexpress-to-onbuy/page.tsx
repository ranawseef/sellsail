import type { Metadata } from "next";
import { DropshipPage } from "@/components/dropship-page";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "AliExpress to OnBuy dropshipping (coming soon)",
  description:
    "AliExpress support is coming to SellSail: OnBuy prices built from AliExpress costs with every fee counted. Reprice from Amazon UK today with a 14-day free trial.",
  alternates: { canonical: "/dropshipping/aliexpress-to-onbuy" },
}

export default function AliExpressToOnBuyPage() {
  return (
    <DropshipPage
      eyebrow="AliExpress to OnBuy"
      title={<>AliExpress to OnBuy dropshipping, <span className="highlight px-1">priced to profit</span></>}
      intro="AliExpress is coming to SellSail: OnBuy prices built from AliExpress costs and shipping, with every fee counted and stock kept in sync."
      source="AliExpress"
      soon
      points={[
        "OnBuy prices built from the AliExpress price and shipping",
        "The same margin bands, competition and safety brakes as Amazon",
        "Out of stock on OnBuy when the supplier runs out",
        "Amazon and AliExpress listings in one place",
      ]}
      steps={[
        ["Start with Amazon today", "Connect OnBuy and reprice your Amazon-sourced listings now."],
        ["Add AliExpress when it's ready", "Link listings to AliExpress products in the same dashboard."],
        ["Same rules, new source", "Your margin bands and competition settings apply to both."],
      ]}
      faq={[faqText.feeds, faqText.sources, faqText.belowCost, faqText.affiliated]}
    />
  );
}
