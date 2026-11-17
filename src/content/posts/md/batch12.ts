import type { Post } from "../types";

// Batch 12: second wave. Topics chosen from Google Keyword Planner (UK,
// pulled 17 Nov 2026); publishing order and dates are set in ../index.ts.
export const batch12: Post[] = [
  {
    slug: "black-friday-pricing-uk",
    title: "Black Friday pricing for UK online sellers: a 2026 plan",
    description:
      "Black Friday pricing for UK online sellers: when to discount, how deep to go without losing money, legal rules on 'was' prices, and how to protect your margin.",
    keyword: "black friday pricing strategy",
    secondary: ["black friday 2026 uk", "black friday discounts for sellers", "cyber monday pricing", "was price rules uk"],
    category: "Pricing",
    date: "2026-11-18",
    readingMinutes: 7,
    takeaways: [
      "Black Friday 2026 is Friday 27 November and Cyber Monday is 30 November; most UK deals now run all week.",
      "Work out your break-even price before choosing a discount. A 20% discount on a 25% margin product leaves almost nothing.",
      "A 'was' price must be a genuine price you actually charged for a meaningful period. Invented reference prices break UK consumer law.",
      "Set a floor price on every product so no promotion or repricer pushes it below cost.",
    ],
    faq: [
      {
        q: "When is Black Friday 2026 in the UK?",
        a: "Black Friday 2026 is Friday 27 November. Cyber Monday is Monday 30 November. Many UK retailers start deals on the Monday before and run them through to Cyber Monday.",
      },
      {
        q: "How much should I discount on Black Friday?",
        a: "Only as much as your margin allows. Calculate your break-even price including marketplace fees, VAT and delivery, then choose a discount that keeps you above it. For thin-margin products, a small discount or a bundle often works better than a deep cut.",
      },
      {
        q: "Can I show a 'was' price on Black Friday?",
        a: "Yes, if it is a genuine price you charged for a reasonable period before the sale. Inflating a price just before Black Friday so the discount looks bigger misleads customers and breaks UK consumer protection law.",
      },
      {
        q: "Should I discount everything on Black Friday?",
        a: "No. Discount the products that bring in new customers or clear slow stock, and keep full price on items that sell anyway or have thin margins.",
      },
    ],
    related: ["break-even-price", "floor-price", "psychological-pricing", "price-elasticity"],
    md: `A good Black Friday pricing strategy for UK sellers starts with your numbers, not your competitors. Work out each product's break-even price after fees, VAT and delivery. Pick the few products worth discounting. Set a floor price so no deal sells at a loss, and only show "was" prices you genuinely charged.

## When is Black Friday 2026?

| Date | Event |
|---|---|
| Mon 23 Nov | Many "early Black Friday" deals start |
| Fri 27 Nov | Black Friday |
| Sat 28 – Sun 29 Nov | Weekend deals |
| Mon 30 Nov | Cyber Monday |

UK shoppers now treat it as a week, not a day. If your prices only drop on Friday, you miss the early buyers.

## Step 1: know your break-even price

Before you pick a discount, work out the lowest price at which you still make nothing. That is your cost price plus delivery, marketplace commission, payment fees and VAT if you are registered. Our [break-even price guide](/blog/break-even-price) walks through the formula, and the [OnBuy fee calculator](/onbuy-fee-calculator) does it for you on OnBuy.

Here is why it matters. Take a product that sells for £30 with a 25% margin (£7.50 profit):

| Discount | Sale price | Approx. profit left |
|---|---|---|
| 10% | £27.00 | about £5.00 |
| 20% | £24.00 | about £2.50 |
| 30% | £21.00 | a loss |

Fees fall as the price falls, but your cost price does not. A deep discount on a thin-margin item can easily turn a sale into a loss.

## Step 2: choose which products to discount

Not every product needs a deal. Discount where it helps you:

- **Traffic drivers:** popular products that bring buyers to your shop, where a small cut wins the sale and the buy box.
- **Slow stock:** items you want to clear before January.
- **High-margin items:** products with room to discount and still profit.

Leave thin-margin products and steady sellers at full price. They will sell anyway.

## Step 3: set a floor price on everything

Black Friday is when competitors cut hardest, and when automatic repricing can run away with you. A [floor price](/blog/floor-price) is the lowest price you will ever accept. Set one per product, above break-even, before the week starts. A [repricer](/blog/what-is-a-repricer) that respects your floor can follow competitors down to that point and no further.

## Step 4: stay within UK pricing rules

UK consumer law, now enforced more strictly under the Digital Markets, Competition and Consumers Act 2024, says price comparisons must not mislead. In practice:

- A "was" price should be one you actually charged, for a meaningful period, recently.
- Do not raise prices in early November so a Black Friday "discount" looks bigger.
- Show the full price, including any compulsory charges, up front.

If you are unsure, compare against your own normal price rather than a "recommended" price.

## Step 5: try alternatives to a straight discount

Discounts are not the only lever:

- **Bundles:** sell two related items together at a small saving. Your average order value rises and the per-item margin holds up.
- **Free delivery over a threshold:** encourages larger baskets.
- **Price endings:** £24.99 often outperforms £25 at almost no cost (see [psychological pricing](/blog/psychological-pricing)).

## Step 6: plan stock and dispatch

Selling out on Friday afternoon costs you sales and, on marketplaces, can hurt your account if you cannot fulfil orders. If you dropship, check supplier stock levels daily during the week and keep [stock in sync](/blog/stock-sync-dropshipping) so you do not sell what you cannot ship.

## After Black Friday

Return prices to normal on a set date, and check that every product is back above its usual margin. Then plan December: publish a clear last order date for Christmas delivery, hold prices steady (shoppers care more about delivery dates than small discounts in December), and keep your floor prices in place while competitors panic-cut.`,
  },
  {
    slug: "sell-on-amazon-uk",
    title: "How to sell on Amazon UK: plans, fees and first steps",
    description:
      "How to sell on Amazon UK: setting up a seller account, Individual vs Professional plans, referral and FBA fees, VAT, and how to work out real profit per sale.",
    keyword: "sell on amazon uk",
    secondary: ["how to sell on amazon uk", "amazon fba uk", "amazon seller fees uk", "amazon professional seller fee"],
    category: "Fees and profit",
    date: "2026-11-20",
    readingMinutes: 7,
    takeaways: [
      "Amazon UK has two selling plans: Individual (a fee per item sold) and Professional (a monthly subscription).",
      "Most sales also pay a referral fee, a percentage of the total price that varies by category and is often around 15%.",
      "FBA adds fulfilment and storage fees on top. Fees are charged plus VAT for UK businesses.",
      "Always calculate profit after every fee. Headline commission alone understates the cost.",
    ],
    faq: [
      {
        q: "How much does Amazon take per sale in the UK?",
        a: "Amazon charges a referral fee on each sale, a percentage of the total sale price that depends on the category and is commonly around 15%. Some categories also have a minimum fee, and FBA sellers pay fulfilment fees on top.",
      },
      {
        q: "What is the Amazon Professional seller fee in the UK?",
        a: "The Professional plan is a monthly subscription (it has been £25 a month plus VAT). It suits sellers who sell more than about 35 items a month. The Individual plan charges a fixed fee per item sold instead. Check Amazon's current fee pages for today's rates.",
      },
      {
        q: "Are Amazon fees charged with VAT?",
        a: "Yes. Amazon charges VAT on its selling fees for UK sellers. If you are VAT registered you can usually reclaim it; if you are not, the VAT is an extra cost.",
      },
      {
        q: "Is it cheaper to sell on OnBuy than Amazon?",
        a: "OnBuy's commission rates are generally lower than Amazon's in many categories, but traffic is lower too. Compare your real profit per sale on each, after every fee.",
      },
    ],
    related: ["onbuy-vs-amazon", "onbuy-fees-explained", "hidden-costs-of-selling-online", "ebay-fees-uk"],
    md: `To sell on Amazon UK, register a seller account in Seller Central with your ID, bank and business details. Pick the Individual plan (a fee per item) or the Professional plan (monthly), list products against existing pages or create new ones, then ship orders yourself or use Fulfilment by Amazon (FBA). Each sale also pays a referral fee, often around 15%.

Fees change, so always check Amazon's current UK fee pages before you price.

## How to start selling on Amazon UK

1. **Gather your details:** photo ID, a bank account, a credit or debit card, your phone number, and your business or VAT details if you have them.
2. **Register in Seller Central** and complete identity verification. Amazon may ask for a video call or extra documents.
3. **Choose a plan** (see below).
4. **List products:** most products already have a page, so you add an offer by ASIN or EAN (see [what is an ASIN](/blog/what-is-an-asin)). Some brands and categories need approval first.
5. **Choose fulfilment:** ship orders yourself (merchant fulfilled) or send stock to Amazon (FBA).
6. **Price for profit:** work out every fee before your first sale, using the example below.

## FBA or merchant fulfilled?

| | FBA | Merchant fulfilled |
|---|---|---|
| Who stores and ships | Amazon | You (or your supplier) |
| Prime badge | Yes | Only with Seller Fulfilled Prime |
| Extra fees | Fulfilment and storage | Your own postage and packaging |
| Best for | Fast-moving, small, light items | Bulky, slow or dropshipped items |

Amazon FBA in the UK suits sellers with steady demand. Note that Amazon's rules do not allow classic dropshipping where another retailer ships to your customer, so read [Amazon dropshipping](/blog/amazon-dropshipping) first if that is your plan.

## The two selling plans

| Plan | How you pay | Best for |
|---|---|---|
| Individual | A fixed fee per item sold | Fewer than about 35 sales a month |
| Professional | A monthly subscription (historically £25 + VAT) | Regular sellers; needed for most tools and the buy box |

If you sell more than a few dozen items a month, Professional is usually cheaper and unlocks bulk listing and reports.

## Referral fees

Every sale pays a referral fee: a percentage of the **total** price the buyer pays, including delivery. The rate depends on the category. Many categories sit around 15%, some are lower (for example certain electronics), and some have a minimum fee per item.

That means a £20 item with £3.99 delivery pays commission on £23.99, not £20.

## Fulfilment by Amazon (FBA) fees

If you use FBA, you also pay:

- **Fulfilment fees** per unit, based on size and weight.
- **Monthly storage fees**, which rise in the final quarter of the year.
- **Long-term storage or ageing fees** on stock that sits too long.
- Optional fees for labelling, removal or disposal.

If you ship orders yourself (Merchant Fulfilled), you skip these but pay for your own postage and packaging.

## VAT on Amazon fees

Amazon adds VAT to its fees for UK sellers. If you are VAT registered, you can usually reclaim it. If you are not, budget for fees as 20% higher than the headline rate. Our [VAT guide for online sellers](/blog/vat-for-online-sellers-uk) explains when you need to register.

## A worked example

A £24.99 item, merchant fulfilled, 15% referral fee, VAT-registered seller:

| Line | Amount |
|---|---|
| Sale price (inc. VAT) | £24.99 |
| Output VAT (1/6) | −£4.17 |
| Referral fee (15% of £24.99) | −£3.75 |
| Cost price | −£11.00 |
| Postage and packaging | −£3.20 |
| **Profit before overheads** | **£2.87** |

That is an 11% margin on a product that "sells for £25". This is why [hidden costs](/blog/hidden-costs-of-selling-online) matter.

## How Amazon compares with other UK marketplaces

| Marketplace | Typical commission | Monthly fee |
|---|---|---|
| Amazon UK | often ~15% | Professional plan |
| eBay UK (business) | category-based, see our [eBay fees guide](/blog/ebay-fees-uk) | Optional shop subscription |
| OnBuy | generally lower in many categories, see [OnBuy fees explained](/blog/onbuy-fees-explained) | Subscription plans |

Many UK sellers list on Amazon for volume and on OnBuy for higher margin per sale. Our [OnBuy vs Amazon comparison](/blog/onbuy-vs-amazon) goes into detail.

## Keep your margin as fees change

Fees change once or twice a year. Recalculate your prices whenever they do. If you sell Amazon stock on OnBuy, SellSail works out each OnBuy price from your cost plus every fee, so a fee change does not silently eat your profit. Try the free [OnBuy fee calculator](/onbuy-fee-calculator) to see the numbers.`,
  },
  {
    slug: "ebay-fees-uk",
    title: "eBay fees UK: fee calculator and seller fees explained",
    description:
      "eBay fees in the UK for private and business sellers: final value fees, per-order fees, shop subscriptions, promoted listings and a simple fee calculator.",
    keyword: "ebay fees uk",
    secondary: ["ebay fee calculator", "ebay final value fee uk", "ebay business seller fees", "ebay private seller fees"],
    category: "Fees and profit",
    date: "2026-11-21",
    readingMinutes: 6,
    takeaways: [
      "Private sellers on eBay UK pay no final value fees in most categories; business sellers do.",
      "Business sellers pay a final value fee (a percentage of the total, by category) plus a small fixed fee per order.",
      "Promoted listings add an advertising fee on top of the final value fee.",
      "If you sell regularly to make a profit, eBay and HMRC expect you to register as a business seller.",
    ],
    faq: [
      {
        q: "Does eBay charge fees for private sellers in the UK?",
        a: "Since 2022 most private sellers on eBay UK pay no final value fee in most categories. Some categories, such as vehicles, and optional upgrades still carry fees. Check eBay's current fee page.",
      },
      {
        q: "What does eBay charge business sellers?",
        a: "Business sellers pay a final value fee, a percentage of the total sale including delivery that varies by category, plus a fixed fee per order. Shop subscriptions can lower some fees and include free listings.",
      },
      {
        q: "Do I need to be a business seller on eBay?",
        a: "If you buy items to resell, make items to sell, or sell regularly for profit, you are trading and should register as a business seller. Selling your own unwanted things is private selling.",
      },
    ],
    related: ["onbuy-vs-ebay", "sell-on-amazon-uk", "ebay-dropshipping-uk", "trading-allowance-selling-online"],
    md: `eBay fees in the UK depend on whether you are a private or a business seller. Private sellers pay no final value fee in most categories. Business sellers pay a final value fee (a percentage of the total sale, set by category) plus a fixed fee per order, and can lower costs with a shop subscription. Promoted listings cost extra.

Rates change, so check eBay's current UK fee pages before pricing.

## Private vs business sellers

| | Private seller | Business seller |
|---|---|---|
| Who it is for | Selling your own unwanted items | Buying to resell, making to sell, regular selling for profit |
| Final value fee | None in most categories | Percentage by category |
| Per-order fixed fee | Generally none | Yes |
| Consumer rights | Fewer obligations | Must accept 14-day returns, give business details |

If you dropship or resell, you are a business seller. See [eBay dropshipping in the UK](/blog/ebay-dropshipping-uk) for eBay's rules on that.

## Final value fees for business sellers

The final value fee is a percentage of the **total amount of the sale**, including delivery. Rates vary by category, and some categories have a lower rate above a price threshold. On top, there is a small fixed fee per order.

## Shop subscriptions

An eBay shop costs a monthly fee and gives you:

- A bundle of free listings each month
- Lower final value fees in some categories
- Shop tools and branding

It pays for itself if you list a lot of items.

## Promoted listings

Promoted Listings Standard charges an extra percentage (the "ad rate") on sales that come through the ad. It is easy to forget when pricing. If you promote at 5%, that is 5% more off every promoted sale.

## eBay fee calculator: the formula

For a business seller, the fee on one order is:

**eBay fee = (item price + delivery charged) × final value fee % + per-order fee + (promoted sales × ad rate %)**

Then profit = total paid by buyer − eBay fee − cost price − postage − VAT (if registered).

## Worked example

A business seller sells an item for £20 plus £3 delivery. Assume a 12.8% final value fee, a £0.30 per-order fee and no promotion:

| Line | Amount |
|---|---|
| Total paid by buyer | £23.00 |
| Final value fee (12.8%) | −£2.94 |
| Per-order fee | −£0.30 |
| Cost price | −£12.00 |
| Postage | −£3.00 |
| **Profit (before VAT and overheads)** | **£4.76** |

If you are VAT registered, remove the VAT from the sale price as well.

## eBay vs OnBuy vs Amazon

eBay has huge UK traffic and suits used, rare and bargain items. OnBuy often has lower commission and less competition per listing. Amazon has the most buyers but higher fees and more rules. Read [OnBuy vs eBay](/blog/onbuy-vs-ebay) and [how to sell on Amazon UK](/blog/sell-on-amazon-uk) to compare.

## Taxes on eBay income

eBay, like other platforms, reports seller income to HMRC under the digital platform reporting rules. Our guide to the [trading allowance and HMRC rules](/blog/trading-allowance-selling-online) explains what that means and when you need to tell HMRC.`,
  },
  {
    slug: "trading-allowance-selling-online",
    title: "Trading allowance and HMRC rules for selling online (2026)",
    description:
      "The £1,000 trading allowance for UK online sellers: when selling counts as trading, platform reporting to HMRC, Self Assessment, and the £90,000 VAT threshold.",
    keyword: "trading allowance",
    secondary: ["£1,000 trading allowance", "hmrc selling online", "vat threshold uk", "do i pay tax selling online uk"],
    category: "Guides",
    date: "2026-11-22",
    readingMinutes: 7,
    takeaways: [
      "Selling your own unwanted things is not usually taxable. Buying or making things to sell for profit is trading.",
      "The trading allowance lets you earn up to £1,000 of gross trading income a year tax free without telling HMRC.",
      "Marketplaces now report seller income to HMRC once you pass 30 sales or about £1,700 in a calendar year.",
      "Above the allowance you register for Self Assessment; VAT registration is required above the £90,000 turnover threshold.",
    ],
    faq: [
      {
        q: "Do I have to pay tax on things I sell online?",
        a: "Not if you are selling your own unwanted belongings, usually for less than you paid. If you buy goods to resell or make things to sell for profit, that is trading and the profit can be taxable.",
      },
      {
        q: "What is the £1,000 trading allowance?",
        a: "It lets individuals earn up to £1,000 of gross trading income each tax year without paying tax or telling HMRC. Above that, you register for Self Assessment and can either deduct the allowance or your actual expenses.",
      },
      {
        q: "Do eBay and Vinted report to HMRC?",
        a: "Yes. Under the digital platform reporting rules, platforms collect and send seller information to HMRC once a seller makes 30 or more sales, or earns about £1,700 or more, in a calendar year. Being reported does not by itself mean you owe tax.",
      },
      {
        q: "When do I need to register for VAT?",
        a: "When your VAT-taxable turnover goes over £90,000 in any rolling 12-month period, or you expect it to in the next 30 days. You can register voluntarily below that.",
      },
    ],
    related: ["vat-for-online-sellers-uk", "sole-trader-or-limited-company-online-seller", "ebay-fees-uk", "is-dropshipping-legal-uk"],
    md: `The trading allowance lets individuals earn up to £1,000 of gross trading income a year tax free, without telling HMRC. For online sellers, HMRC counts buying or making goods to sell for profit as trading, but not clearing out your own belongings. Above that you register for Self Assessment, and above £90,000 turnover you register for VAT.

This guide is general information, not tax advice. For your own situation, speak to an accountant or check GOV.UK.

## Am I trading or just selling?

| Situation | Usually trading? |
|---|---|
| Selling your old clothes, toys or furniture | No |
| Buying items to resell at a profit | Yes |
| Dropshipping | Yes |
| Making crafts to sell regularly | Yes |
| Selling one inherited item | Usually no (but capital gains rules can apply to valuable items) |

HMRC looks at things like how often you sell, whether you bought with the intention of reselling, and whether you improve items before selling.

## The £1,000 trading allowance

If your total gross trading income (sales, not profit) is £1,000 or less in a tax year (6 April to 5 April), you do not need to tell HMRC or pay tax on it.

Above £1,000 you must register for Self Assessment. You then choose either:

- **Deduct the £1,000 allowance** from your income, or
- **Deduct your actual expenses** (stock, fees, postage and so on).

Most resellers and dropshippers have expenses well above £1,000, so they deduct actual expenses.

## Platform reporting to HMRC

Since 1 January 2024, online platforms such as eBay, Etsy, Vinted, Amazon and OnBuy collect seller details and report income to HMRC. They report you if, in a calendar year, you make:

- **30 or more sales**, or
- about **£1,700 (€2,000) or more** in sales.

Being reported is not a tax bill. It just means HMRC can see your sales. If you are genuinely selling personal items, you may owe nothing.

## Self Assessment

If you need to register:

1. Register for Self Assessment by **5 October** after the end of the tax year you started trading.
2. File your return online by **31 January**.
3. Pay any tax due by 31 January (and possibly payments on account).

Keep records of every sale and expense: a spreadsheet or simple bookkeeping app is enough to start. Marketplace reports help, but they do not include your stock costs.

## VAT

You must register for VAT if your VAT-taxable turnover exceeds **£90,000** in any rolling 12 months. Once registered, you charge VAT on sales and can reclaim VAT on business costs, including marketplace fees. See [VAT for online sellers](/blog/vat-for-online-sellers-uk).

## Sole trader or limited company?

Most people start as sole traders because it is simple. As profits grow, a limited company can be more tax-efficient but has more admin. Read [sole trader or limited company](/blog/sole-trader-or-limited-company-online-seller) to decide.

## Work out tax on profit, not sales

Tax is charged on profit. Track your real profit per sale, after marketplace fees, VAT and delivery. The [OnBuy fee calculator](/onbuy-fee-calculator) shows profit per item for OnBuy listings.`,
  },
  {
    slug: "amazon-repricer-uk",
    title: "Amazon repricer UK: how repricing works and what to look for",
    description:
      "Amazon repricers for UK sellers: how rule-based and algorithmic repricing work, the buy box, min and max prices, costs, and how to avoid a race to the bottom.",
    keyword: "amazon repricer uk",
    secondary: ["best amazon repricer uk", "amazon repricing software", "amazon buy box repricer", "algorithmic repricer"],
    category: "Repricing",
    date: "2026-11-23",
    readingMinutes: 7,
    takeaways: [
      "An Amazon repricer changes your prices automatically, usually to win or keep the buy box.",
      "Rule-based repricers follow your rules (for example 'beat the lowest by 1p'); algorithmic ones weigh more signals.",
      "Every repricer needs a minimum price per product that covers cost, fees and VAT, or it can sell at a loss.",
      "If you sell on more than one marketplace, each needs its own fee-aware pricing.",
    ],
    faq: [
      {
        q: "What does an Amazon repricer do?",
        a: "It monitors competing offers on the listings you sell and adjusts your price within limits you set, usually to win or keep the buy box while protecting your margin.",
      },
      {
        q: "Is the cheapest price always the buy box winner on Amazon?",
        a: "No. Amazon weighs price with delivery speed, seller performance and stock. A fast, reliable seller can win the buy box at a slightly higher price.",
      },
      {
        q: "Does Amazon have a free repricer?",
        a: "Amazon offers a basic automated pricing tool in Seller Central for Professional sellers. Third-party repricers add more strategies, faster updates and multi-channel features for a monthly fee.",
      },
    ],
    related: ["what-is-a-repricer", "repricing-strategies", "onbuy-repricer-guide", "floor-price"],
    md: `An Amazon repricer is software that changes your Amazon prices automatically, usually to win or keep the buy box, within a minimum and maximum you set for each product. UK sellers choose between Amazon's free automated pricing, rule-based repricers and algorithmic repricers. Whichever you use, a correct minimum price is what keeps you profitable.

## How Amazon repricing works

1. The repricer watches the offers on each listing you sell.
2. When a competitor changes price, or the buy box moves, it decides a new price.
3. It sends the new price to Amazon, staying between your minimum and maximum.

## Types of Amazon repricer

| Type | How it decides | Good for |
|---|---|---|
| Amazon automated pricing | Simple rules inside Seller Central | Small catalogues, getting started |
| Rule-based | Your rules, such as "match the buy box" or "beat the lowest by 1p" | Sellers who want control |
| Algorithmic ("AI") | Weighs buy box, competitor ratings, sales speed | High-volume sellers in competitive niches |

Read [repricing strategies](/blog/repricing-strategies) for the common rules and when each works.

## The buy box is not just about price

Amazon considers price alongside delivery time, seller rating, stock and fulfilment method. That is why a good repricer does not always undercut. Sometimes the best move is to **raise** your price when you already hold the buy box or when competitors run out.

## Set the minimum price properly

The minimum (or [floor price](/blog/floor-price)) is the most important setting. It must include:

- Product cost
- Referral fee (see [how to sell on Amazon UK](/blog/sell-on-amazon-uk))
- FBA or postage costs
- VAT if you are registered
- The profit you want to keep

Set it too low and the repricer will happily sell at a loss during a [price war](/blog/price-war).

## What to compare when choosing

- **Update speed:** how quickly it reacts to price changes.
- **Strategies:** rules, algorithmic options, per-product settings.
- **Min/max management:** bulk upload, or calculation from cost.
- **Price:** flat fee vs a share of sales.
- **Other channels:** whether it also covers eBay or OnBuy.

## Repricing on more than one marketplace

If you also sell on OnBuy, Amazon prices will not work there because the fees differ. SellSail is built for OnBuy: it works out each OnBuy price from your cost and OnBuy's fees, then competes for the OnBuy buy box without going below your floor. See the [OnBuy repricer guide](/blog/onbuy-repricer-guide) or try the [OnBuy fee calculator](/onbuy-fee-calculator).`,
  },
  {
    slug: "ebay-repricer",
    title: "eBay repricer: how to automate eBay pricing in the UK",
    description:
      "eBay repricers for UK sellers: how automated eBay repricing works, Best Match and price, setting floor prices, tools available, and when repricing is worth it.",
    keyword: "ebay repricer",
    secondary: ["ebay repricing software uk", "automatic price changes ebay", "ebay price automation", "ebay competitor pricing"],
    category: "Repricing",
    date: "2026-11-24",
    readingMinutes: 6,
    takeaways: [
      "eBay has no buy box: buyers see many listings, so price is one of several factors in search ranking.",
      "An eBay repricer adjusts your prices against matching competitor listings, inside your limits.",
      "Matching listings on eBay is harder than on Amazon or OnBuy because there is less shared product data.",
      "Use repricing on branded, identical products. Unique or used items rarely benefit.",
    ],
    faq: [
      {
        q: "Can you automatically change prices on eBay?",
        a: "Yes. eBay's API allows price updates, so third-party repricers and listing tools can change prices automatically based on competitor prices and your rules.",
      },
      {
        q: "Does eBay have a buy box?",
        a: "Not in the way Amazon and OnBuy do. eBay shows separate listings ranked by Best Match, which considers price, delivery, seller performance and relevance.",
      },
      {
        q: "Is an eBay repricer worth it?",
        a: "It is worth it when you sell many identical branded products against other sellers. For unique, handmade or used items, manual pricing is usually enough.",
      },
    ],
    related: ["amazon-repricer-uk", "what-is-a-repricer", "onbuy-vs-ebay", "ebay-fees-uk"],
    md: `An eBay repricer automatically adjusts your eBay prices against competitors selling the same product, within a minimum and maximum you set. Because eBay has no single buy box, repricing on eBay is about staying competitive in search (Best Match) rather than winning one slot, and it works best for identical, branded products.

## How eBay is different from Amazon and OnBuy

| | eBay | Amazon / OnBuy |
|---|---|---|
| Listing model | Each seller has their own listing | Sellers share one product page |
| Buy box | No | Yes |
| Matching competitors | By EAN, MPN or title, less reliable | Shared product, easy |
| What price affects | Best Match ranking, click-through | Buy box |

On eBay a slightly higher price can still sell well if your delivery, feedback and photos are better.

## How an eBay repricer works

1. It finds competing listings for each of your products, usually by EAN or MPN.
2. It filters them (for example new condition, UK sellers, good feedback).
3. It sets your price by your rule, such as "1% below the cheapest qualifying listing", never below your floor.

## Set a floor that includes eBay's fees

eBay's final value fee applies to the whole sale including delivery, and promoted listings add more. Work out your [floor price](/blog/floor-price) from cost plus every fee in our [eBay fees guide](/blog/ebay-fees-uk). Without that, automated repricing can sell at a loss.

## When repricing on eBay pays off

- You sell new, branded products other sellers also stock.
- You have dozens or hundreds of SKUs.
- Competitors change prices often.

It rarely helps for one-off, used or handmade items. There are no direct competitors to price against.

## Alternatives to constant price cuts

- Improve your titles, photos and [product descriptions](/blog/write-product-descriptions).
- Offer free or faster delivery.
- Use multi-buy discounts.

## Selling the same products on OnBuy

Many eBay sellers add OnBuy as a second channel with less competition per listing. OnBuy uses a shared product page and buy box, which makes repricing more predictable. SellSail handles OnBuy pricing and buy-box competition with floor protection. Read [OnBuy vs eBay](/blog/onbuy-vs-ebay) to see whether it fits.`,
  },
  {
    slug: "dropshipping-vs-wholesale",
    title: "Dropshipping vs wholesale: which suits UK sellers?",
    description:
      "Dropshipping vs wholesale for UK sellers: startup cost, margins, risk, delivery speed and control compared, plus when a hybrid model makes the most sense.",
    keyword: "dropshipping vs wholesale",
    secondary: ["wholesale vs dropshipping uk", "is dropshipping better than wholesale", "buying wholesale to sell online", "hybrid dropshipping"],
    category: "Dropshipping",
    date: "2026-11-25",
    readingMinutes: 6,
    takeaways: [
      "Dropshipping needs little money up front but gives lower margins and less control over delivery.",
      "Wholesale means buying stock in bulk: higher margins, but you take stock risk and need storage.",
      "Many UK sellers test products by dropshipping, then buy the proven winners wholesale.",
      "Whichever model you use, price from your real cost after fees, VAT and delivery.",
    ],
    faq: [
      {
        q: "Is dropshipping or wholesale more profitable?",
        a: "Wholesale usually gives higher margins per item because you buy in bulk at lower unit prices. Dropshipping has lower margins but almost no upfront cost or unsold stock risk.",
      },
      {
        q: "Can I do both dropshipping and wholesale?",
        a: "Yes. A hybrid model is common: dropship to test demand, then buy stock wholesale for products that sell consistently, so you get better margins and faster delivery on your best sellers.",
      },
      {
        q: "How much money do I need to start wholesale?",
        a: "It depends on the supplier's minimum order quantity. Many UK wholesalers have minimum orders from a few hundred pounds; you also need storage, packaging and postage.",
      },
    ],
    related: ["dropshipping-uk-guide", "dropshipping-wholesalers-uk", "uk-dropshipping-suppliers", "dropshipping-profit-margins"],
    md: `Dropshipping vs wholesale comes down to money and risk. With dropshipping, you list products and your supplier ships each order: low startup cost, but lower margins and less control. With wholesale, you buy stock in bulk and ship it yourself: higher margins and faster delivery, but you need cash, space and must sell what you buy.

## Side-by-side comparison

| | Dropshipping | Wholesale |
|---|---|---|
| Upfront cost | Very low | Minimum order quantities, often hundreds of pounds |
| Margin per item | Lower | Higher |
| Stock risk | None | Unsold stock is your loss |
| Storage | Not needed | Needed |
| Delivery speed | Depends on supplier | You control it |
| Packaging and branding | Limited | Full control |
| Time per order | Low | Picking, packing, posting |
| Scaling | Easy to add products | Needs cash and space |

## When dropshipping makes sense

- You are starting with little money.
- You want to test many products quickly.
- You have no space for stock.
- Your suppliers ship fast within the UK.

The main risk is your supplier: stock running out, slow dispatch or price changes. Keep [stock synced](/blog/stock-sync-dropshipping) and check [dropshipping profit margins](/blog/dropshipping-profit-margins) carefully, because fees take a large share of a small margin.

## When wholesale makes sense

- You know which products sell.
- You can afford minimum orders.
- You want better margins and control of delivery.
- You want to build your own brand and packaging.

The main risk is cash tied up in stock that does not sell. Start with small orders and reorder based on how fast each product actually sells.

## The hybrid model

Many successful UK sellers combine both:

1. Dropship a wide range to find what sells.
2. Buy the best sellers wholesale for higher margin and faster delivery.
3. Keep dropshipping the long tail of slower products.

## Finding suppliers

- Dropshipping: see [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers).
- Wholesale: see [dropshipping wholesalers UK](/blog/dropshipping-wholesalers-uk), many of which offer both.

## Price from your real cost

Whichever model you choose, work out each price from cost plus marketplace fees, VAT and delivery. If you list on OnBuy, the [OnBuy fee calculator](/onbuy-fee-calculator) shows the price you need for the profit you want.`,
  },
  {
    slug: "tiktok-shop-uk",
    title: "TikTok Shop UK: how to start selling and what it costs",
    description:
      "TikTok Shop UK for sellers: how to set up, commission and fees, what sells, delivery rules, creator affiliates, and how it fits with Amazon, eBay and OnBuy.",
    keyword: "tiktok shop uk",
    secondary: ["how to sell on tiktok shop uk", "tiktok shop fees uk", "tiktok shop seller uk", "tiktok affiliate uk"],
    category: "Marketplaces",
    date: "2026-11-26",
    readingMinutes: 7,
    takeaways: [
      "TikTok Shop lets UK sellers sell directly inside TikTok videos, livestreams and a shop tab.",
      "Sellers pay a commission on each sale, plus any affiliate commission they offer to creators.",
      "Sales depend on content: products that demonstrate well on video sell best.",
      "Fast, reliable dispatch matters. TikTok Shop measures shipping performance closely.",
    ],
    faq: [
      {
        q: "How much does TikTok Shop charge UK sellers?",
        a: "TikTok Shop charges a commission on each order, a percentage of the sale that has changed several times since launch. If you use creator affiliates, you also pay their commission. Check TikTok Shop's current UK seller fees.",
      },
      {
        q: "Can I dropship on TikTok Shop UK?",
        a: "You can, but TikTok Shop has strict dispatch and delivery standards and requires products to ship from the UK within short timeframes. Slow overseas dropshipping is likely to break its rules.",
      },
      {
        q: "Do I need followers to sell on TikTok Shop?",
        a: "No. You can sell through creator affiliates who promote your products to their audiences for a commission, and through TikTok's shop tab and search.",
      },
    ],
    related: ["uk-online-marketplaces", "multichannel-selling-uk", "find-winning-products", "side-hustle-ideas-uk"],
    md: `TikTok Shop UK lets sellers list products and sell them directly inside TikTok, through videos, livestreams and the shop tab. To start, you register a seller account with UK business or personal details, add products, and either create content yourself or pay creators commission to promote them. TikTok charges a commission on each sale.

## How TikTok Shop works

1. **Seller Center:** you list products, set prices and manage orders.
2. **Content:** products appear in short videos and livestreams with a tap-to-buy link.
3. **Affiliates:** creators promote your products and earn a commission you set.
4. **Shop tab and search:** buyers can also browse like a normal marketplace.

## What it costs

| Cost | What it is |
|---|---|
| Commission | A percentage of each sale, charged by TikTok |
| Affiliate commission | Optional, paid to creators who sell for you |
| Ads | Optional, to boost videos or products |
| Promotions | Discounts and vouchers you fund |

Rates have changed several times since launch, so check TikTok's current UK seller fees. Remember that affiliate commission comes off your margin too.

## What sells on TikTok Shop

Products that look good on video and solve a visible problem:

- Beauty, skincare and hair tools
- Gadgets and kitchen helpers
- Cleaning products with visible results
- Fashion accessories
- Home and organisation

Impulse price points (under about £30) do best. See [finding winning products](/blog/find-winning-products) for research methods.

## Delivery and performance rules

TikTok Shop measures late dispatch, cancellations and delivery times closely. Breaking them can limit your account. That means:

- Ship from UK stock, quickly.
- Avoid slow overseas dropshipping.
- Keep stock accurate. Viral videos can sell out a product in hours.

## TikTok Shop vs other UK marketplaces

| | TikTok Shop | Amazon | OnBuy |
|---|---|---|---|
| How buyers find you | Content, creators | Search | Search, buy box |
| Needs content | Yes | No | No |
| Sales pattern | Spiky, viral | Steady | Steady |

Many sellers use TikTok Shop for bursts of sales and marketplaces like Amazon and OnBuy for steady orders. See [multichannel selling in the UK](/blog/multichannel-selling-uk).

## Keep prices profitable across channels

Each channel has its own fees, so the same product needs a different price on each to earn the same profit. If you sell on OnBuy too, SellSail calculates OnBuy prices from your cost and OnBuy's fees automatically.`,
  },
  {
    slug: "find-winning-products",
    title: "How to find winning products to sell online in the UK",
    description:
      "How to find winning products to sell online in the UK: research methods, free tools, demand and competition checks, margin tests and red flags to avoid.",
    keyword: "how to find winning products",
    secondary: ["winning products uk", "product research uk", "what to sell online uk", "best products to sell online"],
    category: "Dropshipping",
    date: "2026-11-27",
    readingMinutes: 7,
    takeaways: [
      "A winning product has steady demand, manageable competition and a margin that survives fees.",
      "Check demand with marketplace best seller lists, Google Trends and search suggestions.",
      "Check margin before anything else: many 'trending' products lose money after fees and delivery.",
      "Test with small quantities or dropshipping before buying stock.",
    ],
    faq: [
      {
        q: "What makes a product a winner?",
        a: "Steady demand, competition you can beat, a price that leaves profit after all fees and delivery, and a supplier that can keep it in stock and ship quickly.",
      },
      {
        q: "Where can I find trending products in the UK?",
        a: "Amazon UK Best Sellers and Movers and Shakers, eBay's trending pages, Google Trends set to the UK, TikTok, and wholesaler best seller lists are all good starting points.",
      },
      {
        q: "How much profit should a product make?",
        a: "Aim for a margin that leaves room for returns and price competition. Many UK marketplace sellers target 15% to 30% net margin after fees, VAT and delivery, but it varies by category.",
      },
    ],
    related: ["best-dropshipping-products-uk", "dropshipping-profit-margins", "uk-dropshipping-suppliers", "competitor-price-monitoring"],
    md: `To find winning products to sell online in the UK, look for three things together: steady demand, competition you can beat, and a margin that survives marketplace fees, VAT and delivery. Use best seller lists and Google Trends for demand, check how many sellers compete, run the margin numbers, then test small before buying stock.

## The four tests of a winning product

| Test | Question | Where to check |
|---|---|---|
| Demand | Do people buy it every month? | Best seller lists, Google Trends |
| Competition | Can I win sales against current sellers? | Marketplace search, offers count |
| Margin | Is there profit after every fee? | Fee calculators |
| Supply | Can I get it reliably and quickly? | Supplier stock and dispatch times |

A product needs to pass all four. Most "viral" products fail the margin or supply test.

## Step 1: find ideas

- **Amazon UK Best Sellers** and **Movers & Shakers** by category.
- **eBay** sold listings (filter by "Sold items" to see what actually sells).
- **Google Trends**, set to United Kingdom, to see if interest is steady, seasonal or fading.
- **TikTok** and social media for new trends.
- **Supplier best seller lists:** wholesalers know what moves.
- **Your own sales data:** what sells, and what buyers ask for.

## Step 2: check demand is steady

A spike in Google Trends can mean a short fad. Prefer products with steady year-round interest, or plan clearly for seasonal ones (garden in spring, heaters in autumn, gifts in December).

## Step 3: check competition

Search the product on each marketplace:

- How many sellers offer the same item?
- Are prices clustered, or is there a [price war](/blog/price-war)?
- Is the marketplace itself (for example Amazon) selling it?

A product with a few sellers and stable prices is easier to win than one with dozens all undercutting by a penny.

## Step 4: run the margin test

This is where most products fail. Take the likely selling price and subtract:

- Product cost and inbound delivery
- Marketplace commission
- VAT (if registered)
- Postage and packaging
- An allowance for returns

If profit is under a few pounds per sale, one return wipes out several sales. See [dropshipping profit margins](/blog/dropshipping-profit-margins) and use the [OnBuy fee calculator](/onbuy-fee-calculator) for OnBuy prices.

## Step 5: test small

Dropship it, or buy a small quantity. Watch how many views turn into sales, what price wins, and whether returns are high. Keep what works and drop what does not.

## Red flags

- Fragile, heavy or oversized items with high delivery costs
- Products needing safety certification you cannot verify
- Branded goods you are not authorised to sell
- Very cheap items where fees take most of the price

## Make it repeatable

Winning products change. Check prices and competition regularly. [Competitor price monitoring](/blog/competitor-price-monitoring) keeps your best products profitable as markets move.`,
  },
];
