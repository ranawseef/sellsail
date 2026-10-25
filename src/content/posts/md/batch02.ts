import type { Post } from "../types";

// Batch 2: the OnBuy pillar and high-volume definition queries (UK, 1K–10K/month).
export const batch02: Post[] = [
  {
    slug: "how-to-sell-on-onbuy",
    title: "How to sell on OnBuy: the complete UK seller guide",
    description:
      "How to sell on OnBuy step by step: opening a seller account, listing products, understanding fees, pricing for profit, winning sales, dispatch, returns and automation.",
    keyword: "how to sell on onbuy",
    secondary: ["onbuy seller", "sell on onbuy uk", "onbuy marketplace", "selling on onbuy"],
    category: "Selling on OnBuy",
    date: "2026-10-26",
    readingMinutes: 13,
    takeaways: [
      "To sell on OnBuy you open a seller account, list products against OnBuy's catalogue, and ship orders within your stated dispatch time.",
      "OnBuy takes commission on each sale, usually from the full amount the buyer pays, so build prices that cover it.",
      "Win sales with competitive prices, fast dispatch and accurate stock rather than by always being cheapest.",
      "Use OnBuy's API to automate prices and stock once you have more than a handful of listings.",
    ],
    faq: [
      {
        q: "How do I start selling on OnBuy?",
        a: "Apply for an OnBuy seller account, complete verification, choose a seller plan, then list your products by matching them to OnBuy's catalogue or creating new product pages. Check OnBuy's seller centre for the current steps and requirements.",
      },
      {
        q: "How much does it cost to sell on OnBuy?",
        a: "OnBuy charges commission on each sale, which varies by category, and offers seller plans. Commission is usually taken from the full amount the buyer pays, including VAT and delivery. Always check OnBuy's current fee schedule.",
      },
      {
        q: "Can I dropship on OnBuy?",
        a: "Many OnBuy sellers dropship. You remain the seller of record and must meet OnBuy's dispatch, delivery and returns standards. Read OnBuy's seller policies before you start.",
      },
      {
        q: "How do I get more sales on OnBuy?",
        a: "Price competitively from your real costs, keep dispatch fast, keep stock accurate, write complete listings with good photos, and respond quickly to buyers. Automating price and stock helps you stay competitive without working round the clock.",
      },
    ],
    related: ["is-onbuy-legit", "onbuy-fees-explained", "onbuy-seller-account", "grow-onbuy-sales"],
    md: `Selling on OnBuy means listing your products on a UK online marketplace that handles the website, payments and buyer traffic, while you handle pricing, stock and dispatch. You open a seller account, list products, and OnBuy takes commission when you make a sale. This guide covers the whole journey, from your first listing to running hundreds on autopilot.

## Why sell on OnBuy?

OnBuy is a UK marketplace with a growing audience and far fewer sellers per product than Amazon or eBay. For a small UK business that means:

- **Less competition** on many listings, so a fair price can win the sale.
- **Commission-based fees**, so your costs scale with your sales.
- **API access**, so you can automate listings, prices and stock.

It's also a natural second channel if you already sell on Amazon or eBay. See [Is OnBuy legit?](/blog/is-onbuy-legit) for an honest look at the platform.

## Step 1: open an OnBuy seller account

Apply through OnBuy's seller sign-up. Expect to provide:

- your business details (sole trader or limited company);
- identity and address verification;
- bank details for payouts;
- your VAT number, if you're VAT-registered.

Choose the seller plan that fits your volume. Our [OnBuy seller account checklist](/blog/onbuy-seller-account) lists what to prepare so approval goes smoothly.

## Step 2: understand OnBuy fees before you list

OnBuy charges commission on each sale. The rate depends on the category, and it's usually taken from the full amount the buyer pays, including VAT and delivery. That detail matters: a 15% commission on a £24.99 item with £2.99 delivery is taken from £27.98, not £24.99.

Read [OnBuy fees explained](/blog/onbuy-fees-explained) for a worked example, and check your own numbers in the [OnBuy fee calculator](/onbuy-fee-calculator). Always confirm current rates in OnBuy's seller documentation.

## Step 3: list your products

Most products on OnBuy are listed against an existing product page in OnBuy's catalogue, matched by barcode (EAN). If the product isn't in the catalogue, you can usually create it.

A strong listing has:

- the correct **EAN** so it matches the right product;
- a clear **title** with brand, product type and key attribute;
- **good photos** you're allowed to use;
- an accurate **dispatch time** you can always meet;
- a **SKU** that tells you exactly where the item comes from.

More: [OnBuy listing optimisation](/blog/onbuy-listing-optimisation) and [EAN, ASIN and GTIN explained](/blog/ean-asin-gtin).

## Step 4: price for profit

Your price must cover four things: your cost, OnBuy's commission, VAT if you're registered, and your profit. Build it from the bottom up:

| Part | Example |
|---|---|
| Your cost (including delivery) | £13.90 |
| Profit you want (25%) | £3.48 |
| Divide by (1 − 15% commission) | ÷ 0.85 |
| **OnBuy price** | **£20.45** |

Then set a floor: the lowest price you'll accept. If another seller goes below it, let them; a sale at a loss is worse than no sale. Our guide to [pricing for OnBuy dropshipping](/blog/how-to-price-onbuy-dropshipping) goes deeper.

## Step 5: win more sales against other sellers

When several sellers offer the same product, buyers see the most competitive offer first. To win more of those sales:

- price a few pence under cheaper rivals, but only down to your floor;
- keep dispatch times short and reliable;
- keep stock accurate so you never cancel orders.

See [The OnBuy buy box explained](/blog/onbuy-buy-box) and [Repricing strategies](/blog/repricing-strategies).

## Step 6: dispatch, delivery and returns

- **Dispatch on time, every time.** Late dispatch hurts your seller performance.
- **Add tracking** to every order.
- **Handle returns under UK consumer law:** online buyers can usually cancel within 14 days of delivery. See [Handling OnBuy returns](/blog/onbuy-returns).

## Step 7: automate as you grow

With a few listings, you can manage prices and stock by hand. With hundreds, you can't: supplier prices and competitors change all day. OnBuy offers seller API keys so tools can update listings for you. Read [OnBuy API keys explained](/blog/onbuy-api-keys).

If you source from Amazon UK, [SellSail](/features) uses your OnBuy API keys to:

- read the live Amazon price behind every listing;
- set an OnBuy price that covers commission, payment fees and your profit;
- undercut cheaper OnBuy sellers down to your floor;
- send price and stock changes every few minutes, and set listings out of stock when Amazon runs out.

## OnBuy selling checklist

1. Seller account approved and bank details added.
2. Fees understood, and checked in the [fee calculator](/onbuy-fee-calculator).
3. Listings matched by EAN, with clear titles and photos.
4. Every price built from cost plus fees plus profit, with a floor.
5. Dispatch times you can always meet.
6. Stock and prices synced automatically.

Start with a small range, prove your margins, then scale. You can [try SellSail free for 14 days](/signup) to automate pricing and stock from day one.`,
  },
  {
    slug: "margin-vs-markup",
    title: "Margin vs markup: the difference (and why it costs sellers money)",
    description:
      "Margin vs markup explained with simple formulas, a conversion table and UK seller examples, so you never confuse the two and underprice your products.",
    keyword: "margin vs markup",
    secondary: ["markup vs margin", "difference between margin and markup", "margin and markup formula"],
    category: "Fees and profit",
    date: "2026-10-26",
    readingMinutes: 7,
    takeaways: [
      "Markup is profit as a percentage of cost; margin is profit as a percentage of the selling price.",
      "A 25% markup is only a 20% margin, so confusing them makes you underprice.",
      "To hit a target margin, divide cost by (1 − margin). To apply a markup, multiply cost by (1 + markup).",
      "Marketplace fees are a percentage of the selling price, so think in margin when pricing for a marketplace.",
    ],
    faq: [
      {
        q: "Is a 50% markup the same as a 50% margin?",
        a: "No. A 50% markup on a £10 cost gives a £15 price and a 33.3% margin. A 50% margin needs a £20 price, which is a 100% markup.",
      },
      {
        q: "Which should I use, margin or markup?",
        a: "Use margin for planning profit and comparing products, because fees and VAT are also percentages of the selling price. Markup is handy as a quick rule for setting prices from cost.",
      },
      {
        q: "How do I convert markup to margin?",
        a: "Margin = markup ÷ (1 + markup). For example, a 25% markup is 0.25 ÷ 1.25 = 20% margin.",
      },
      {
        q: "How do I convert margin to markup?",
        a: "Markup = margin ÷ (1 − margin). For example, a 20% margin is 0.20 ÷ 0.80 = 25% markup.",
      },
    ],
    related: ["profit-margin-formula", "break-even-price", "how-to-price-products", "onbuy-fees-explained"],
    md: `Margin and markup both describe profit, but they measure it against different things. **Markup** is profit as a percentage of your **cost**. **Margin** is profit as a percentage of your **selling price**. Mix them up and you'll price too low, which is one of the most common and expensive mistakes online sellers make.

## What is markup?

Markup is how much you add on top of cost.

**Markup = (price − cost) ÷ cost**

If an item costs you £10 and you sell it for £12.50, you've added £2.50. That's a 25% markup (2.50 ÷ 10).

## What is margin?

Margin is how much of the selling price is profit.

**Margin = (price − cost) ÷ price**

The same item: £2.50 profit on a £12.50 price is a 20% margin (2.50 ÷ 12.50).

Same sale, same £2.50 profit: 25% markup, 20% margin.

## Margin vs markup: conversion table

| Markup | Margin | Price for a £10 cost |
|---|---|---|
| 10% | 9.1% | £11.00 |
| 20% | 16.7% | £12.00 |
| 25% | 20.0% | £12.50 |
| 33.3% | 25.0% | £13.33 |
| 50% | 33.3% | £15.00 |
| 66.7% | 40.0% | £16.67 |
| 100% | 50.0% | £20.00 |

Formulas to convert between them:

- **Margin = markup ÷ (1 + markup)**
- **Markup = margin ÷ (1 − margin)**

## Why does the difference cost sellers money?

Suppose you want a 25% margin and you add 25% to cost. You get a 20% margin. On a £10,000 month of sales, that's £500 less profit than you planned, before any fees.

It gets worse on a marketplace, because fees are a percentage of the selling price too. A seller who "adds 30%" to cost and pays 15% commission thinks they're making 15%. They're actually making about 8%:

| | Amount |
|---|---|
| Cost | £10.00 |
| Price (30% markup) | £13.00 |
| 15% commission on price | £1.95 |
| Profit | £1.05 |
| Margin on price | 8.1% |

## How do you price for a target margin?

Divide your cost by (1 − the margin you want):

**Price = cost ÷ (1 − margin)**

For a 25% margin on a £10 cost: 10 ÷ 0.75 = £13.33.

On a marketplace, fold the fees into the same sum. With 15% commission and a 20% target margin, both come out of the price, so divide by (1 − 0.15 − 0.20) = 0.65: 10 ÷ 0.65 = £15.38. Check: 15% commission is £2.31, 20% margin is £3.08, and £10 + £2.31 + £3.08 = £15.39 (rounding).

Our [OnBuy fee calculator](/onbuy-fee-calculator) does this for you, VAT included.

## Should you use a minimum profit as well?

Yes. A percentage alone fails on cheap items: 25% of a £4 item is £1, which barely covers a refund. Good pricing rules use a percentage **and** a minimum profit in pounds, whichever is higher. That's exactly how SellSail's margin bands work: each band has a profit percentage and a minimum profit, and OnBuy commission is added on top. [See how pricing works](/features).

## Quick reference

- Markup = profit ÷ cost.
- Margin = profit ÷ price.
- Price for a target margin = cost ÷ (1 − margin).
- Marketplace fees come out of the price, so plan in margin.

Next: [the profit margin formula](/blog/profit-margin-formula) and [how to calculate your break-even price](/blog/break-even-price).`,
  },
  {
    slug: "what-is-an-asin",
    title: "What is an ASIN? Amazon's product number explained",
    description:
      "What is an ASIN, how do you find one, and how is it different from an EAN, UPC or ISBN? Plus how sellers use ASINs to price and sync listings on other marketplaces.",
    keyword: "what is an asin",
    secondary: ["asin meaning", "asin number", "asin lookup", "amazon asin"],
    category: "Guides",
    date: "2026-10-26",
    readingMinutes: 6,
    takeaways: [
      "An ASIN (Amazon Standard Identification Number) is a 10-character code Amazon gives every product in its catalogue.",
      "Most ASINs start with B0; for books, the ASIN is the 10-digit ISBN.",
      "You'll find it in the product page URL and in the product details section.",
      "Sellers on other marketplaces put the ASIN in their SKU so tools can match each listing to its Amazon source.",
    ],
    faq: [
      {
        q: "What does ASIN stand for?",
        a: "Amazon Standard Identification Number. It's Amazon's own identifier for a product in its catalogue.",
      },
      {
        q: "Is an ASIN the same in every country?",
        a: "Often, but not always. The same product can share an ASIN across Amazon marketplaces, but it can also differ, so always check the ASIN on amazon.co.uk for UK sourcing.",
      },
      {
        q: "Is an ASIN the same as a barcode?",
        a: "No. A barcode number (EAN or UPC) is a global standard issued through GS1. An ASIN is Amazon's internal number. One product usually has both.",
      },
      {
        q: "How do I find an ASIN quickly?",
        a: "Open the product on amazon.co.uk: the ASIN is the 10-character code after /dp/ in the web address, and it's listed under Product information or Product details.",
      },
    ],
    related: ["sku-meaning", "ean-asin-gtin", "amazon-dropshipping", "amazon-to-onbuy-dropshipping-step-by-step"],
    md: `An ASIN is the **Amazon Standard Identification Number**: a unique 10-character code Amazon gives each product in its catalogue. For most products it starts with "B0", for example B0EXAMPLE1. For books, the ASIN is the book's 10-digit ISBN. Amazon uses the ASIN to identify a product page, so every seller offering the same item lists against the same ASIN.

## Where do you find an ASIN?

There are two quick ways on amazon.co.uk:

1. **In the web address.** Open the product page; the ASIN is the 10-character code after "/dp/". In amazon.co.uk/dp/B0EXAMPLE1, the ASIN is B0EXAMPLE1.
2. **In the product details.** Scroll to "Product information" or "Product details"; the ASIN is listed there.

## What does an ASIN look like?

| Product type | Format | Example |
|---|---|---|
| Most products | 10 characters, letters and numbers, usually starting B0 | B0EXAMPLE1 |
| Books | The 10-digit ISBN | 0123456789 |

## How is an ASIN different from an EAN, UPC or ISBN?

| Identifier | Issued by | Used for |
|---|---|---|
| ASIN | Amazon | Amazon's catalogue only |
| EAN (13 digits) | GS1 | Barcodes on products sold in Europe and the UK |
| UPC (12 digits) | GS1 | Barcodes, mainly North America |
| ISBN | ISBN agencies | Books |
| GTIN | GS1 | The umbrella term for EAN, UPC and similar codes |

Most physical products have both a barcode number (EAN/UPC) and an ASIN. Other marketplaces, including OnBuy, usually match products by EAN. More in [EAN, ASIN and GTIN explained](/blog/ean-asin-gtin).

## Why do sellers care about ASINs?

- **To find a product on Amazon** precisely, without guessing from the title.
- **To compare prices**: one ASIN means one product page, with all its offers.
- **To dropship from Amazon:** the ASIN tells your tools which Amazon product a listing is sourced from.

## How do you use ASINs outside Amazon?

If you sell on another marketplace and source from Amazon UK, put the ASIN in your SKU, such as "AMZ-B0EXAMPLE1". Then:

- you always know where a listing comes from;
- repricing tools can look up the current Amazon price for that ASIN;
- stock can follow Amazon's availability automatically.

[SellSail](/features) works this way: it reads each listing's ASIN from its SKU (you can set prefixes it strips off), fetches the live Amazon UK offer, and prices your OnBuy listing with fees and profit built in.

## Can one product have more than one ASIN?

Occasionally. Variations (sizes, colours) usually have their own child ASINs under a parent, and duplicate pages sometimes exist. Always use the ASIN of the exact variation you're selling.

## Summary

An ASIN is Amazon's product number: 10 characters, usually starting B0, found in the URL after /dp/. It isn't a barcode, but it's the most reliable way to link a listing on another marketplace to its Amazon source. Next: [what a SKU is](/blog/sku-meaning) and how to structure them.`,
  },
  {
    slug: "sku-meaning",
    title: "SKU meaning: what a stock keeping unit is and how to use one",
    description:
      "SKU meaning explained: what a stock keeping unit is, how it differs from a barcode or ASIN, examples of good SKU formats, and how sellers use SKUs to automate.",
    keyword: "sku meaning",
    secondary: ["what is a sku", "sku number", "stock keeping unit", "sku vs barcode"],
    category: "Guides",
    date: "2026-10-26",
    readingMinutes: 6,
    takeaways: [
      "SKU stands for stock keeping unit: a code you create to identify each product you sell.",
      "Unlike a barcode, a SKU is yours: two shops can use different SKUs for the same item.",
      "Good SKUs are short, unique, consistent and readable, with no spaces or special characters.",
      "Putting the supplier's ID in the SKU lets tools match each listing to its source automatically.",
    ],
    faq: [
      {
        q: "What does SKU stand for?",
        a: "Stock keeping unit. It's an internal code a retailer uses to identify a specific product, including its variant such as size or colour.",
      },
      {
        q: "Is a SKU the same as a barcode?",
        a: "No. A barcode number such as an EAN is a global standard that's the same for every retailer. A SKU is your own code and can follow any format you choose.",
      },
      {
        q: "Does every product variation need its own SKU?",
        a: "Yes. Each size, colour or pack size you sell separately should have its own SKU, so stock and prices are tracked accurately.",
      },
      {
        q: "Can I change a SKU later?",
        a: "You can, but it often breaks links between your listings, stock records and tools. Choose a format you can keep for good.",
      },
    ],
    related: ["sku-generator", "what-is-an-asin", "ean-asin-gtin", "stock-sync-dropshipping"],
    md: `SKU stands for **stock keeping unit**. It's a code you create to identify each product you sell, down to the exact variant. "TSHIRT-BLK-M" might be your SKU for a black T-shirt in medium. SKUs are internal: you choose the format, and two shops can use different SKUs for the same item.

## What is a SKU used for?

- **Tracking stock** of each exact product and variant.
- **Matching orders** to the right item when you pick, pack or reorder.
- **Linking listings** across marketplaces and tools to the same product.
- **Reporting** sales and profit per product.

On marketplaces such as OnBuy, the SKU is how you, and your tools, refer to each listing: price and stock updates are sent "by SKU".

## SKU vs barcode vs ASIN

| | Who creates it | Same across retailers? | Example |
|---|---|---|---|
| SKU | You | No | AMZ-B0EXAMPLE1 |
| EAN / UPC barcode | GS1 (via the brand) | Yes | 5012345678900 |
| ASIN | Amazon | Within Amazon | B0EXAMPLE1 |

More detail: [EAN, ASIN and GTIN explained](/blog/ean-asin-gtin) and [What is an ASIN?](/blog/what-is-an-asin)

## What makes a good SKU?

- **Unique:** one SKU, one product variant.
- **Short:** easier to read and type; many systems limit length.
- **Consistent:** the same pattern for every product.
- **Readable:** a person can tell roughly what it is.
- **Safe characters:** letters, numbers and hyphens. Avoid spaces, slashes and symbols.
- **No leading zeros** that spreadsheets may strip.

## SKU format examples

| Business | Format | Example |
|---|---|---|
| Clothing | TYPE-COLOUR-SIZE | TSHIRT-BLK-M |
| Homeware | CATEGORY-ITEM-VARIANT | KIT-KETTLE-17L |
| Dropshipping from Amazon | PREFIX-ASIN | AMZ-B0EXAMPLE1 |
| Several suppliers | SUPPLIER-SUPPLIERCODE | ACME-10432 |

## How do dropshippers use SKUs?

For dropshippers, the most useful SKU contains the **supplier's product ID**. If you source from Amazon UK, put the ASIN in the SKU. Then any tool can work out where the listing comes from without a separate lookup table:

- the repricer reads the ASIN from the SKU;
- it looks up the current Amazon price;
- it sets your marketplace price and stock.

[SellSail](/features) does this for OnBuy listings: you tell it your SKU prefixes (such as "AMZ-"), it strips them to find the ASIN, and it prices and syncs each listing from the live Amazon UK offer.

## How do you create SKUs at scale?

Use a pattern and generate them, rather than inventing each one. Our guide to [SKU generators and naming rules](/blog/sku-generator) shows how to build SKUs in a spreadsheet in minutes.

## Summary

A SKU is your own product code. Make it unique, short and consistent, and if you dropship, build the supplier's ID into it. That one decision makes stock control, repricing and reporting far easier as you grow.`,
  },
  {
    slug: "profit-margin-formula",
    title: "Profit margin formula: how to calculate margin (with examples)",
    description:
      "The profit margin formula explained for UK sellers: gross and net margin, how to calculate them, worked examples with marketplace fees and VAT, and what a good margin is.",
    keyword: "profit margin calculator",
    secondary: ["profit margin formula", "how to calculate profit margin", "gross margin", "net profit margin"],
    category: "Fees and profit",
    date: "2026-10-26",
    readingMinutes: 8,
    takeaways: [
      "Profit margin = profit ÷ selling price × 100.",
      "Gross margin uses product cost only; net margin subtracts every cost, including fees, VAT, delivery and refunds.",
      "On a marketplace, commission comes out of the selling price, so it hits margin directly.",
      "If you're VAT-registered, calculate margin on the price excluding VAT.",
    ],
    faq: [
      {
        q: "What is the formula for profit margin?",
        a: "Profit margin = (selling price − total cost) ÷ selling price × 100. Use the selling price excluding VAT if you're VAT-registered.",
      },
      {
        q: "What is a good profit margin for an online shop?",
        a: "It depends on the product and channel. Many marketplace sellers aim for a net margin of 10–20% after all fees, with a minimum profit in pounds on cheaper items.",
      },
      {
        q: "What's the difference between gross and net margin?",
        a: "Gross margin only subtracts the cost of the product. Net margin subtracts everything else as well: commission, payment fees, delivery, packaging, refunds and tools.",
      },
      {
        q: "How do I calculate the price for a target margin?",
        a: "Divide your cost by (1 − target margin − percentage fees). For a £10 cost, 15% commission and a 20% target margin: 10 ÷ 0.65 = £15.38.",
      },
    ],
    related: ["margin-vs-markup", "break-even-price", "onbuy-fees-explained", "hidden-costs-of-selling-online"],
    md: `Profit margin tells you how much of each pound of sales you keep as profit. The formula is simple:

**Profit margin = (selling price − total cost) ÷ selling price × 100**

Sell for £20 with £15 of total cost and your margin is 25%. The hard part isn't the formula; it's counting every cost, which is where most online sellers overstate their margins.

## Gross margin vs net margin

| | What you subtract | Use it for |
|---|---|---|
| Gross margin | Product cost only | Comparing products and suppliers |
| Net margin | Every cost: product, delivery, fees, VAT, refunds, tools | Knowing what you really earn |

For marketplace sellers, net margin is the number that matters.

## How do you calculate profit margin step by step?

1. **Start with the selling price.** If you're VAT-registered, use the price excluding VAT.
2. **Subtract the product cost**, including the supplier's delivery charge.
3. **Subtract marketplace commission**, usually a percentage of the full price the buyer pays.
4. **Subtract payment fees**, if charged separately.
5. **Subtract an allowance for returns** and other costs.
6. **Divide what's left by the selling price.**

## Worked example: a marketplace sale

A VAT-registered seller sells an item for £24.99 including VAT, with free delivery.

| | Amount |
|---|---|
| Price paid by buyer | £24.99 |
| VAT (20% of VAT-inclusive price: 24.99 ÷ 6) | −£4.17 |
| Price excluding VAT | £20.82 |
| Commission (15% of £24.99) | −£3.75 |
| Product cost, delivered | −£13.90 |
| **Profit** | **£3.17** |
| **Net margin** (3.17 ÷ 20.82) | **15.2%** |

Notice that commission is charged on the VAT-inclusive price, so it's larger than 15% of your ex-VAT revenue. That's why margin always looks smaller than sellers expect. Try your own numbers in the [OnBuy fee calculator](/onbuy-fee-calculator).

## What is a good profit margin?

There's no single answer, but for UK marketplace sellers:

| Net margin | What it usually means |
|---|---|
| Under 5% | Fragile: one return or price change wipes it out |
| 5–10% | Workable for fast-moving, low-risk items |
| 10–20% | A healthy target for most marketplace products |
| Over 20% | Strong, often niche or less competitive products |

Use a **minimum profit in pounds** too. A 15% margin on a £6 item is 90p, which a single refund erases.

## How do you price to hit a target margin?

Turn the formula round. When the percentage fees and your target margin all come out of the selling price:

**Price = cost ÷ (1 − commission % − payment fee % − target margin %)**

For a £10 cost, 15% commission and a 20% target margin: 10 ÷ (1 − 0.15 − 0.20) = £15.38.

Many sellers find it easier to think in profit on cost, then add fees. That's how SellSail prices: each margin band has a profit percentage and a minimum profit, then OnBuy commission and payment fees are added so the price covers them. [See how it works](/features).

## Why does margin change after you list?

- Your supplier's price changes.
- A competitor undercuts you and you follow.
- Marketplace fees change.
- Returns rise for a product.

That's why margins need watching continuously, not once at listing. Automating price updates from the current supplier cost keeps every listing at the margin you chose.

## Summary

Profit margin = profit ÷ selling price. Count every cost, use ex-VAT prices if you're registered, and set a minimum profit in pounds. Then let your prices follow your costs automatically. Related: [margin vs markup](/blog/margin-vs-markup) and [how to calculate your break-even price](/blog/break-even-price).`,
  },
];
