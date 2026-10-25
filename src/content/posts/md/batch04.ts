import type { Post } from "../types";

// Batch 4: tools and pricing mechanics (SKU generator, break-even, psychological
// pricing, floor price, competitor monitoring). 9–18 Nov.
export const batch04: Post[] = [
  {
    slug: "sku-generator",
    title: "SKU generator: how to create SKUs for your products (free method)",
    description:
      "How to generate SKUs for your products: a simple naming system, a free spreadsheet formula to create SKUs in bulk, examples by product type, and mistakes to avoid.",
    keyword: "sku generator",
    secondary: ["how to create a sku", "sku naming convention", "sku format", "sku builder"],
    category: "Guides",
    date: "2026-10-25",
    readingMinutes: 6,
    takeaways: [
      "Decide a pattern first, such as CATEGORY-ITEM-VARIANT, then generate SKUs from it.",
      "A spreadsheet formula can build hundreds of SKUs from columns in seconds.",
      "Keep SKUs short, unique and limited to letters, numbers and hyphens.",
      "Dropshippers should build the supplier's product ID, such as the ASIN, into each SKU.",
    ],
    faq: [
      {
        q: "Is there a free SKU generator?",
        a: "A spreadsheet is the simplest free SKU generator: put each part of the code in its own column and join them with a formula. This guide shows the formula.",
      },
      {
        q: "How long should a SKU be?",
        a: "Usually 8 to 20 characters. Long enough to be unique and readable, short enough to type and to fit marketplace limits.",
      },
      {
        q: "Should SKUs be random?",
        a: "No. A meaningful SKU tells you what a product is at a glance, which helps with picking, reporting and spotting mistakes.",
      },
    ],
    related: ["sku-meaning", "what-is-an-asin", "ean-asin-gtin", "onbuy-listing-optimisation"],
    md: `A SKU generator turns a few facts about each product into a consistent, unique code. You don't need special software: decide a naming pattern, put the parts in a spreadsheet and join them with a formula. Here's how to build SKUs for hundreds of products in a few minutes.

## Step 1: choose your SKU pattern

Pick the parts that identify a product in your business, most general first:

| Business type | Pattern | Example |
|---|---|---|
| Clothing | TYPE-COLOUR-SIZE | TEE-BLK-M |
| Homeware | CAT-ITEM-VARIANT | KIT-KETTLE-17L |
| Electronics | BRAND-MODEL-COLOUR | ACME-X200-WHT |
| Dropshipping from Amazon | PREFIX-ASIN | AMZ-B0EXAMPLE1 |
| Several suppliers | SUPPLIER-CODE | ACME-10432 |

If you're new to SKUs, read [SKU meaning](/blog/sku-meaning) first.

## Step 2: abbreviate consistently

Use short codes and write them down so everyone uses the same ones:

- Colours: BLK, WHT, RED, NVY
- Sizes: XS, S, M, L, XL
- Categories: KIT (kitchen), GAR (garden), TOY

## Step 3: generate SKUs in a spreadsheet

Put each part in its own column (A = type, B = colour, C = size), then in column D:

**=UPPER(A2&"-"&B2&"-"&C2)**

Fill the formula down and every row gets a SKU. For dropshipping from Amazon, with the ASIN in column A:

**="AMZ-"&UPPER(TRIM(A2))**

## Step 4: check for duplicates

Every SKU must be unique. In a spreadsheet, use conditional formatting to highlight duplicates, or count each SKU with a COUNTIF formula and filter for any count above 1.

## SKU rules to follow

- **Letters, numbers and hyphens only.** No spaces, slashes or symbols.
- **Don't start with zero:** spreadsheets may drop it.
- **Avoid letters that look like numbers** (O and 0, I and 1) where you can.
- **Never reuse a SKU** for a different product, even after you stop selling the first.
- **Don't change SKUs** once listings and tools depend on them.

## Why put the supplier ID in the SKU?

Because tools can then link a listing to its source with no extra setup. [SellSail](/features), for example, reads the ASIN from each OnBuy SKU (stripping prefixes you set, such as "AMZ-"), looks up the live Amazon UK price and sets your OnBuy price and stock.

## Summary

Choose a pattern, abbreviate consistently, build SKUs with a formula, and check for duplicates. Ten minutes now saves hours of confusion as your catalogue grows.`,
  },
  {
    slug: "break-even-price",
    title: "Break-even price: how to calculate it (with a free calculator)",
    description:
      "How to calculate your break-even price as an online seller, including marketplace commission, payment fees and VAT, with worked examples and a free calculator.",
    keyword: "break even calculator",
    secondary: ["break even price", "how to calculate break even price", "break even formula"],
    category: "Fees and profit",
    date: "2026-10-25",
    readingMinutes: 7,
    takeaways: [
      "Your break-even price is the lowest price at which you make £0 after every cost.",
      "For marketplaces: break-even = (cost + fixed fees) ÷ (1 − percentage fees).",
      "If you're VAT-registered, VAT also comes out of the price, which raises break-even.",
      "Never let a repricer go below break-even plus a minimum profit.",
    ],
    faq: [
      {
        q: "What is the break-even price formula?",
        a: "Break-even price = (product cost + fixed costs per sale) ÷ (1 − percentage fees). Percentage fees include marketplace commission and payment fees.",
      },
      {
        q: "Does VAT affect my break-even price?",
        a: "Yes, if you're VAT-registered. VAT is a sixth of a VAT-inclusive price at 20%, so it must be covered too. Our fee calculator includes it.",
      },
      {
        q: "Is break-even the same as my floor price?",
        a: "Not quite. Break-even makes £0. A sensible floor is break-even plus a minimum profit, so every sale still earns something.",
      },
    ],
    related: ["floor-price", "profit-margin-formula", "onbuy-fees-explained", "margin-vs-markup"],
    md: `Your break-even price is the lowest price at which a sale makes exactly £0 after every cost. Sell below it and every order loses money. For marketplace sellers, it's the most important number on each listing, because fees are a percentage of the price and a simple "cost plus a bit" sum gets it wrong.

## What's the break-even formula for marketplace sellers?

**Break-even price = (product cost + fixed costs per sale) ÷ (1 − percentage fees)**

- **Product cost:** what you pay the supplier, including their delivery charge.
- **Fixed costs per sale:** anything charged per order, such as packaging or a fixed payment fee.
- **Percentage fees:** marketplace commission plus any percentage payment fee.

## Worked example (not VAT-registered)

A product costs £13.90 delivered. Commission is 15%. No other fees.

Break-even = 13.90 ÷ (1 − 0.15) = 13.90 ÷ 0.85 = **£16.35**

Check: 15% of £16.35 is £2.45, and £16.35 − £2.45 = £13.90. Exactly £0 profit.

## Worked example (VAT-registered)

If you're VAT-registered, a sixth of a VAT-inclusive price (at 20%) is VAT that goes to HMRC, and commission is usually charged on the full VAT-inclusive price. So both come out of the price:

Break-even = 13.90 ÷ (1 − 0.15 − 1/6) = 13.90 ÷ 0.6833 = **£20.34**

That's £4 higher than the non-VAT figure, which is why VAT-registered sellers who forget VAT end up selling at a loss.

## Break-even price table

Break-even prices at 15% commission:

| Product cost | Not VAT-registered | VAT-registered |
|---|---|---|
| £5.00 | £5.88 | £7.32 |
| £10.00 | £11.76 | £14.63 |
| £15.00 | £17.65 | £21.95 |
| £20.00 | £23.53 | £29.27 |
| £30.00 | £35.29 | £43.90 |

Calculate yours in our free [OnBuy fee calculator](/onbuy-fee-calculator), which shows break-even, profit and margin as you type.

## From break-even to a floor price

Break-even earns nothing, and a single refund turns it into a loss. Your **floor** should be break-even plus a minimum profit in pounds:

**Floor = (cost + minimum profit) ÷ (1 − percentage fees)**

With a £1 minimum profit, not VAT-registered: (13.90 + 1) ÷ 0.85 = £17.53. That's how SellSail's "protect profit" competition floor works. Read [What is a floor price?](/blog/floor-price)

## Why does break-even change?

- Your supplier changes their price.
- Marketplace fees change.
- You become VAT-registered.

That's why break-even should be recalculated automatically whenever the cost changes, not worked out once in a spreadsheet. Related: [the profit margin formula](/blog/profit-margin-formula).`,
  },
  {
    slug: "psychological-pricing",
    title: "Psychological pricing: does £9.99 still work for online sellers?",
    description:
      "Psychological pricing explained: charm prices like £9.99, anchoring, bundles and decoys, and how marketplace sellers can use them without losing margin.",
    keyword: "psychological pricing",
    secondary: ["charm pricing", "99p pricing", "pricing psychology", "price anchoring"],
    category: "Pricing",
    date: "2026-10-25",
    readingMinutes: 7,
    takeaways: [
      "Psychological pricing uses how people perceive numbers, such as £9.99 feeling cheaper than £10.",
      "Charm prices work best for impulse and value-led products; round prices can suit premium items.",
      "On marketplaces, being the cheapest offer by a few pence often matters more than the ending digits.",
      "Apply charm endings within your floor and ceiling, never at the expense of margin.",
    ],
    faq: [
      {
        q: "Why do prices end in 99?",
        a: "Because people read prices left to right and anchor on the first digit, so £9.99 can feel closer to £9 than to £10. This is called the left-digit effect.",
      },
      {
        q: "Does psychological pricing work online?",
        a: "Often, especially for lower-priced and impulse purchases. On marketplaces, where buyers compare offers side by side, relative price and delivery speed usually matter more.",
      },
      {
        q: "Should my repricer use .99 endings?",
        a: "It can round to a chosen ending, but only within your floor and ceiling. Never let a rounding rule push a price below your minimum profit.",
      },
    ],
    related: ["how-to-price-products", "dynamic-pricing", "price-war", "profit-margin-formula"],
    md: `Psychological pricing means setting prices that take advantage of how people perceive numbers, rather than only on cost. The best-known example is the charm price: £9.99 instead of £10. It isn't magic, but used carefully it can lift sales without cutting your margin.

## What are the main psychological pricing techniques?

| Technique | Example | Why it works |
|---|---|---|
| Charm pricing | £9.99 not £10 | The left-digit effect: buyers anchor on the first digit |
| Prestige pricing | £50 not £49.99 | Round numbers feel premium and simple |
| Anchoring | "Was £30, now £22" | The first number sets expectations |
| Decoy pricing | A middle option that makes the top one look good value | Comparison changes perceived value |
| Bundling | "3 for £20" | Feels like a deal and raises order value |
| Free delivery threshold | "Free delivery over £25" | Encourages a bigger basket |

## Does charm pricing still work?

For value-focused and impulse products, it generally does: buyers often perceive £9.99 as noticeably cheaper than £10. For premium or luxury products, round prices can signal quality instead.

## How should marketplace sellers use psychological pricing?

On a marketplace, buyers see several offers for the same product side by side. That changes the priorities:

1. **Relative price comes first.** Being 5p cheaper than the next offer often matters more than whether you end in .99.
2. **Delivery speed and rating matter.** A slightly higher price with faster dispatch can win.
3. **Endings still help** where you're the only offer, or on your own website.

## How do you combine charm pricing with profit rules?

Start from your cost-based price, then apply the ending, staying within your limits:

- Calculate the price that covers cost, fees and profit, such as £20.45.
- Round to a charm ending **upwards** if you're under your ceiling (£20.99), or **downwards** only if it stays above your floor (£19.99).
- Never round below your floor. See [What is a floor price?](/blog/floor-price)

> A pricing trick that pushes a sale below your minimum profit isn't clever pricing. It's a discount you didn't mean to give.

## Do anchors and "was" prices have rules?

Yes. In the UK, reference prices such as "was £30" must be genuine and not misleading under consumer protection law. Only show a previous price you really charged for a meaningful period.

## Summary

Psychological pricing can nudge buyers, but on marketplaces it works on top of good fundamentals: a price that covers every cost, a competitive position against other sellers, and fast delivery. Get those right first. Related: [How to price products](/blog/how-to-price-products).`,
  },
  {
    slug: "floor-price",
    title: "What is a floor price? Setting safe minimum prices for repricing",
    description:
      "What is a floor price in repricing, how to calculate one that covers fees, VAT and profit, and why fixed minimum prices go wrong when your supplier costs change.",
    keyword: "floor price",
    secondary: ["minimum price repricer", "min max price", "repricing floor", "price floor"],
    category: "Repricing",
    date: "2026-10-25",
    readingMinutes: 7,
    takeaways: [
      "A floor price is the lowest price a repricer may set for a listing.",
      "A good floor = (cost + minimum profit) ÷ (1 − percentage fees), recalculated whenever cost changes.",
      "Fixed floors typed into a spreadsheet go stale as soon as the supplier's price moves.",
      "Pair the floor with a ceiling and a maximum undercut to avoid price wars.",
    ],
    faq: [
      {
        q: "What's the difference between a floor price and break-even?",
        a: "Break-even is the price where you make £0. A floor is usually break-even plus a minimum profit, so every sale still earns something.",
      },
      {
        q: "What should my floor price be?",
        a: "Enough to cover product cost, marketplace commission, payment fees, VAT if you're registered, and the smallest profit you'd accept, often £1 to £3 per item.",
      },
      {
        q: "Can a floor price ever be below cost?",
        a: "Some sellers allow a small, capped loss to win sales on new listings and build reviews. If you do, set a strict maximum loss per sale and review it regularly.",
      },
    ],
    related: ["break-even-price", "repricing-strategies", "price-war", "what-is-a-repricer"],
    md: `A floor price is the lowest price your repricer is allowed to set for a listing. However cheap a competitor goes, your price stops at the floor. It's the single most important safety setting in repricing, because it's what stops automation selling at a loss.

## How do you calculate a floor price?

**Floor = (product cost + minimum profit) ÷ (1 − percentage fees)**

Example: product cost £13.90 delivered, minimum profit £1, 15% commission:

(13.90 + 1.00) ÷ 0.85 = **£17.53**

At £17.53, commission is £2.63 and you keep £14.90: your cost plus £1.

If you're VAT-registered, include VAT in the percentage: divide by (1 − 0.15 − 1/6) instead. Check yours in the [OnBuy fee calculator](/onbuy-fee-calculator).

## Why do fixed floor prices go wrong?

Many repricers ask you to type a minimum price for each product. That works until your cost changes:

| | Day 1 | Day 30 |
|---|---|---|
| Supplier cost | £13.90 | £16.20 |
| Floor typed on day 1 | £17.53 | £17.53 |
| Real floor needed | £17.53 | £20.24 |
| Profit at the old floor | £1.00 | −£1.30 |

On day 30, the repricer follows a rival down to £17.53 and loses £1.30 a sale, while you think you're protected.

> A floor is only safe if it moves with your cost. For dropshippers, whose costs change daily, it has to be recalculated automatically.

## What other limits should a repricer have?

- **Ceiling:** the highest price, usually your full cost-plus-margin price, so prices don't drift up when there's no competition.
- **Maximum undercut:** never more than a set amount below a rival, so one mispriced seller can't drag you to the floor.
- **Beat-by amount:** how far under the cheapest seller to go, usually a few pence.

## Two kinds of floor

| Strategy | Floor | When to use |
|---|---|---|
| Protect profit | Cost + fees + minimum profit | Most listings, most of the time |
| Win the sale | Cost + fees − a capped loss | New listings that need first sales and reviews |

SellSail offers both. "Protect profit" keeps at least your minimum profit after OnBuy commission and payment fees; "win the sale" allows a small loss up to the maximum you set. Either way, the floor is recalculated from the live Amazon price every time it changes, and your band price is always the ceiling. [See competition repricing](/features).

## Summary

A floor price protects every sale. Build it from your real cost plus fees plus a minimum profit, make sure it updates when your cost does, and pair it with a ceiling and a maximum undercut. Related: [Break-even price](/blog/break-even-price) and [Price war](/blog/price-war).`,
  },
  {
    slug: "competitor-price-monitoring",
    title: "Competitor price monitoring for small online sellers",
    description:
      "How to monitor competitor prices as a small UK online seller: what to track, manual and automated methods, how often to check, and how to respond without a price war.",
    keyword: "competitor price monitoring",
    secondary: ["price monitoring software", "competitor price tracking", "monitor competitor prices"],
    category: "Repricing",
    date: "2026-10-25",
    readingMinutes: 7,
    takeaways: [
      "Track the competitors that actually take your sales: the same product, on the same marketplace.",
      "Check prices as often as they change; on busy marketplaces that's every few minutes.",
      "Respond within rules: small undercuts, a floor and a ceiling.",
      "Monitoring is only half the job; the price change must reach the marketplace fast.",
    ],
    faq: [
      {
        q: "Is it legal to monitor competitor prices?",
        a: "Yes. Watching publicly available prices and setting your own prices independently is legal. Agreeing prices with competitors is not.",
      },
      {
        q: "How often should I check competitor prices?",
        a: "As often as they change. On marketplaces with many sellers, prices can move several times a day, so automated checks every few minutes to every half hour are common.",
      },
      {
        q: "Do I always need to match the cheapest price?",
        a: "No. Match or undercut only where your margin allows. Where a rival is below your floor, hold your price: speed, stock and reviews can still win sales.",
      },
    ],
    related: ["what-is-a-repricer", "repricing-strategies", "price-war", "onbuy-buy-box"],
    md: `Competitor price monitoring means tracking what other sellers charge for the same products, so you can respond before you lose sales or margin. For small UK sellers on marketplaces, the aim isn't to be cheapest everywhere; it's to know where a small price change wins a sale, and where it isn't worth it.

## What should you monitor?

- **The same product**, matched by barcode or catalogue ID, not "similar" items.
- **On the same marketplace**, because that's where buyers compare.
- **The offer that's winning**: the price buyers see first.
- **Delivery and seller rating**, which affect who wins at similar prices.

## How can you monitor competitor prices?

| Method | Effort | Speed | Best for |
|---|---|---|---|
| Manual checks | High | Slow | A handful of key products |
| Spreadsheet plus alerts | Medium | Daily | Small catalogues |
| Price monitoring software | Low | Hourly or faster | Larger catalogues, many channels |
| Repricer with built-in monitoring | Lowest | Minutes | Marketplace sellers who want automatic responses |

## How often should you check?

As often as prices change. On busy marketplaces that can be several times a day. If you only check weekly, you'll miss most changes and react to old data.

## How should you respond to a cheaper competitor?

1. **Check your floor.** Can you go lower and still make your minimum profit?
2. **If yes, undercut by a little:** a few pence is usually enough.
3. **If no, hold.** Don't follow a rival below your floor.
4. **Check again later.** When the rival raises their price or sells out, return to your normal price.

> Monitoring without fast action is just a report. The value comes from turning a competitor's price change into your price change within minutes.

## Competitor monitoring on OnBuy

OnBuy's seller API can report whether your listing is currently winning and the leading price when it isn't. SellSail uses this: it checks your listings every 10 to 30 minutes depending on your plan, stores the leading competitor price, and prices you just under it, but never below your floor. When you're winning, it holds for a few hours and then tries your full price again. [See how competition works](/features).

## Summary

Monitor the competitors who share your product page, check as often as prices move, and respond inside clear limits. Related: [Repricing strategies](/blog/repricing-strategies) and [Price war](/blog/price-war).`,
  },
];
