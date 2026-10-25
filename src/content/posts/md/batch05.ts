import type { Post } from "../types";

// Batch 5: OnBuy account and returns, and channel-specific dropshipping
// (AliExpress, eBay, Shopify). 20–30 Nov.
export const batch05: Post[] = [
  {
    slug: "onbuy-seller-account",
    title: "OnBuy seller account: a checklist for getting set up",
    description:
      "Setting up an OnBuy seller account: what you need before you apply, the documents and details to prepare, choosing a plan, and what to do in your first week as a seller.",
    keyword: "onbuy seller account",
    secondary: ["onbuy seller", "onbuy seller registration", "become an onbuy seller"],
    category: "Selling on OnBuy",
    date: "2026-11-20",
    readingMinutes: 7,
    takeaways: [
      "Prepare business, identity, bank and VAT details before you apply to speed up approval.",
      "Choose a seller plan based on how many orders you expect, and check OnBuy's current terms.",
      "Set realistic dispatch times and returns details from day one.",
      "Create your API keys once you're live if you plan to automate prices and stock.",
    ],
    faq: [
      {
        q: "Who can open an OnBuy seller account?",
        a: "Businesses selling to UK buyers, including sole traders and limited companies. OnBuy sets its own eligibility and verification requirements, so check its seller centre for the current criteria.",
      },
      {
        q: "Do I need to be VAT-registered to sell on OnBuy?",
        a: "Not necessarily. You need to register for VAT once your taxable turnover passes the UK threshold. If you're registered, give OnBuy your VAT number.",
      },
      {
        q: "How long does OnBuy seller approval take?",
        a: "It varies with verification checks. Having your business, identity and bank details ready, and making sure they match exactly, helps it go faster.",
      },
    ],
    related: ["how-to-sell-on-onbuy", "onbuy-api-keys", "onbuy-listing-optimisation", "onbuy-fees-explained"],
    md: `To open an OnBuy seller account you apply through OnBuy's seller sign-up, verify your business and identity, add bank details for payouts, and choose a seller plan. The process is straightforward if you have everything ready. Use this checklist so nothing holds up approval.

## What do you need before you apply?

| Item | Details |
|---|---|
| Business type | Sole trader or limited company |
| Business details | Trading name, address, and company number if a limited company |
| Identity | Photo ID and proof of address for the account holder |
| Bank account | For payouts; a business account keeps bookkeeping simple |
| VAT number | If you're VAT-registered |
| Contact details | A monitored email and phone number |
| Products | A rough idea of categories, volumes and barcodes (EANs) |

Make sure names and addresses match exactly across your documents and bank account. Mismatches are a common reason for delays.

## How do you choose a seller plan?

OnBuy offers seller plans with different monthly costs and features, and charges commission on each sale. Compare them against how many orders you expect, and check the current details in OnBuy's seller centre, since plans and fees change. Our [OnBuy fees guide](/blog/onbuy-fees-explained) explains how commission works, and the [fee calculator](/onbuy-fee-calculator) shows what you'll keep from each sale.

## What should you set up in your first week?

1. **Dispatch times** you can always keep. Late dispatch hurts your account.
2. **Delivery options and charges.**
3. **Returns details**, in line with UK consumer law.
4. **Your first listings**, matched to the catalogue by EAN. See [listing optimisation](/blog/onbuy-listing-optimisation).
5. **API keys**, if you'll automate. See [OnBuy API keys explained](/blog/onbuy-api-keys).

## What mistakes should new sellers avoid?

- Listing hundreds of products before checking margins on a few.
- Promising next-day dispatch when your supplier takes two days.
- Pricing without commission and VAT.
- Leaving listings live when you can't supply them.

## Automate once you're live

When your account is approved, connect your OnBuy API keys to [SellSail](/signup) to price every listing from the live Amazon UK cost, compete against cheaper sellers down to your floor, and keep stock in sync. There's a 14-day free trial and you don't need Amazon API keys. Next: [How to sell on OnBuy](/blog/how-to-sell-on-onbuy).`,
  },
  {
    slug: "onbuy-returns",
    title: "Handling returns on OnBuy without losing money",
    description:
      "How OnBuy sellers can handle returns and refunds under UK consumer law, reduce return rates, and protect margin, including what dropshippers should agree with suppliers.",
    keyword: "onbuy returns",
    secondary: ["onbuy refunds", "onbuy return policy seller", "marketplace returns uk"],
    category: "Selling on OnBuy",
    date: "2026-11-23",
    readingMinutes: 7,
    takeaways: [
      "UK online buyers can usually cancel within 14 days of delivery and then have 14 days to send goods back.",
      "Refunds are due within 14 days of getting the goods back (or proof they were sent).",
      "Most returns are caused by inaccurate listings or slow delivery, both of which you can fix.",
      "Build a small returns allowance into your prices and agree returns terms with suppliers.",
    ],
    faq: [
      {
        q: "Do I have to accept returns on OnBuy?",
        a: "Yes. UK consumer law gives online buyers the right to cancel most purchases within 14 days of delivery, and faulty goods must be dealt with too. OnBuy also has its own returns requirements for sellers.",
      },
      {
        q: "Who pays for return postage?",
        a: "For change-of-mind returns, the buyer can be asked to pay if you've told them so before purchase. For faulty or incorrectly described items, the seller pays.",
      },
      {
        q: "How do dropshippers handle returns?",
        a: "Agree with your supplier where returns go and whether they refund you. You still owe the buyer a refund on time even if the supplier is slow.",
      },
    ],
    related: ["dropshipping-customer-service", "how-to-sell-on-onbuy", "hidden-costs-of-selling-online", "onbuy-listing-optimisation"],
    md: `Returns are part of selling online, and on OnBuy, as everywhere in the UK, they're governed by consumer law as well as the marketplace's own rules. Handle them well and they barely dent your margin; handle them badly and they cost you money and seller rating. Here's what UK sellers need to know.

## What does UK law say about online returns?

Under the Consumer Contracts Regulations, most online purchases come with a right to cancel:

| Step | Time limit |
|---|---|
| Buyer cancels | Within 14 days of receiving the goods |
| Buyer sends goods back | Within 14 days of telling you they're cancelling |
| You refund | Within 14 days of getting the goods back, or proof they were sent |

Under the Consumer Rights Act, goods must also be of satisfactory quality, fit for purpose and as described; faulty goods have additional remedies. Some items, such as personalised goods, are exempt from change-of-mind returns.

OnBuy also sets requirements for how sellers handle returns. Check its seller policies for the current rules.

## Why do buyers return items?

- The item didn't match the description or photos.
- It arrived late or damaged.
- Wrong size, colour or variant.
- They changed their mind.

The first three are within your control.

## How do you reduce returns?

1. **Write accurate listings** with exact dimensions, compatibility and what's in the box.
2. **Use real photos** of the product you're sending.
3. **Promise dispatch times you can keep.**
4. **Pack well**, or choose suppliers who do.
5. **Answer questions quickly** before the sale.

## How should dropshippers handle returns?

When a supplier ships for you, agree before you start:

- the returns address: yours or the supplier's;
- whether the supplier refunds you for faulty or wrong items;
- how quickly they process returns.

You still owe the buyer a refund within the legal time, even if the supplier is slow. See [Customer service for dropshippers](/blog/dropshipping-customer-service).

## How do you protect your margin?

- **Price in a returns allowance.** If 3% of a product comes back, your margin needs to cover it.
- **Track return rates per product** and drop products that are consistently returned.
- **Use a minimum profit in pounds** so cheap items still cover the odd refund.

SellSail's margin bands include a minimum profit for exactly this reason. [See how pricing works](/features). Related: [Hidden costs of selling online](/blog/hidden-costs-of-selling-online).`,
  },
  {
    slug: "aliexpress-dropshipping-uk",
    title: "AliExpress dropshipping in the UK: what to know before you start",
    description:
      "AliExpress dropshipping for UK sellers: delivery times, VAT on imports, product quality, marketplace rules, pricing for profit, and when UK suppliers are a better choice.",
    keyword: "aliexpress dropshipping uk",
    secondary: ["aliexpress uk dropshipping", "dropshipping from aliexpress to uk", "alidropship uk"],
    category: "Dropshipping",
    date: "2026-11-25",
    readingMinutes: 8,
    takeaways: [
      "AliExpress offers low prices and a huge range, but delivery to the UK can take much longer than UK suppliers.",
      "For orders of £135 or less shipped to the UK, UK VAT is generally collected at the point of sale.",
      "Long delivery times must be reflected in the dispatch and delivery times you promise.",
      "Order samples, check product safety rules, and price from the total delivered cost.",
    ],
    faq: [
      {
        q: "Is AliExpress dropshipping still worth it in the UK?",
        a: "It can be for low-cost, lightweight products where buyers accept longer delivery. For fast-moving products and marketplaces with strict delivery standards, UK-based suppliers are often safer.",
      },
      {
        q: "Do I pay VAT on AliExpress orders to the UK?",
        a: "For goods worth £135 or less sent to UK addresses, UK VAT is generally charged at checkout rather than at the border. Speak to an accountant about how this applies to your business.",
      },
      {
        q: "Can I sell AliExpress products on OnBuy?",
        a: "You can list products on OnBuy as long as you meet OnBuy's rules, including dispatch and delivery times, product safety and returns. Check OnBuy's seller policies first.",
      },
    ],
    related: ["dropshipping-uk-guide", "uk-dropshipping-suppliers", "vat-for-online-sellers-uk", "dropshipping-profit-margins"],
    md: `AliExpress dropshipping means listing products from AliExpress sellers in your shop and having them ship orders straight to your UK customers. It's cheap to start and the range is enormous, but delivery times, VAT and product quality need careful handling if you sell to UK buyers.

## How does AliExpress dropshipping work?

1. Choose a product from an AliExpress seller.
2. List it on your website or a marketplace at a higher price.
3. When a customer orders, buy it on AliExpress with their address.
4. The AliExpress seller ships it; you pass the tracking to your customer.

## What are the pros and cons for UK sellers?

| Pros | Cons |
|---|---|
| Very low product prices | Delivery can take weeks |
| Huge product range | Variable quality and packaging |
| No minimum orders | Branding and photos may not be usable |
| Easy to test products | Returns are harder to manage |

Some AliExpress sellers hold stock in UK or European warehouses, which shortens delivery a lot. Filter for these where you can.

## How does VAT work on AliExpress orders to the UK?

Since 2021, for goods worth £135 or less sent to UK addresses, UK VAT is generally collected at the point of sale rather than at the border, often by the marketplace. Above £135, import VAT and possibly duty are due on import. If you're VAT-registered, the details affect what you can reclaim, so take advice from an accountant. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## What rules do you need to follow?

- **Delivery promises.** Set dispatch and delivery times that reflect real shipping times. Late deliveries hurt your rating.
- **Product safety.** Products sold in the UK must meet UK safety rules, especially electricals, toys and cosmetics.
- **Marketplace policies.** Check each marketplace's rules on dropshipping and delivery standards.
- **Images.** Only use photos you're allowed to use.

## How do you price AliExpress products?

Use the total delivered cost: item price, shipping and any VAT you can't reclaim. Then add profit and divide by what's left after fees. Cheap items need a **minimum profit in pounds**; 30% of £3 is only 90p. See [Dropshipping profit margins](/blog/dropshipping-profit-margins).

## When are UK suppliers better?

When delivery speed matters (most marketplaces), when products are regulated, or when returns are frequent. Read [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers).

## AliExpress and SellSail

SellSail currently prices OnBuy listings from Amazon UK. AliExpress as a source is coming soon, with the same margin bands, competition and safety brakes. [See what's available today](/features).`,
  },
  {
    slug: "ebay-dropshipping-uk",
    title: "eBay dropshipping UK: the rules and how to do it properly",
    description:
      "eBay dropshipping in the UK: what eBay's policy allows, using wholesale suppliers, pricing with eBay fees, delivery standards, and alternatives like OnBuy.",
    keyword: "ebay dropshipping uk",
    secondary: ["ebay dropshipping", "dropshipping on ebay uk", "ebay dropshipping suppliers uk"],
    category: "Dropshipping",
    date: "2026-11-27",
    readingMinutes: 7,
    takeaways: [
      "eBay allows dropshipping from wholesale suppliers, but not buying from another retailer to ship to your eBay buyer.",
      "You remain responsible for delivery times, item condition and returns.",
      "Price from your delivered cost plus eBay's fees and your profit.",
      "Many sellers run eBay alongside other marketplaces such as OnBuy to spread risk.",
    ],
    faq: [
      {
        q: "Is dropshipping allowed on eBay UK?",
        a: "eBay allows dropshipping when you source from a wholesale supplier. Listing an item and then buying it from another retailer or marketplace to ship directly to your buyer isn't allowed. Check eBay's current dropshipping policy.",
      },
      {
        q: "Can I dropship from Amazon to eBay?",
        a: "Buying from Amazon to ship directly to an eBay buyer is the kind of retail-to-retail dropshipping eBay's policy doesn't allow.",
      },
      {
        q: "What happens if I break eBay's dropshipping policy?",
        a: "eBay may remove listings, limit your selling or suspend your account. Read the policy carefully before you start.",
      },
    ],
    related: ["dropshipping-uk-guide", "uk-dropshipping-suppliers", "onbuy-vs-ebay", "multichannel-selling-uk"],
    md: `eBay allows dropshipping in the UK, but with an important condition: you must source from a **wholesale supplier**. Listing an item and then buying it from another retailer or marketplace to send directly to your buyer is not allowed. Get this right and eBay can be a solid dropshipping channel; get it wrong and you risk your account.

## What does eBay's dropshipping policy say?

In summary, eBay's policy:

- **allows** dropshipping from wholesale suppliers;
- **doesn't allow** listing an item and then buying it from another retailer or marketplace that ships it directly to your buyer;
- holds you responsible for the item arriving on time and as described.

Policies change, so read eBay's current dropshipping policy before you start.

## How do you dropship on eBay properly?

1. **Find a UK wholesale supplier** that ships single orders. See [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers).
2. **Agree terms:** dispatch times, returns and stock updates.
3. **List with accurate dispatch times.**
4. **Sync stock** so you never sell what the supplier doesn't have.
5. **Price from cost plus eBay's fees** and your profit.

## How do you price for eBay?

eBay charges final value fees on the total amount of the sale, including delivery, plus other possible fees. The method is the same as any marketplace: start with your delivered cost, add profit, and divide by what's left after percentage fees. Check eBay's current fee pages for the rates in your category, and use our [profit margin formula](/blog/profit-margin-formula) guide.

## What about delivery standards?

eBay measures sellers on late delivery, cancellations and item-not-as-described cases. Dropshippers are especially exposed because they depend on the supplier, so pick suppliers with fast, tracked delivery and promise times you can always meet.

## eBay vs other marketplaces for dropshipping

| | eBay | OnBuy |
|---|---|---|
| Audience | Very large | Smaller, UK-focused |
| Competition per listing | High | Lower |
| Dropshipping rules | Wholesale suppliers only | Check OnBuy's seller policies |

Many sellers run both. Compare them in [OnBuy vs eBay](/blog/onbuy-vs-ebay) and [Multichannel selling in the UK](/blog/multichannel-selling-uk).

## Where SellSail fits

SellSail currently reprices OnBuy listings from Amazon UK; eBay as a marketplace is coming soon. [See what's available today](/features).`,
  },
  {
    slug: "shopify-dropshipping-uk",
    title: "Shopify dropshipping UK: setting up a store that profits",
    description:
      "Shopify dropshipping in the UK: choosing suppliers, setting up your store, UK legal pages, pricing with payment fees, and finding traffic.",
    keyword: "shopify dropshipping uk",
    secondary: ["dropshipping uk shopify", "shopify dropshipping suppliers uk", "uk dropshipping suppliers for shopify"],
    category: "Dropshipping",
    date: "2026-11-30",
    readingMinutes: 8,
    takeaways: [
      "A Shopify store gives you full control and no marketplace commission, but you must bring every visitor.",
      "Choose UK-stocked suppliers with apps or feeds so stock and prices stay in sync.",
      "UK stores need clear terms, privacy, returns and delivery information.",
      "Many sellers start on a marketplace to prove products, then add a Shopify store.",
    ],
    faq: [
      {
        q: "Is Shopify good for dropshipping in the UK?",
        a: "Shopify is a popular choice because it's easy to set up and has many supplier apps. The challenge is traffic: unlike a marketplace, you must attract every visitor through ads, search or social media.",
      },
      {
        q: "How much does Shopify dropshipping cost?",
        a: "You pay a monthly Shopify plan, payment processing fees, app subscriptions, a domain and marketing costs. Check Shopify's current UK pricing for plan costs.",
      },
      {
        q: "Should I start on Shopify or a marketplace?",
        a: "If you have no audience yet, a marketplace such as OnBuy or eBay brings buyers immediately. A Shopify store makes more sense once you know which products sell.",
      },
    ],
    related: ["dropshipping-uk-guide", "uk-dropshipping-suppliers", "multichannel-selling-uk", "sell-online-uk"],
    md: `Shopify dropshipping means running your own online store on Shopify and having suppliers ship orders to your customers. In the UK it's one of the most popular ways to start dropshipping. The upside is control and no marketplace commission; the downside is that every visitor has to be found and paid for.

## Shopify vs marketplaces for UK dropshipping

| | Shopify store | Marketplace (OnBuy, eBay) |
|---|---|---|
| Buyers | You bring them | Already there |
| Fees | Monthly plan, payment fees, apps | Commission per sale |
| Control | Full: design, brand, pricing | Limited to the marketplace's rules |
| Competition | Other stores | Other sellers on the same product page |
| Best for | Brands and niches with an audience | Proving products and reaching buyers fast |

## How do you set up a Shopify dropshipping store in the UK?

1. **Choose a niche** where you can stand out.
2. **Pick suppliers** with UK stock and a Shopify app or feed. See [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers).
3. **Set up the store:** theme, domain, payment and delivery settings in GBP.
4. **Add legal pages:** terms, privacy, cookies, returns and delivery. UK buyers expect them and consumer law requires the information.
5. **Import products** with accurate descriptions and images you can use.
6. **Price for profit**, including payment fees and app costs.
7. **Drive traffic** through search, social media, email and ads.

## How do you price on Shopify?

There's no marketplace commission, but there are payment processing fees on every order, plus monthly costs. Spread fixed costs across your expected orders when working out margins, and use a minimum profit per order. See [the profit margin formula](/blog/profit-margin-formula).

## How do you get traffic to a new store?

- **Search:** product and category pages written for what people search, plus helpful guides.
- **Social media:** short videos showing the product in use.
- **Email:** capture visitors and send offers.
- **Ads:** fast but costly; test small first.

## Should you sell on marketplaces as well?

Many UK sellers do both: marketplaces for reach and steady sales, their own store for brand and margin. Read [Multichannel selling in the UK](/blog/multichannel-selling-uk). If you add OnBuy and source from Amazon UK, [SellSail](/features) automates pricing and stock on that channel.`,
  },
];
