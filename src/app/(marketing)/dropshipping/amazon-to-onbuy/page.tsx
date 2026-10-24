import type { Metadata } from "next";
import { DropshipPage } from "@/components/dropship-page";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "Amazon to OnBuy dropshipping tool",
  description:
    "Import Amazon products, list them on OnBuy with fee-aware prices, and keep stock and prices in sync. Built for UK sellers.",
  alternates: { canonical: "/dropshipping/amazon-to-onbuy" },
};

export default function AmazonToOnBuyPage() {
  return (
    <DropshipPage
      eyebrow="Amazon to OnBuy"
      title={<>Amazon to OnBuy dropshipping, <span className="highlight px-1">with the fees done for you</span></>}
      intro="Import products from Amazon UK, list them on OnBuy at a price that covers commission, VAT and delivery, and keep them in sync automatically."
      source="Amazon"
      points={[
        "Import Amazon products by link",
        "Amazon price and stock checked on every sync",
        "OnBuy floor built from the Amazon cost plus every fee",
        "Listings paused when Amazon runs out",
      ]}
      steps={[
        ["Paste an Amazon link", "SellSail reads the product title, images, price and stock."],
        ["Set your margin", "See the floor, the OnBuy price and your profit before listing."],
        ["List on OnBuy", "Publish the listing to your OnBuy shop."],
        ["Stay in sync", "Price and stock follow Amazon, and the repricer protects your floor."],
      ]}
      faq={[faqText.sources, faqText.belowCost, faqText.safe, faqText.affiliated]}
    />
  );
}
