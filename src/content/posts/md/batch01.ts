import type { Post } from "../types";

// Batch 1: the highest-volume dropshipping and trust queries (UK, 1K–10K/month).
export const batch01: Post[] = [
  {
    slug: "what-is-dropshipping",
    title: "What is dropshipping? A plain-English guide for UK sellers",
    description:
      "What is dropshipping and how does it work in the UK? A clear explanation of the model, the costs, the risks and how sellers make a profit, with worked examples.",
    keyword: "what is dropshipping",
    secondary: ["dropshipping meaning", "how does dropshipping work", "dropshipping explained"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "Dropshipping means selling a product you don't stock: when an order comes in, your supplier sends it straight to your customer.",
      "You make money on the gap between your selling price and the supplier's price, after marketplace fees, payment fees and VAT.",
      "It needs little cash to start, but margins are thin and you are still responsible for delivery times, returns and customer service.",
      "The sellers who last automate pricing and stock, so they never sell at a loss or sell something the supplier can't send.",
    ],
    faq: [
      {
        q: "Is dropshipping worth it in the UK?",
        a: "It can be, if you pick products with room for fees, price every item from its real cost, and keep stock in sync. Most failures come from selling below cost once commission and VAT are counted, or from slow delivery.",
      },
      {
        q: "How much money do you need to start dropshipping?",
        a: "Far less than a stock-holding business. You need a seller account, enough float to buy each item when it sells (before the marketplace pays you), and a budget for tools. Many UK sellers start with a few hundred pounds.",
      },
      {
        q: "Do I need a company to dropship in the UK?",
        a: "No. You can start as a sole trader and register with HMRC for Self Assessment. Many sellers set up a limited company later for tax or liability reasons. Speak to an accountant about which suits you.",
      },
      {
        q: "Where can I dropship in the UK?",
        a: "On your own website, or on marketplaces such as OnBuy, eBay and Amazon, each with its own rules about who can send orders. Always read the marketplace's dropshipping policy before you list.",
      },
    ],
    related: ["dropshipping-uk-guide", "uk-dropshipping-suppliers", "amazon-dropshipping", "how-to-price-onbuy-dropshipping"],
    md: `Dropshipping is a way of selling online without holding stock. You list a product, a customer buys it from you, and you then buy the same item from a supplier who sends it directly to your customer. You keep the difference between what the customer paid and what the supplier charged, minus your fees.

That's the whole model. The rest of this guide explains how it works day to day in the UK, what it really costs, and what separates the sellers who make money from those who don't.

## How does dropshipping work, step by step?

1. **You choose a product** from a supplier who will ship single orders to your customers.
2. **You list it for sale** on your own site or on a marketplace such as OnBuy, at a price above the supplier's.
3. **A customer buys it** and pays you.
4. **You place the order with your supplier**, using your customer's delivery address.
5. **The supplier ships it** and you pass the tracking number to the customer.
6. **You keep the margin**: the sale price minus the supplier's price and every fee.

You never touch the product. That's the appeal, and also the risk: you depend on someone else for stock, quality and delivery speed.

## How do dropshippers make money?

Profit comes from the gap between your selling price and your total cost. In the UK, that cost has more parts than most beginners expect:

| Cost | What it is |
|---|---|
| Supplier price | What you pay for the item, including the supplier's delivery charge |
| Marketplace commission | A percentage of the sale, usually charged on the full amount the buyer pays |
| Payment fees | Card or payment processing, if your platform charges them separately |
| VAT | 20% of the VAT-inclusive price if you are VAT-registered |
| Returns and refunds | The occasional item that comes back or never arrives |
| Tools | Software for listing, pricing and stock |

A product that costs £14 from a supplier and sells for £20 looks like a £6 profit. Take 15% commission (£3) and you are at £3. If you are VAT-registered, VAT on £20 is £3.33, and you are now losing money. This is why pricing every item from its real cost matters so much. Our [OnBuy fee calculator](/onbuy-fee-calculator) does this sum for you.

## What are the advantages of dropshipping?

- **Low start-up cost.** No warehouse and no stock to buy up front.
- **A wide catalogue.** You can list hundreds of products without buying any of them.
- **Easy to test.** If a product doesn't sell, you remove the listing. Nothing is left on a shelf.
- **Location independent.** You can run the business from anywhere with an internet connection.

## What are the disadvantages?

- **Thin margins.** Fees take a large share of every sale, so small pricing mistakes wipe out profit.
- **Less control.** Stock levels, packaging and delivery speed are in your supplier's hands.
- **Stock risk.** If the supplier runs out and your listing stays live, you take orders you can't fill.
- **Price changes.** Supplier prices move. A listing priced last month can be loss-making today.
- **You are still the seller.** Customers, marketplaces and the law hold you responsible for the order.

> The two most common reasons UK dropshippers lose money are selling below cost after fees, and selling items the supplier no longer has. Both are solved by keeping prices and stock in sync with the supplier automatically.

## Is dropshipping legal in the UK?

Yes. Dropshipping is a legal business model in the UK. You must follow consumer law (including the right of online buyers to cancel within 14 days), declare your income to HMRC, register for VAT if your taxable turnover passes the threshold, and follow the rules of every marketplace you sell on. Some marketplaces restrict which suppliers you can use, so read their dropshipping policy first. We cover this in detail in [Is dropshipping legal in the UK?](/blog/is-dropshipping-legal-uk).

## Where do UK dropshippers get products?

There are three common sources:

1. **UK dropshipping suppliers and wholesalers** that ship single orders from UK warehouses. Fast delivery, higher prices.
2. **Overseas suppliers** such as AliExpress. Low prices, long delivery times and more VAT and customs questions.
3. **Large retailers**, such as buying from Amazon UK to fulfil orders elsewhere. Fast and reliable, but check the rules of both sides. See [Amazon dropshipping in the UK](/blog/amazon-dropshipping).

Our guide to [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers) explains how to choose and vet one.

## How do you price a dropshipped product?

Start from cost, not from competitors. For every product:

1. Add the supplier price and delivery.
2. Add the profit you want, as a percentage with a minimum in pounds.
3. Divide by what's left after percentage fees. With 15% commission, divide by 0.85.

That gives a price where every fee is covered and your profit is protected. Only then look at competitors: if a rival is cheaper, you can go a little lower, but never below the price that keeps your minimum profit. The full method is in [How to price products for OnBuy dropshipping](/blog/how-to-price-onbuy-dropshipping).

## How do you keep a dropshipping business safe?

- **Sync stock and prices with your supplier** several times a day, not once a week.
- **Set a floor price** for every listing and never go below it.
- **Choose suppliers who can meet your dispatch promise**, and set realistic delivery times.
- **Keep records** of every order, cost and refund for your accounts.

This is the work SellSail automates for OnBuy sellers who source from Amazon UK: it reads the current Amazon price for every listing, sets an OnBuy price that covers every fee and your profit, and sends price and stock changes every few minutes. [See how it works](/features).

## Is dropshipping right for you?

Dropshipping suits people who like systems and numbers more than products and packaging. If you are happy to check margins, pick reliable suppliers and automate the repetitive work, it's one of the cheapest ways to start selling online in the UK. If you want full control over stock and quality, holding your own inventory may suit you better.

Ready to go deeper? Read our full guide to [dropshipping in the UK](/blog/dropshipping-uk-guide).`,
  },
  {
    slug: "dropshipping-uk-guide",
    title: "Dropshipping in the UK: the complete guide for 2026",
    description:
      "Everything you need to start dropshipping in the UK in 2026: legal set-up, tax and VAT, finding suppliers, choosing where to sell, pricing for profit and automating it.",
    keyword: "dropshipping uk",
    secondary: ["dropshipping united kingdom", "uk dropshipping", "how to dropship in the uk"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 12,
    takeaways: [
      "UK dropshipping is legal, but you must follow consumer law, register with HMRC and follow each marketplace's rules.",
      "Pick suppliers that can dispatch fast to UK addresses: delivery speed drives reviews and account health.",
      "Price every listing from its real cost plus fees, VAT and a minimum profit in pounds.",
      "Automate price and stock sync so you never sell at a loss or sell out-of-stock items.",
      "Start on one channel, prove your margins, then expand.",
    ],
    faq: [
      {
        q: "Is dropshipping profitable in the UK?",
        a: "It can be. Typical net margins are modest once marketplace commission, payment fees and VAT are paid, so profit depends on choosing the right products and pricing every one from its real cost.",
      },
      {
        q: "Do I need to register a business to dropship in the UK?",
        a: "You can start as a sole trader, registering for Self Assessment with HMRC once you earn more than the trading allowance. A limited company is optional. An accountant can advise on which is better for you.",
      },
      {
        q: "When do I need to register for VAT?",
        a: "When your VAT-taxable turnover in the last 12 months goes over the threshold, which has been £90,000 since April 2024, or if you expect it to in the next 30 days. You can register voluntarily before that.",
      },
      {
        q: "Which UK marketplace is best for dropshipping?",
        a: "It depends on your products and the marketplace's rules. OnBuy, eBay and Amazon all allow third-party sellers but have different policies on who may fulfil orders. Read each policy before listing.",
      },
    ],
    related: ["what-is-dropshipping", "uk-dropshipping-suppliers", "is-dropshipping-legal-uk", "start-dropshipping-business-uk"],
    md: `Dropshipping in the UK means selling products online that your supplier sends directly to your customer, so you never hold stock. It's legal, it needs little money to start, and it can be profitable, but only if you get four things right: your legal set-up, your suppliers, your pricing and your automation.

This guide walks through each one in order, with the UK-specific details most generic guides skip.

## 1. Is dropshipping legal in the UK?

Yes. Dropshipping is a normal retail model. What matters is that you meet the same obligations as any other UK online seller:

- **Consumer law.** Online buyers usually have 14 days to cancel and a further 14 days to return the item. Goods must be as described and of satisfactory quality.
- **Tax.** Income from dropshipping is taxable. Register with HMRC as a sole trader or set up a limited company.
- **VAT.** Register once your VAT-taxable turnover goes over £90,000 in a rolling 12 months.
- **Marketplace rules.** Every marketplace has a policy on who may fulfil orders. Some forbid buying from another retailer to ship to your customer. Check before you list.

More detail: [Is dropshipping legal in the UK?](/blog/is-dropshipping-legal-uk)

## 2. How do you set up a UK dropshipping business?

| Step | What to do |
|---|---|
| Business structure | Sole trader (simplest) or limited company |
| HMRC | Register for Self Assessment, or Corporation Tax for a company |
| Bank account | A separate business account makes bookkeeping far easier |
| Records | Keep every sale, supplier invoice, fee and refund |
| Insurance | Consider product liability cover, especially for electrical or children's items |

Our step-by-step guide to [starting a dropshipping business in the UK](/blog/start-dropshipping-business-uk) covers each of these.

## 3. How do you find UK dropshipping suppliers?

Your supplier decides your delivery speed, product quality and margin, so choose carefully. Look for:

- **UK stock.** Delivery in one to three days keeps reviews positive and returns low.
- **Single-order fulfilment** with no minimum order.
- **Reliable stock data**, ideally a feed or API you can sync with.
- **Unbranded packaging** or packaging you are allowed to use.
- **Clear returns terms** that let you meet UK consumer law.

Read [How to choose UK dropshipping suppliers](/blog/uk-dropshipping-suppliers) for a vetting checklist.

## 4. Where should you sell?

| Channel | Pros | Watch out for |
|---|---|---|
| Your own website | Full control, no commission | You must bring every visitor yourself |
| OnBuy | Growing UK marketplace, less crowded than Amazon | Commission on every sale; follow its seller policies |
| eBay | Huge UK audience | Strict rules on where dropshipped items may come from |
| Amazon | The largest UK audience | Strict dropshipping policy and intense competition |

Many sellers start on one marketplace to prove a product sells, then add channels. See [UK online marketplaces: where to sell](/blog/uk-online-marketplaces).

## 5. How should you price dropshipped products?

Pricing is where most UK dropshippers win or lose. Build every price from the bottom up:

1. **Cost:** supplier price plus delivery.
2. **Profit:** a percentage, with a minimum in pounds so cheap items still earn.
3. **Fees:** divide by what's left after percentage fees and VAT.

Example: an item costs £13.90 delivered. You want 25% profit (£3.48). With 15% commission, the price is (13.90 + 3.48) ÷ 0.85 = £20.45. Check your own numbers in the [OnBuy fee calculator](/onbuy-fee-calculator).

Then set a **floor**: the lowest price you'll ever accept, even against a cheaper rival. Our guide to [floor prices](/blog/floor-price) explains how.

## 6. How do you keep stock and prices in sync?

Supplier prices and stock change daily. If your listings don't follow, you either sell at a loss or sell items you can't send. Both damage your account. The fix is automation:

- Check every supplier price several times a day.
- Set listings out of stock the moment the supplier runs out.
- Treat sudden huge price drops as errors until confirmed.

For OnBuy sellers sourcing from Amazon UK, [SellSail](/features) does all three: it reads live Amazon prices, sets OnBuy prices that cover every fee and your profit, and updates OnBuy every few minutes.

## 7. How do you handle orders and customers?

- **Order fast.** Place the supplier order the same day the customer pays.
- **Share tracking** as soon as you have it.
- **Answer messages quickly**, even if only to say you're checking with the supplier.
- **Handle returns** under UK consumer law, then recover what you can from the supplier.

See [Customer service for dropshippers](/blog/dropshipping-customer-service).

## 8. What mistakes should you avoid?

The costly ones: pricing without fees and VAT, slow suppliers, no stock sync, copying supplier photos you aren't licensed to use, and ignoring marketplace rules. We list twelve in [Dropshipping mistakes UK sellers make](/blog/dropshipping-mistakes).

## Your next step

Start small: one channel, a handful of products you've priced properly, and automation for price and stock from day one. If your channel is OnBuy and your source is Amazon UK, you can [try SellSail free for 14 days](/signup), no card needed.`,
  },
  {
    slug: "uk-dropshipping-suppliers",
    title: "UK dropshipping suppliers: how to find and vet the right one",
    description:
      "How to find reliable UK dropshipping suppliers, wholesalers and manufacturers: where to look, what to ask, a vetting checklist, and red flags that cost sellers money.",
    keyword: "dropshipping suppliers uk",
    secondary: ["uk dropshipping suppliers", "dropshipping distributors uk", "drop shipping manufacturers uk", "best dropshipping suppliers uk", "uk based dropshipping suppliers"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 9,
    takeaways: [
      "A good UK supplier ships single orders from UK stock within one to two working days, with no minimum order.",
      "Ask for a live stock and price feed: without one you can't keep listings accurate.",
      "Order samples, test delivery times yourself and check returns terms before listing anything.",
      "Price from the supplier's delivered cost, not the headline price, so fees and shipping never surprise you.",
    ],
    faq: [
      {
        q: "Are there free UK dropshipping suppliers?",
        a: "Many suppliers charge nothing to join and simply bill you per order. Others charge a monthly fee for access or for a stock feed. A fee isn't a bad sign if the supplier's stock, prices and delivery are reliable.",
      },
      {
        q: "Is it better to use UK or overseas dropshipping suppliers?",
        a: "UK suppliers cost more per item but deliver in days, which means better reviews, fewer refunds and fewer customs or VAT complications. Overseas suppliers suit low-cost items where buyers accept long delivery.",
      },
      {
        q: "How do I know a dropshipping supplier is legitimate?",
        a: "Check that it's a registered company, ask for references, order samples to your own address, and test how fast and accurately it updates stock. Be wary of suppliers that won't share company details or demand large upfront fees.",
      },
      {
        q: "Can I use more than one supplier?",
        a: "Yes, and many sellers do so they have a backup when one runs out. Keep each listing linked to one supplier at a time so price and stock stay accurate.",
      },
    ],
    related: ["dropshipping-uk-guide", "best-dropshipping-products-uk", "dropshipping-profit-margins", "stock-sync-dropshipping"],
    md: `The best UK dropshipping suppliers ship single orders from UK warehouses within a day or two, keep stock data accurate, and let you return faulty items without a fight. Finding one is less about a magic list and more about knowing what to check. This guide gives you the places to look, the questions to ask and a checklist to score each supplier.

## What does a dropshipping supplier actually do?

A dropshipping supplier holds stock and, when you send them an order, packs it and ships it directly to your customer under your name or unbranded. You pay the supplier's trade price; your customer pays your retail price. Suppliers fall into three groups:

| Type | Who they are | Typical strengths |
|---|---|---|
| Manufacturers | Make the product | Best prices, but often want minimum orders |
| Wholesalers and distributors | Buy from manufacturers and resell | Wide ranges, trade prices, many offer dropshipping |
| Dropshipping platforms | Aggregate many suppliers in one catalogue | Easy to start, feeds and integrations included |

## Where can you find UK dropshipping suppliers?

1. **Ask manufacturers directly.** If you know a product sells, contact the brand and ask who their UK distributors are and whether any dropship.
2. **Trade directories and wholesale marketplaces.** Search for UK wholesalers in your category and ask whether they fulfil single orders.
3. **Dropshipping platforms with UK warehouses.** These connect you to many suppliers at once and usually include a stock feed.
4. **Trade shows.** UK retail and gift fairs are a fast way to meet suppliers face to face.
5. **Large retailers.** Some sellers fulfil from big UK retailers such as Amazon. This has its own rules: see [Amazon dropshipping in the UK](/blog/amazon-dropshipping).

## What should you ask a supplier before signing up?

- Do you ship single orders, and is there a minimum order or monthly fee?
- Where is your stock held, and what are your dispatch cut-off times?
- Which couriers do you use, and do you provide tracking?
- Do you send unbranded packaging, or can you include my packing slip?
- How do you share stock and prices: a live feed, a daily file, or an API?
- How quickly is stock updated when an item sells out?
- What happens with faulty items, wrong items and customer returns?
- Can I use your product photos and descriptions?

## How do you vet a UK dropshipping supplier?

Score each supplier on this checklist before you list a single product:

| Check | Pass looks like |
|---|---|
| Company details | Registered UK company, VAT number if VAT-registered, real address |
| Sample order | Arrives on time, well packed, matches the description |
| Delivery speed | One to three working days to a UK address |
| Stock accuracy | Feed updates at least daily, ideally hourly |
| Price stability | Few unannounced price changes |
| Returns | Faulty and wrong items accepted back without dispute |
| Support | Replies within one working day |

> Order a sample to your own address and time it. A supplier who promises next-day dispatch but takes four days will cost you reviews and account health.

## What red flags should you watch for?

- No company number or address, or a refusal to share them.
- Large upfront "membership" fees with no trial.
- Prices far below every competitor, which often means counterfeit or grey stock.
- No stock feed at all: you'll be guessing what's available.
- Product photos copied from other brands.

## How do supplier prices affect your profit?

Always price from the **delivered** cost: the trade price plus the supplier's delivery charge per order. Then add your profit and divide by what's left after marketplace fees. A supplier that's £1 cheaper per item but charges £3.95 per delivery can be worse than one that's £1 dearer with free delivery. Our guide to [dropshipping profit margins](/blog/dropshipping-profit-margins) shows how to compare suppliers properly.

## How do you keep supplier stock and prices in sync?

Even the best supplier changes prices and runs out of stock. Your listings need to follow within minutes, not days:

- Import the supplier's stock and price feed automatically.
- Re-price every listing whenever the supplier's cost changes.
- Set listings to zero stock when the supplier runs out.

Read [Stock sync for dropshippers](/blog/stock-sync-dropshipping) for how to set this up. If you sell on OnBuy and source from Amazon UK, [SellSail](/features) reads the Amazon price for each listing and updates OnBuy's price and stock every few minutes.

## Summary

The right UK dropshipping supplier is fast, accurate and honest about returns. Vet every supplier with a sample order, insist on a stock feed, and price from the delivered cost. Then automate the syncing so your listings never drift from reality.`,
  },
  {
    slug: "amazon-dropshipping",
    title: "Amazon dropshipping in the UK: how it works and the rules",
    description:
      "Amazon dropshipping explained for UK sellers: selling on Amazon versus sourcing from Amazon, the policies that apply, the risks, and how to price and sync stock safely.",
    keyword: "amazon dropshipping",
    secondary: ["amazon dropshipping uk", "dropshipping from amazon", "amazon to onbuy dropshipping"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 9,
    takeaways: [
      "\"Amazon dropshipping\" means two different things: selling on Amazon with a dropshipping supplier, or sourcing from Amazon to fulfil orders elsewhere.",
      "Amazon's own policy allows dropshipping on Amazon only if you are the seller of record and remove other sellers' branding.",
      "Sourcing from Amazon UK gives fast, reliable delivery, but check Amazon's conditions of use and your selling marketplace's rules.",
      "Amazon prices change constantly, so your selling price and stock must follow them automatically.",
    ],
    faq: [
      {
        q: "Is Amazon dropshipping allowed?",
        a: "Amazon allows dropshipping on its marketplace if you are the seller of record, you are identified as the seller on packing slips and invoices, you remove packing slips or invoices that identify another seller, and you handle returns. Check Amazon Seller Central for the current policy.",
      },
      {
        q: "Can I buy from Amazon and sell on OnBuy?",
        a: "Many sellers do. You remain the seller of record on OnBuy and are responsible for delivery times, returns and customer service. Read OnBuy's seller policies and Amazon's conditions of use, and price every listing from the current Amazon price plus fees.",
      },
      {
        q: "Why do Amazon dropshipping prices need updating so often?",
        a: "Amazon prices change many times a day as sellers compete and stock moves. A listing priced from yesterday's Amazon price can be loss-making today, so prices and stock should be updated automatically.",
      },
    ],
    related: ["amazon-to-onbuy-dropshipping-step-by-step", "dropshipping-uk-guide", "what-is-an-asin", "stock-sync-dropshipping"],
    md: `"Amazon dropshipping" is used for two different businesses, and the rules are different for each. Either you **sell on Amazon** and a supplier ships your orders, or you **source from Amazon**, buying items there to fulfil orders you took on another marketplace or your own site. This guide covers both, with the UK details that matter.

## What are the two kinds of Amazon dropshipping?

| Model | You sell on | You buy from | Main rules to follow |
|---|---|---|---|
| Dropshipping on Amazon | Amazon | A wholesaler or manufacturer | Amazon's dropshipping policy |
| Dropshipping from Amazon | OnBuy, eBay or your site | Amazon UK | Your marketplace's rules and Amazon's conditions of use |

## What is Amazon's dropshipping policy?

Amazon allows dropshipping on its marketplace, with conditions. In short, you must:

- be the seller of record of the products;
- identify yourself as the seller on all packing slips, invoices and external packaging;
- remove any packing slips, invoices or other information that identify a third-party dropshipper before the order is shipped;
- be responsible for accepting and processing customer returns;
- comply with all other terms of your seller agreement.

Amazon does not allow buying products from another online retailer and having that retailer ship directly to your Amazon customers. Policies change, so always check the current version in Seller Central before you start.

## How does dropshipping from Amazon UK work?

Here the customer buys from you on another channel, such as OnBuy, and you buy the item on Amazon UK with the customer's delivery address.

1. You list a product on OnBuy that is available on Amazon UK.
2. A customer orders it on OnBuy.
3. You buy it on Amazon UK and enter the customer's address.
4. Amazon delivers it; you add the tracking to the OnBuy order.

Why sellers like it: Amazon's fulfilment network is fast and reliable, prices are visible, and there's a huge range. Why it's hard: Amazon prices change constantly, packaging may show Amazon branding, and margins are thin.

> Whatever you sell on, you are the seller of record. Late deliveries, returns and complaints are yours to handle, and they count against your account on that marketplace.

## Which Amazon offers are safe to source from?

Not every Amazon offer is equal. The safest ones to fulfil from are:

- **Fulfilled by Amazon** (FBA) or sold by Amazon itself, for fast and predictable delivery.
- **In stock now**, not "usually dispatched within 1 to 2 months".
- **Dispatched within 48 hours**, so you can promise a short dispatch time.

Avoid offers from slow third-party sellers: one late order can cost you more than the profit from ten good ones.

## How do you price Amazon-sourced listings?

Start from the Amazon price including delivery, then add profit and fees:

1. **Amazon cost:** item price plus delivery.
2. **Profit:** a percentage, with a minimum in pounds.
3. **Fees:** divide by what's left after commission and payment fees.

Example: Amazon price £13.90 delivered, 25% profit, 15% commission: (13.90 + 3.48) ÷ 0.85 = £20.45. Try your own numbers in our [OnBuy fee calculator](/onbuy-fee-calculator), and see the full method in [Amazon to OnBuy dropshipping, step by step](/blog/amazon-to-onbuy-dropshipping-step-by-step).

## Why do you need to sync Amazon prices and stock?

Amazon prices can change several times a day. If yours don't follow:

- the Amazon price rises and your OnBuy price no longer covers it, so you sell at a loss;
- the item goes out of stock on Amazon and you take orders you can't fill;
- a mispriced Amazon offer tempts you to drop your price for no real reason.

The answer is automation. [SellSail](/features) reads the current Amazon UK offer for every ASIN (fulfilled by Amazon, in stock, dispatched within 48 hours), recalculates your OnBuy price with fees and profit built in, and sets listings out of stock as soon as Amazon runs out. Sudden large price drops are checked again before they're used.

## How do you map Amazon products to your listings?

Every Amazon product has an [ASIN](/blog/what-is-an-asin), a 10-character identifier. Put the ASIN in your listing's [SKU](/blog/sku-meaning), for example "AMZ-B0XXXXXXXX", so your tools always know which Amazon product a listing comes from.

## Is Amazon dropshipping worth it?

Sourcing from Amazon UK can work well for sellers on other marketplaces, especially OnBuy, because delivery is fast and data is reliable. It only stays profitable if every price is built from the current Amazon cost and every listing goes out of stock when Amazon does. Do that automatically and it's one of the simplest ways to run a UK dropshipping business. [Try SellSail free for 14 days](/signup).`,
  },
  {
    slug: "is-onbuy-legit",
    title: "Is OnBuy legit? An honest look for UK sellers (and buyers)",
    description:
      "Is OnBuy legit and safe? What OnBuy is, how it works, what its Trustpilot reviews say, and what UK sellers should weigh up before listing products on the marketplace.",
    keyword: "is onbuy legit",
    secondary: ["onbuy trustpilot", "is onbuy safe", "onbuy reviews", "is onbuy good for sellers"],
    category: "Selling on OnBuy",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "OnBuy is a genuine UK online marketplace, run by a UK company, where independent sellers list products for buyers.",
      "Buyer experience depends on the individual seller, which is why reviews on sites like Trustpilot are mixed.",
      "For sellers it's a less crowded alternative to Amazon and eBay, with commission charged on each sale.",
      "Sellers do best when they price from real costs, dispatch fast and keep stock accurate.",
    ],
    faq: [
      {
        q: "Is OnBuy a real company?",
        a: "Yes. OnBuy is a UK-based online marketplace operated by a registered UK company. It connects independent retailers with buyers, in a similar way to eBay or Amazon's third-party marketplace.",
      },
      {
        q: "Is it safe to buy on OnBuy?",
        a: "OnBuy processes payments itself, so buyers don't pay sellers directly. As on any marketplace, check the individual seller's rating and the delivery estimate before you buy.",
      },
      {
        q: "Is OnBuy good for sellers?",
        a: "It can be. It is less crowded than Amazon, so listings face fewer competitors, and fees are commission-based. Success depends on competitive pricing, fast dispatch and accurate stock.",
      },
      {
        q: "Why are OnBuy's Trustpilot reviews mixed?",
        a: "On a marketplace, delivery and service depend on many different sellers. Reviews often reflect one seller's late delivery or a returns dispute, rather than the platform itself.",
      },
    ],
    related: ["how-to-sell-on-onbuy", "onbuy-vs-amazon", "onbuy-vs-ebay", "onbuy-fees-explained"],
    md: `Yes, OnBuy is legit. It's a real UK online marketplace, operated by a registered UK company, where independent retailers sell to buyers in a similar way to eBay or the third-party side of Amazon. Whether it's right for you depends on which side you're on, and as a seller, on how well you run your listings.

This article looks at OnBuy honestly from both sides, then focuses on what UK sellers should weigh up.

## What is OnBuy?

OnBuy is an online marketplace based in the UK. It doesn't sell most products itself; instead, thousands of independent sellers list their products, and OnBuy provides the website, the payment system and the rules. Buyers pay OnBuy, and OnBuy pays sellers after taking its fees.

That model is the same as other big marketplaces, and it explains most of what you'll read about OnBuy online.

## Is OnBuy safe for buyers?

For buyers, the key points are:

- **Payments go through OnBuy**, not directly to the seller.
- **Each product is sold by an individual seller**, so delivery speed and service vary.
- **UK consumer law applies**: buyers usually have 14 days to cancel an online order and goods must be as described.

As with any marketplace, the sensible checks are the seller's rating, the stated delivery time and the returns information on the listing.

## What do OnBuy's Trustpilot reviews say?

"OnBuy Trustpilot" and "is OnBuy legit" are searched thousands of times a month in the UK, so reviews clearly matter to people. Reviews of marketplaces are usually mixed for a simple reason: the platform is judged on the behaviour of many different sellers. One slow seller or a disputed return produces a one-star review for the whole marketplace.

> For a seller, that's a reminder: on a marketplace, your service is the platform's reputation. Fast dispatch and honest listings are what earn good reviews.

## Is OnBuy good for sellers?

Here's a balanced view for UK sellers.

| Pros | Cons |
|---|---|
| Less crowded than Amazon, so fewer competitors per listing | Smaller audience than Amazon or eBay |
| Commission-based fees: you pay when you sell | Commission comes out of every sale, so pricing must cover it |
| UK-focused buyers | You must meet OnBuy's dispatch and service standards |
| API access for automating listings, prices and stock | Prices still need watching against other OnBuy sellers |

Our detailed comparisons: [OnBuy vs Amazon](/blog/onbuy-vs-amazon) and [OnBuy vs eBay](/blog/onbuy-vs-ebay).

## What does it cost to sell on OnBuy?

OnBuy charges commission on each sale, which varies by category, and has seller plans. Commission is usually taken from the full amount the buyer pays, including VAT and delivery, which catches out many new sellers. We explain this with a worked example in [OnBuy fees explained](/blog/onbuy-fees-explained), and you can check your own numbers with the [OnBuy fee calculator](/onbuy-fee-calculator). Always confirm current rates in OnBuy's own seller documentation.

## What makes sellers successful on OnBuy?

1. **Prices built from real costs.** Every price should cover your cost, commission, VAT if you're registered, and a minimum profit.
2. **Competitive, not cheapest.** Undercut cheaper sellers by a few pence where your margin allows, and hold your price where it doesn't.
3. **Fast, reliable dispatch.** Set dispatch times you can always keep.
4. **Accurate stock.** Never leave a listing live when you can't supply it.

For sellers who source from Amazon UK, [SellSail](/features) automates the first, second and fourth points: it reads live Amazon prices, sets OnBuy prices with fees and profit built in, answers cheaper sellers down to your floor, and syncs stock every few minutes.

## Verdict

OnBuy is a legitimate UK marketplace. For buyers, it works like any other marketplace: check the seller. For sellers, it's a genuine opportunity with less competition than the biggest platforms, provided your prices cover your costs and your service is fast. Ready to start? Read [How to sell on OnBuy](/blog/how-to-sell-on-onbuy).`,
  },
];
