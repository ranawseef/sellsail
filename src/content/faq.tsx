import Link from "next/link";

export const faqText = {
  belowCost: {
    q: "Will SellSail ever price below my costs?",
    a: "No. Each listing has a floor built from your supplier cost, delivery, VAT and OnBuy commission. If a rival goes lower, SellSail holds at the floor.",
  },
  sources: {
    q: "Can I dropship from Amazon and AliExpress to OnBuy?",
    a: "SellSail can import products from Amazon and AliExpress and keep OnBuy listings in sync with them. Marketplace rules on dropshipping change, so check OnBuy's seller policy and your supplier's terms before you start. You stay the seller of record and are responsible for meeting them.",
  },
  safe: {
    q: "Is it safe to connect my OnBuy account?",
    a: "SellSail connects through OnBuy's seller API. Your keys will be stored encrypted, and nothing changes on OnBuy until you switch repricing on.",
  },
  feeds: {
    q: "Which suppliers does it work with?",
    a: "Amazon and AliExpress product links, plus any supplier that gives you a CSV or XML feed of stock and prices.",
  },
  different: {
    q: "How is SellSail different from other OnBuy tools?",
    a: "SellSail builds each floor from your supplier's live cost plus OnBuy commission, VAT and delivery, so you don't set limits by hand and they stay right when costs change.",
  },
  affiliated: {
    q: "Is SellSail part of OnBuy, Amazon or AliExpress?",
    a: "No. SellSail is an independent UK tool. It is not affiliated with, endorsed by or sponsored by any of them.",
  },
  beta: {
    q: "When does the beta open?",
    a: "Beta places open soon. Join the list and we'll email you once, when your place is ready.",
  },
};

export const homeFaq = [faqText.belowCost, faqText.sources, faqText.safe, faqText.different, faqText.affiliated, faqText.beta];

export function withBetaLink(a: string) {
  return (
    <>
      {a}{" "}
      <Link href="/beta" className="font-semibold text-sea-dark underline">
        Join the beta list
      </Link>
      .
    </>
  );
}
