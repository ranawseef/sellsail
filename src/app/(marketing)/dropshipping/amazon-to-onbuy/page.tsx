import type { Metadata } from "next";
import { DropshipPage } from "@/components/dropship-page";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "Amazon to OnBuy repricer and dropshipping tool",
  description:
    "Price your OnBuy listings from live Amazon UK offers, with OnBuy fees and your profit built in. Competition, stock sync and safety brakes. 14-day free trial.",
  alternates: { canonical: "/dropshipping/amazon-to-onbuy" },
}

export default function AmazonToOnBuyPage() {
  return (
    <DropshipPage
      eyebrow="Amazon to OnBuy"
      title={<>Amazon to OnBuy dropshipping, <span className="highlight px-1">with the fees done for you</span></>}
      intro="SellSail prices your OnBuy listings from live Amazon UK offers, at a price that covers OnBuy commission, payment fees and your profit, and keeps stock in sync automatically."
      source="Amazon"
      points={[
        "Amazon UK prices read for you, no Amazon account needed",
        "OnBuy price built from the Amazon cost plus every fee and your profit",
        "Cheaper OnBuy sellers answered, never below your floor",
        "Out of stock on OnBuy as soon as Amazon runs out",
      ]}
      steps={[
        ["Connect OnBuy", "Add your OnBuy API keys. They're stored encrypted."],
        ["Import your listings", "Bring in your OnBuy listings, or upload a CSV of SKUs and ASINs."],
        ["Check your margins", "Review the suggested margin bands and try any Amazon price in the preview."],
        ["Stay in sync", "Prices and stock follow Amazon, and competition keeps you just under cheaper sellers."],
      ]}
      faq={[faqText.sources, faqText.belowCost, faqText.safe, faqText.affiliated]}
    />
  );
}
