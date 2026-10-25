import type { Post } from "../types";

// Batch 7: dropshipping economics and set-up, and VAT. 14–23 Dec.
export const batch07: Post[] = [
  {
    slug: "dropshipping-profit-margins",
    title: "Dropshipping profit margins: realistic numbers for UK sellers",
    description:
      "What profit margins can UK dropshippers really make? Worked examples with marketplace commission, VAT and returns, typical margin ranges, and how to protect your margin.",
    keyword: "dropshipping profit margin",
    secondary: ["dropshipping margins", "how much do dropshippers make uk", "average dropshipping profit"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "After fees, many marketplace dropshippers work on net margins of roughly 10–20%.",
      "VAT registration changes the maths a lot: a sixth of a VAT-inclusive price goes to HMRC.",
      "Use a minimum profit in pounds so cheap items still earn.",
      "Margins erode when supplier prices rise and listings don't follow, so automate updates.",
    ],
    faq: [
      {
        q: "What is a good margin for dropshipping?",
        a: "Many marketplace dropshippers aim for 10–20% net margin after every fee, with a minimum profit of £2 to £3 per item. Lower can work for fast sellers; higher is common in niches.",
      },
      {
        q: "Why are dropshipping margins lower than retail margins?",
        a: "You pay a retail or near-retail price to your supplier rather than a bulk wholesale price, and marketplace commission comes out of every sale.",
      },
      {
        q: "How can I increase my dropshipping margin?",
        a: "Find cheaper suppliers, choose products with less competition, use a minimum profit per item, avoid price wars, cut returns, and keep prices in step with supplier costs.",
      },
    ],
    related: ["profit-margin-formula", "how-to-price-onbuy-dropshipping", "break-even-price", "hidden-costs-of-selling-online"],
    md: `UK dropshippers selling on marketplaces typically make a net margin of around 10–20% after every fee, often less on very competitive products. The exact figure depends on your supplier cost, the marketplace's commission, whether you're VAT-registered, and how often items come back. Here are realistic worked numbers.

## A worked example (not VAT-registered)

| | Amount |
|---|---|
| Selling price | £20.45 |
| Commission (15%) | −£3.07 |
| Supplier cost, delivered | −£13.90 |
| Returns allowance (2%) | −£0.41 |
| **Net profit** | **£3.07** |
| **Net margin** | **15.0%** |

## The same product, VAT-registered

| | Amount |
|---|---|
| Selling price (incl. VAT) | £20.45 |
| VAT (a sixth) | −£3.41 |
| Commission (15% of £20.45) | −£3.07 |
| Supplier cost | −£13.90 |
| **Profit** | **£0.07** |

Same price, almost no profit, and one refund turns it into a loss. A VAT-registered seller needs a higher price, around £25 for this product, to keep a similar margin. That's why VAT has to be part of every price. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## Typical margin ranges

| Net margin | What it means |
|---|---|
| Under 5% | One refund or price rise turns it into a loss |
| 5–10% | Workable only for fast-selling, low-return items |
| 10–20% | Healthy for most marketplace dropshipping |
| 20%+ | Strong; usually niche or less competitive products |

## What eats into dropshipping margins?

- **Commission** on the full price, including VAT and delivery.
- **VAT**, if you're registered.
- **Returns and refunds.**
- **Supplier price rises** that your listings don't follow.
- **Price wars** with other sellers. See [Price war](/blog/price-war).
- **Tool and plan fees.**

## How do you protect your margin?

1. **Price from the delivered cost** plus fees plus profit, for every item.
2. **Use a minimum profit in pounds** as well as a percentage.
3. **Set a floor** you never go below. See [What is a floor price?](/blog/floor-price)
4. **Follow supplier prices automatically**, so a cost rise raises your price within minutes.
5. **Drop products** with high returns or permanent price wars.

[SellSail](/features) builds every OnBuy price from the live Amazon UK cost using margin bands (profit %, minimum profit, fixed amount), adds OnBuy commission and payment fees, and keeps competition above your floor. Calculate your own numbers in the [OnBuy fee calculator](/onbuy-fee-calculator).`,
  },
  {
    slug: "dropshipping-mistakes",
    title: "12 dropshipping mistakes UK sellers make (and how to avoid them)",
    description:
      "The 12 most common dropshipping mistakes UK sellers make, from pricing without VAT and fees to slow suppliers and no stock sync, with a fix for each one.",
    keyword: "dropshipping mistakes",
    secondary: ["dropshipping tips uk", "why dropshipping fails", "common dropshipping mistakes"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "Most dropshipping losses come from pricing without every fee, and from stock that's out of sync.",
      "Slow suppliers damage reviews and marketplace standing faster than anything else.",
      "Follow marketplace rules on sourcing; they can be stricter than the law.",
      "Automate the repetitive work early, before mistakes multiply.",
    ],
    faq: [
      {
        q: "Why do most dropshipping businesses fail?",
        a: "Usually because margins are too thin once fees, VAT and returns are counted, or because poor delivery and stock errors damage reviews and marketplace accounts.",
      },
      {
        q: "What's the biggest dropshipping mistake?",
        a: "Pricing without counting every cost. A product that looks profitable before commission and VAT can lose money on every sale.",
      },
      {
        q: "How do I avoid overselling when dropshipping?",
        a: "Sync stock from your supplier automatically and set listings to zero as soon as the supplier runs out.",
      },
    ],
    related: ["dropshipping-uk-guide", "dropshipping-profit-margins", "stock-sync-dropshipping", "uk-dropshipping-suppliers"],
    md: `Most UK dropshipping businesses that fail don't fail because the model doesn't work. They fail because of a handful of avoidable mistakes. Here are the twelve we see most, each with a fix.

## 1. Pricing without every fee
**Mistake:** cost plus a bit, ignoring commission, payment fees and VAT.
**Fix:** price = (cost + profit) ÷ (1 − percentage fees). Use the [fee calculator](/onbuy-fee-calculator).

## 2. Forgetting VAT once registered
**Mistake:** keeping the same prices after VAT registration.
**Fix:** a sixth of every VAT-inclusive price goes to HMRC; reprice everything. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## 3. No minimum profit
**Mistake:** a percentage margin that's pennies on cheap items.
**Fix:** a minimum profit in pounds as well as a percentage.

## 4. Slow suppliers
**Mistake:** promising fast delivery from a supplier that takes a week.
**Fix:** test suppliers with sample orders; promise only what they always meet.

## 5. No stock sync
**Mistake:** listings stay live after the supplier sells out.
**Fix:** sync stock automatically. See [Stock sync for dropshippers](/blog/stock-sync-dropshipping).

## 6. Prices that don't follow the supplier
**Mistake:** the supplier raises prices; your listing doesn't.
**Fix:** update prices from the current supplier cost several times a day.

## 7. Joining every price war
**Mistake:** following rivals below cost.
**Fix:** set a floor and hold it. See [Price war](/blog/price-war).

## 8. Ignoring marketplace rules
**Mistake:** sourcing in a way the marketplace forbids.
**Fix:** read each marketplace's dropshipping policy before listing.

## 9. Using images you don't own
**Mistake:** copying brand or competitor photos.
**Fix:** use supplier images you're licensed to use, or your own.

## 10. Selling unsafe or fake products
**Mistake:** cheap products that don't meet UK safety rules, or counterfeits.
**Fix:** check compliance; sell only genuine goods.

## 11. No records
**Mistake:** no tracking of costs, fees and refunds.
**Fix:** record everything from day one; HMRC will ask.

## 12. Doing everything by hand
**Mistake:** updating hundreds of prices manually, so they're always out of date.
**Fix:** automate pricing and stock early.

> Mistakes 1, 3, 5, 6 and 7 are all solved by one thing: prices and stock that follow your supplier automatically, inside a floor you set.

That's what [SellSail](/features) does for OnBuy sellers sourcing from Amazon UK. Read the full [UK dropshipping guide](/blog/dropshipping-uk-guide).`,
  },
  {
    slug: "best-dropshipping-products-uk",
    title: "How to find the best dropshipping products for the UK",
    description:
      "How to find profitable dropshipping products for the UK market: criteria that matter, research methods, products to avoid, and how to test a product before scaling.",
    keyword: "best dropshipping products uk",
    secondary: ["dropshipping products uk", "winning dropshipping products", "what to dropship uk"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "The best products leave room for fees, ship cheaply and sell all year.",
      "Research real demand on the marketplace you'll sell on, not in general trend lists.",
      "Avoid regulated, fragile, oversized and heavily branded products to start.",
      "Test a few products, measure margin after real sales, then scale what works.",
    ],
    faq: [
      {
        q: "What products sell best for dropshipping in the UK?",
        a: "Products that are light, hard to break, steadily in demand and not dominated by one brand, such as many home, kitchen, pet, hobby and accessory items. The right products depend on your channel and margins.",
      },
      {
        q: "Should I dropship trending products?",
        a: "Trends can sell fast but fade fast, and attract many sellers. A range of steady sellers is usually a safer base.",
      },
      {
        q: "How many products should I start with?",
        a: "Enough to learn what sells, often 20 to 50, priced properly with stock in sync. Then expand around the winners.",
      },
    ],
    related: ["dropshipping-uk-guide", "dropshipping-profit-margins", "uk-dropshipping-suppliers", "competitor-price-monitoring"],
    md: `The best dropshipping products for the UK aren't whatever is trending this week. They're products that leave room for marketplace fees, ship cheaply, sell all year and aren't controlled by one brand. This guide gives you criteria, research methods and a simple test-and-scale process.

## What makes a good dropshipping product?

| Criterion | Why it matters |
|---|---|
| Room for fees | Commission, VAT and returns must fit inside the price |
| Light and robust | Cheap delivery and few damage returns |
| Steady demand | Sells every month, not just one season |
| Many suppliers | You can switch if one runs out |
| Not brand-dominated | The brand isn't undercutting resellers |
| Low return risk | Simple products with clear descriptions |
| Unregulated or easy compliance | Fewer safety and labelling hurdles |

## How do you research products?

1. **Search the marketplace you'll sell on.** What's listed, how many sellers, what prices?
2. **Check the competition per product.** Fewer sellers means an easier start.
3. **Work out the margin** from your supplier's delivered cost. Use the [fee calculator](/onbuy-fee-calculator).
4. **Check reviews** for common complaints you could avoid.
5. **Look at seasonality**: steady beats spiky.

## What products should beginners avoid?

- **Regulated products**: electricals, cosmetics, toys and supplements carry extra rules.
- **Fragile or oversized items**: costly delivery and returns.
- **Heavily branded goods**: restrictions and brand-owner competition.
- **Sized clothing and shoes**: high return rates.
- **Very cheap items**: fees and minimum profit make them hard to price.

## How do you test a product?

1. List a small range, priced from real costs.
2. Watch sales, returns and the price competitors settle at.
3. After 2–4 weeks, keep products with healthy margins and steady sales.
4. Expand around winners: variants, accessories, related items.

> Judge products on profit after real sales, not on revenue. A best-seller at a 2% margin is a hobby; a modest seller at 18% is a business.

## How does competition affect your choice?

On a marketplace, several sellers often share a product page. If competitors are already priced below your floor, the product may not be worth it. See [Competitor price monitoring](/blog/competitor-price-monitoring).

SellSail shows which OnBuy listings you're winning and losing, and the price you'd need. [See competition repricing](/features). Related: [Dropshipping profit margins](/blog/dropshipping-profit-margins).`,
  },
  {
    slug: "start-dropshipping-business-uk",
    title: "How to start a dropshipping business in the UK: step by step",
    description:
      "How to start a dropshipping business in the UK step by step: structure, HMRC, bank account, suppliers, channels, pricing, automation and your first 30 days.",
    keyword: "start dropshipping uk",
    secondary: ["start a dropshipping business uk", "dropshipping business uk", "how to start dropshipping uk"],
    category: "Dropshipping",
    date: "2026-10-25",
    readingMinutes: 10,
    takeaways: [
      "Decide sole trader or limited company, register with HMRC and open a business bank account.",
      "Choose one channel and a handful of tested suppliers before listing anything.",
      "Price every product from cost plus fees plus profit, with a floor.",
      "Automate price and stock sync from day one.",
    ],
    faq: [
      {
        q: "How much does it cost to start dropshipping in the UK?",
        a: "Often a few hundred pounds: marketplace plan fees, tools, samples, and float to buy items before the marketplace pays you. You don't need to buy stock up front.",
      },
      {
        q: "Do I need a limited company to dropship?",
        a: "No. Many start as sole traders. A limited company can make sense later for tax or liability reasons; an accountant can advise.",
      },
      {
        q: "How long does it take to start making money?",
        a: "Some sellers make first sales within weeks; building steady profit usually takes a few months of testing products, suppliers and prices.",
      },
    ],
    related: ["dropshipping-uk-guide", "is-dropshipping-legal-uk", "uk-dropshipping-suppliers", "how-to-sell-on-onbuy"],
    md: `Starting a dropshipping business in the UK takes four things: a legal set-up, reliable suppliers, a sales channel, and pricing that covers every cost. Here's the order to do it in, with a plan for your first 30 days.

## Step 1: choose your business structure

| | Sole trader | Limited company |
|---|---|---|
| Set-up | Register for Self Assessment | Register at Companies House |
| Admin | Simpler | More: accounts, filings |
| Liability | Personal | Limited to the company |
| Tax | Income tax and NI on profit | Corporation tax, then dividends or salary |

Many start as sole traders. Get advice from an accountant for your situation.

## Step 2: register with HMRC

Register once you're trading beyond the £1,000 trading allowance. Register for VAT when your VAT-taxable turnover passes £90,000 in a rolling 12 months, or voluntarily earlier. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## Step 3: open a business bank account

Keeping business money separate makes bookkeeping and tax returns far easier.

## Step 4: choose your channel

Start with one. A marketplace brings buyers immediately; your own website gives control. See [UK online marketplaces](/blog/uk-online-marketplaces).

## Step 5: find and test suppliers

Order samples, time delivery and check returns terms. See [UK dropshipping suppliers](/blog/uk-dropshipping-suppliers).

## Step 6: pick and price products

Choose 20–50 products with room for fees. Price each from its delivered cost, plus profit, divided by what's left after fees, and set a floor. See [How to find the best dropshipping products](/blog/best-dropshipping-products-uk) and [Floor price](/blog/floor-price).

## Step 7: automate price and stock

Supplier prices and stock change daily. Automate updates so you never sell at a loss or sell out-of-stock items. See [Stock sync for dropshippers](/blog/stock-sync-dropshipping).

## Step 8: set up customer service

Reply within a day, share tracking, and handle returns under UK law. See [Customer service for dropshippers](/blog/dropshipping-customer-service).

## Your first 30 days

| Week | Focus |
|---|---|
| 1 | Legal set-up, bank account, marketplace account |
| 2 | Supplier samples, product shortlist, pricing |
| 3 | List 20–50 products, automation switched on |
| 4 | Review first sales: margins, delivery, returns; adjust |

If you sell on OnBuy and source from Amazon UK, [SellSail](/signup) covers step 7 and the pricing in step 6: 14-day free trial, no card needed. Read the full [UK dropshipping guide](/blog/dropshipping-uk-guide).`,
  },
  {
    slug: "vat-for-online-sellers-uk",
    title: "VAT for UK online sellers: the essentials for marketplace sellers",
    description:
      "VAT for UK online sellers explained: the £90,000 threshold, pricing with VAT, marketplace commission on VAT-inclusive prices, imports under £135, and keeping records.",
    keyword: "vat for online sellers",
    secondary: ["ecommerce vat uk", "vat for marketplace sellers", "vat threshold online sellers"],
    category: "Fees and profit",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "Register for VAT when VAT-taxable turnover passes £90,000 in a rolling 12 months.",
      "At 20%, VAT is a sixth of a VAT-inclusive price, and it's HMRC's money, not yours.",
      "Marketplace commission is usually charged on the VAT-inclusive price, so it costs VAT-registered sellers more as a share of their income.",
      "For goods of £135 or less sent to the UK from overseas, VAT is generally collected at the point of sale.",
    ],
    faq: [
      {
        q: "When do online sellers need to register for VAT?",
        a: "When your VAT-taxable turnover goes over £90,000 in any rolling 12-month period, or you expect it to within the next 30 days. You can register voluntarily before that.",
      },
      {
        q: "How do I work out the VAT in a price?",
        a: "At the standard 20% rate, divide the VAT-inclusive price by 6. For example, £24.99 includes £4.17 of VAT.",
      },
      {
        q: "Should I register for VAT voluntarily?",
        a: "It can make sense if most of your costs carry VAT you could reclaim, or your buyers are businesses. It also raises your break-even price, so take advice first.",
      },
    ],
    related: ["profit-margin-formula", "break-even-price", "onbuy-fees-explained", "dropshipping-profit-margins"],
    md: `VAT is the cost that most surprises growing online sellers. Once you're registered, a sixth of every VAT-inclusive sale belongs to HMRC, and marketplace commission is usually charged on the full VAT-inclusive price. Here are the essentials for UK marketplace sellers. This is general information, not tax advice.

## When do you need to register for VAT?

You must register when your **VAT-taxable turnover** goes over **£90,000** in any rolling 12-month period (the threshold since April 2024), or if you expect it to in the next 30 days alone. You can register voluntarily below the threshold.

## How much VAT is in a price?

At the standard 20% rate, VAT is a **sixth** of a VAT-inclusive price:

| Price incl. VAT | VAT | Price excl. VAT |
|---|---|---|
| £12.00 | £2.00 | £10.00 |
| £24.99 | £4.17 | £20.82 |
| £50.00 | £8.33 | £41.67 |

## How does VAT affect marketplace pricing?

Two things happen when you register:

1. A sixth of every sale goes to HMRC.
2. Commission is usually taken from the VAT-inclusive price, so it's a bigger share of what you keep.

Example: a £24.99 sale at 15% commission, £13.90 cost.

| | Not registered | VAT-registered |
|---|---|---|
| Price paid | £24.99 | £24.99 |
| VAT | £0.00 | −£4.17 |
| Commission | −£3.75 | −£3.75 |
| Cost | −£13.90 | −£13.90 |
| **Profit** | **£7.34** | **£3.17** |

Same price, less than half the profit. That's why VAT has to be part of every price calculation. Our [OnBuy fee calculator](/onbuy-fee-calculator) includes it, and [break-even price](/blog/break-even-price) shows the formula.

## What about goods from overseas suppliers?

For goods worth **£135 or less** sent to UK buyers from overseas, UK VAT is generally collected at the point of sale, often by the online marketplace. Above £135, import VAT applies at the border. The rules for your business depend on how goods move, so check with an accountant. See [AliExpress dropshipping UK](/blog/aliexpress-dropshipping-uk).

## What records do you need?

VAT-registered businesses must keep digital records and file returns with Making Tax Digital-compatible software. Keep every sale, fee invoice, supplier invoice and refund.

## Can you reclaim VAT?

If you're VAT-registered, you can generally reclaim VAT on business purchases with valid VAT invoices, such as marketplace fees and tools. Whether you can reclaim on stock depends on the supplier and invoice.

> If you become VAT-registered, reprice every listing that day. Prices that were profitable yesterday may lose money on every sale today.

Related: [Dropshipping profit margins](/blog/dropshipping-profit-margins) and [OnBuy fees explained](/blog/onbuy-fees-explained).`,
  },
];
