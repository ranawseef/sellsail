export const faqText = {
  belowCost: {
    q: "Will SellSail ever price below my costs?",
    a: "Not unless you ask it to. Every price covers the Amazon cost, OnBuy commission and payment fees plus your minimum profit. If a rival goes lower, SellSail holds at your floor. Only the optional \"win the sale\" setting allows a small loss, capped at the amount you choose.",
  },
  sources: {
    q: "Can I dropship from Amazon to OnBuy with SellSail?",
    a: "Yes. SellSail prices your OnBuy listings from live Amazon UK offers and keeps stock in sync. AliExpress is coming soon. Marketplace rules on dropshipping change, so check OnBuy's seller policy and your supplier's terms before you start. You stay the seller of record and are responsible for meeting them.",
  },
  safe: {
    q: "Is it safe to connect my OnBuy account?",
    a: "SellSail connects through OnBuy's seller API. Your keys are stored encrypted, every change is logged, and one switch pauses everything.",
  },
  feeds: {
    q: "Which suppliers does it work with?",
    a: "Amazon UK today: SellSail reads the offer fulfilled by Amazon for each ASIN, with no Amazon account or keys needed. AliExpress is coming soon.",
  },
  different: {
    q: "How is SellSail different from other OnBuy tools?",
    a: "SellSail builds each price from the live Amazon cost plus OnBuy commission, payment fees and your profit, so you don't set limits by hand and they stay right when Amazon prices change. Competition only ever lowers a price to your floor, never below it.",
  },
  affiliated: {
    q: "Is SellSail part of OnBuy, Amazon or AliExpress?",
    a: "No. SellSail is an independent UK tool. It is not affiliated with, endorsed by or sponsored by any of them.",
  },
  trial: {
    q: "Is there a free trial?",
    a: "Yes. Every new account gets a 14-day free trial with up to 1,000 listings. No card is needed, and nothing is charged when it ends.",
  },
};

export const homeFaq = [faqText.belowCost, faqText.sources, faqText.safe, faqText.different, faqText.affiliated, faqText.trial];
