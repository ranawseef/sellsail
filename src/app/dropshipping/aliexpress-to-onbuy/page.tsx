import type { Metadata } from "next";
import { DropshipPage } from "@/components/dropship-page";
import { faqText } from "@/content/faq";

export const metadata: Metadata = {
  title: "AliExpress to OnBuy dropshipping tool",
  description:
    "Import AliExpress products, list them on OnBuy with fee-aware prices, and keep stock and prices in sync. Built for UK sellers.",
  alternates: { canonical: "/dropshipping/aliexpress-to-onbuy" },
};

export default function AliExpressToOnBuyPage() {
  return (
    <DropshipPage
      eyebrow="AliExpress to OnBuy"
      title={<>AliExpress to OnBuy dropshipping, <span className="highlight px-1">priced to profit</span></>}
      intro="Import products from AliExpress, list them on OnBuy at a price that covers commission, VAT and delivery, and keep them in sync automatically."
      source="AliExpress"
      points={[
        "Import AliExpress products by link",
        "Supplier price, shipping cost and stock checked on every sync",
        "Set OnBuy dispatch times that match your supplier's delivery",
        "Listings paused when the supplier runs out",
      ]}
      steps={[
        ["Paste an AliExpress link", "SellSail reads the product, price, shipping and stock."],
        ["Set your margin", "See the floor, the OnBuy price and your profit before listing."],
        ["List on OnBuy", "Publish the listing with a dispatch time you can meet."],
        ["Stay in sync", "Price and stock follow AliExpress, and the repricer protects your floor."],
      ]}
      faq={[faqText.sources, faqText.belowCost, faqText.feeds, faqText.affiliated]}
    />
  );
}
