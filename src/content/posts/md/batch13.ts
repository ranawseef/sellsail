import type { Post } from "../types";

// Batch 13: second wave, high-volume topics from Google Keyword Planner (UK,
// 17 Nov 2026). Publishing order and dates are set in ../index.ts.
export const batch13: Post[] = [
  {
    slug: "royal-mail-click-and-drop",
    title: "Royal Mail Click & Drop: a guide for UK online sellers",
    description:
      "Royal Mail Click & Drop explained for online sellers: what it is, how to set it up, marketplace integrations, printing labels, tracked services and saving time.",
    keyword: "royal mail click and drop",
    secondary: ["click and drop royal mail", "click and drop login", "royal mail click and drop integrations", "print postage labels uk"],
    category: "Guides",
    date: "2026-11-20",
    readingMinutes: 6,
    takeaways: [
      "Click & Drop is Royal Mail's free online tool for buying postage and printing labels in bulk.",
      "It can import orders from popular marketplaces and shop platforms, so you do not retype addresses.",
      "You can pay as you go or use a business account for discounted rates.",
      "It saves the most time once you send more than a handful of parcels a day.",
    ],
    faq: [
      {
        q: "Is Royal Mail Click & Drop free?",
        a: "The tool itself is free to use. You pay for the postage you buy through it, either online prices as you go or business account rates if you have a contract.",
      },
      {
        q: "Can Click & Drop import my marketplace orders?",
        a: "Yes. Click & Drop integrates with several marketplaces and shop platforms, and can also import orders from a CSV file. Check Royal Mail's current list of integrations for your channels.",
      },
      {
        q: "Do I need a special printer for Click & Drop?",
        a: "No. You can print labels on a normal printer on A4 paper, but a thermal label printer is faster and cheaper per label once you ship regularly.",
      },
    ],
    related: ["cheapest-courier-uk", "packaging-for-ecommerce", "dropshipping-customer-service", "hidden-costs-of-selling-online"],
    md: `Royal Mail Click & Drop is a free online tool from Royal Mail that lets you buy postage, print labels and manage parcels in bulk. Online sellers connect their marketplace or shop, import orders automatically, choose a service for each parcel, and print all labels in one go. You only pay for the postage.

## What Click & Drop does

| Feature | Why it helps sellers |
|---|---|
| Order import | Pulls orders from connected channels or a CSV, so no retyping addresses |
| Bulk labels | Print dozens of labels at once |
| Service rules | Set default services by weight or channel |
| Tracking | Tracking numbers can be sent back to the marketplace |
| Customs forms | Generates customs paperwork for international parcels |
| Manifests | Prepares collection or drop-off paperwork |

## How to set up Click & Drop

1. Create a free Click & Drop account on the Royal Mail website.
2. Add your sender address and default parcel sizes.
3. Connect your sales channels, or upload orders by CSV.
4. Set rules, for example "under 2 kg goes Tracked 48".
5. Choose how you pay: online postage as you go, or a business account.
6. Print labels and either drop parcels at a Post Office or customer service point, or book a collection.

## Online postage vs a business account

Postage bought online is cheaper than at the Post Office counter. Once you send larger volumes, a Royal Mail business account can bring lower rates and collections. Compare the numbers against other carriers in our [cheapest courier UK](/blog/cheapest-courier-uk) guide.

## Which service should you choose?

- **Tracked 24 / Tracked 48:** good default for marketplace orders, because buyers and marketplaces like tracking.
- **First and Second Class (untracked):** cheapest for low-value, light items, but harder to prove delivery.
- **Special Delivery:** guaranteed next day with higher compensation, for valuable items.

Marketplaces judge you on on-time delivery and valid tracking, so tracked services usually pay for themselves.

## Tips to save time

- Use a thermal label printer.
- Save parcel presets for your common products.
- Ship at the same time every day and set your dispatch time on each marketplace to match.
- Keep a stock of the right packaging (see [packaging for ecommerce](/blog/packaging-for-ecommerce)).

## Count postage in your prices

Postage is one of the biggest [hidden costs](/blog/hidden-costs-of-selling-online) of selling online. Add it to every product's cost before you set a price. If you sell on OnBuy, the [OnBuy fee calculator](/onbuy-fee-calculator) includes delivery in its profit figure.`,
  },
  {
    slug: "how-to-calculate-vat",
    title: "VAT calculator: how to add or remove 20% VAT (UK)",
    description:
      "How to calculate VAT in the UK: add 20% VAT, remove VAT from a gross price, reduced rates, quick reference table and worked examples for online sellers.",
    keyword: "vat calculator",
    secondary: ["how to calculate vat", "remove vat from price", "add vat to price", "reverse vat calculator uk"],
    category: "Fees and profit",
    date: "2026-11-21",
    readingMinutes: 5,
    takeaways: [
      "To add 20% VAT, multiply the net price by 1.2.",
      "To remove 20% VAT from a gross price, divide by 1.2. The VAT is the gross price divided by 6.",
      "Taking 20% off a gross price is wrong: it overstates the VAT.",
      "VAT-registered sellers must account for VAT on every sale, so price from the net figure.",
    ],
    faq: [
      {
        q: "How do I calculate 20% VAT?",
        a: "Multiply the price before VAT by 0.2 to get the VAT, or by 1.2 to get the price including VAT. For example, £50 plus VAT is £50 × 1.2 = £60.",
      },
      {
        q: "How do I remove VAT from a price?",
        a: "Divide the price including VAT by 1.2 to get the price before VAT. The VAT part is the gross price divided by 6. For example, £60 including VAT is £50 plus £10 VAT.",
      },
      {
        q: "Why can't I just take 20% off to remove VAT?",
        a: "Because VAT is 20% of the net price, not of the gross price. Taking 20% off £60 gives £48, but the correct net price is £50.",
      },
      {
        q: "What are the UK VAT rates?",
        a: "The standard rate is 20%. A reduced rate of 5% applies to some goods and services, such as children's car seats and home energy, and some items are zero rated, such as most food and children's clothes.",
      },
    ],
    related: ["vat-for-online-sellers-uk", "trading-allowance-selling-online", "profit-margin-formula", "how-to-calculate-markup"],
    md: `To calculate UK VAT at 20%, multiply a net price by 1.2 to add VAT, or divide a gross price by 1.2 to remove it. The VAT inside a gross price is simply the gross price divided by 6. For example, £60 including VAT is £50 net plus £10 VAT.

## VAT formulas

| You have | You want | Formula (20% VAT) |
|---|---|---|
| Net price | VAT amount | net × 0.2 |
| Net price | Gross price | net × 1.2 |
| Gross price | Net price | gross ÷ 1.2 |
| Gross price | VAT amount | gross ÷ 6 |

For the 5% reduced rate, use 1.05 instead of 1.2, and divide the gross by 21 to find the VAT.

## Quick reference table (20% VAT)

| Net | VAT | Gross |
|---|---|---|
| £8.33 | £1.67 | £10.00 |
| £16.66 | £3.33 | £19.99 |
| £20.83 | £4.17 | £25.00 |
| £24.99 | £5.00 | £29.99 |
| £41.66 | £8.33 | £49.99 |
| £83.33 | £16.67 | £100.00 |

## The common mistake: taking 20% off

VAT is 20% of the **net** price. So removing VAT means dividing by 1.2, not subtracting 20%.

- Wrong: £60 − 20% = £48
- Right: £60 ÷ 1.2 = £50

On a whole catalogue, this mistake makes you think you pay more VAT than you do, or worse, it hides where your margin goes.

## VAT for online sellers

If you are VAT registered, a sixth of every standard-rated sale price belongs to HMRC. On marketplaces, that means:

1. Start from the gross price the buyer pays.
2. Remove the VAT (÷ 6).
3. Subtract marketplace fees and your costs from what is left.

You can usually reclaim the VAT you pay on marketplace fees and stock. Our [VAT for online sellers](/blog/vat-for-online-sellers-uk) guide explains registration and the £90,000 threshold, and the [trading allowance guide](/blog/trading-allowance-selling-online) covers when HMRC needs to hear from you at all.

## Worked example: a £24.99 product

| Line | Amount |
|---|---|
| Price paid by buyer | £24.99 |
| VAT (£24.99 ÷ 6) | £4.17 |
| Net sales price | £20.82 |

Your fees and costs come out of £20.82, not £24.99.

## Let the numbers be done for you

The free [OnBuy fee calculator](/onbuy-fee-calculator) removes VAT and OnBuy fees for you and shows profit per item. To compare margin and markup after VAT, see [how to calculate markup](/blog/how-to-calculate-markup) and the [profit margin formula](/blog/profit-margin-formula).`,
  },
  {
    slug: "how-to-sell-on-ebay-uk",
    title: "How to sell on eBay UK: a step-by-step guide for 2026",
    description:
      "How to sell on eBay UK step by step: account set-up, private vs business, creating listings, pricing, postage, fees, getting paid and growing your sales.",
    keyword: "how to sell on ebay uk",
    secondary: ["selling on ebay uk", "how to sell on ebay for beginners", "ebay business account uk", "ebay listing tips"],
    category: "Marketplaces",
    date: "2026-11-22",
    readingMinutes: 7,
    takeaways: [
      "Create an eBay account, choose private or business, add payout details and verify your identity.",
      "Good listings have a clear keyword-led title, sharp photos, accurate item specifics and honest condition notes.",
      "Price by checking sold listings, not asking prices, and include postage in your sums.",
      "Business sellers pay final value fees, so check profit after fees before listing.",
    ],
    faq: [
      {
        q: "Is it free to sell on eBay UK?",
        a: "Private sellers pay no final value fee in most categories. Business sellers pay final value fees and a per-order fee. Optional upgrades and promoted listings cost extra.",
      },
      {
        q: "How do I get paid on eBay UK?",
        a: "eBay manages payments. After a sale, your earnings are paid to your bank account on a regular payout schedule once the order is processed.",
      },
      {
        q: "Should I sell on eBay as a business?",
        a: "If you buy items to resell, make items to sell, or sell regularly for profit, register as a business seller. Selling your own unwanted things is private selling.",
      },
    ],
    related: ["ebay-fees-uk", "ebay-dropshipping-uk", "onbuy-vs-ebay", "write-product-descriptions"],
    md: `To sell on eBay UK, create an account, choose private or business, add your bank details for payouts and verify your identity. Then list each item with a clear title, good photos, item specifics and a price based on recent sold listings. Post orders quickly with tracking and keep an eye on fees.

## Step 1: set up your account

1. Register at ebay.co.uk with your email or phone.
2. Choose **private** (selling your own things) or **business** (buying to resell, making to sell, or regular selling for profit).
3. Add bank details for payouts and complete identity checks.

Business sellers must also show business contact details and accept returns within consumer law (see [consumer rights for online sellers](/blog/consumer-rights-online-sellers)).

## Step 2: research what to sell and at what price

Search for the item, then filter by **Sold items**. That shows real selling prices, not hopeful asking prices. Note what the winning listings have in common: photos, condition, postage.

## Step 3: create a strong listing

| Part | What good looks like |
|---|---|
| Title | Brand, model, key feature, size or colour. Use the words buyers type |
| Photos | Bright, plain background, several angles, any flaws shown |
| Item specifics | Fill in every relevant field: they drive search filters |
| Condition | Honest, with notes on any wear |
| Description | Short, scannable, answers common questions |

Our guide to [writing product descriptions](/blog/write-product-descriptions) works on eBay too.

## Step 4: choose a format and price

- **Buy It Now** for most items with a known value.
- **Auction** for rare or collectable items where demand is uncertain.

Include postage in your sums. Free postage listings often rank well, but the cost then comes out of your price.

## Step 5: postage

Weigh and measure the packed item before listing. Use tracked services for anything valuable. See [cheapest courier UK](/blog/cheapest-courier-uk) and [Royal Mail Click & Drop](/blog/royal-mail-click-and-drop) to keep postage cheap and fast.

## Step 6: understand the fees

Business sellers pay a final value fee on the total sale plus a per-order fee, and promoted listings add an ad rate. Our [eBay fees guide](/blog/ebay-fees-uk) includes a simple fee formula and a worked example.

## Step 7: grow

- Reply to messages within a day.
- Dispatch on time to protect your seller level.
- List consistently: more live listings mean more chances to be found.
- Consider an eBay shop once you list regularly.
- Add a second marketplace. Many eBay sellers add OnBuy, where commission is generally lower and there is less competition per listing. See [OnBuy vs eBay](/blog/onbuy-vs-ebay).`,
  },
  {
    slug: "gross-vs-net-profit-margin",
    title: "Gross vs net profit margin: formulas and examples",
    description:
      "Gross profit margin vs net profit margin explained with formulas, worked examples for online sellers, typical ranges, and how to improve each one.",
    keyword: "gross profit margin",
    secondary: ["net profit margin", "gross margin vs net margin", "gross profit margin formula", "net profit margin formula"],
    category: "Fees and profit",
    date: "2026-11-23",
    readingMinutes: 6,
    takeaways: [
      "Gross profit margin = (revenue − cost of goods sold) ÷ revenue × 100.",
      "Net profit margin = (revenue − all costs) ÷ revenue × 100, including fees, postage, software and tax.",
      "For marketplace sellers, the gap between gross and net margin is mostly fees, delivery and returns.",
      "Track both: gross margin shows your buying, net margin shows whether the business makes money.",
    ],
    faq: [
      {
        q: "What is the difference between gross and net profit margin?",
        a: "Gross profit margin only subtracts the cost of the goods you sold. Net profit margin subtracts every cost, including marketplace fees, delivery, software, staff and tax, so it is always lower.",
      },
      {
        q: "What is a good net profit margin for an online seller?",
        a: "It varies by category and model. Many small UK marketplace sellers aim for roughly 10% to 20% net margin; dropshippers often run lower and own-brand sellers higher.",
      },
      {
        q: "Is gross margin the same as markup?",
        a: "No. Gross margin is profit as a percentage of the selling price; markup is profit as a percentage of cost. A 50% markup is a 33% margin.",
      },
    ],
    related: ["profit-margin-formula", "margin-vs-markup", "cost-of-goods-sold", "how-to-calculate-markup"],
    md: `Gross profit margin is the share of each sale left after paying for the goods themselves: (revenue − cost of goods sold) ÷ revenue × 100. Net profit margin is what is left after **every** cost, including marketplace fees, delivery, software and tax: (revenue − all costs) ÷ revenue × 100. Net margin is always lower, and it is the one that pays you.

## The formulas

| Measure | Formula |
|---|---|
| Gross profit | Revenue − cost of goods sold |
| Gross profit margin | Gross profit ÷ revenue × 100 |
| Net profit | Revenue − all costs |
| Net profit margin | Net profit ÷ revenue × 100 |

Use revenue **excluding VAT** if you are VAT registered (see [how to calculate VAT](/blog/how-to-calculate-vat)).

## Worked example: one month of marketplace sales

| Line | Amount |
|---|---|
| Revenue (ex VAT) | £10,000 |
| Cost of goods sold | −£5,500 |
| **Gross profit** | **£4,500 (45% gross margin)** |
| Marketplace fees | −£1,300 |
| Postage and packaging | −£1,200 |
| Returns and refunds | −£300 |
| Software and subscriptions | −£150 |
| **Net profit before tax** | **£1,550 (15.5% net margin)** |

A 45% gross margin looks healthy, but fees and delivery take two-thirds of it. That is why marketplace sellers need to watch net margin per product.

## What goes into cost of goods sold?

For online sellers, cost of goods sold usually includes the product price and inbound delivery to you. Our guide to [cost of goods sold](/blog/cost-of-goods-sold) explains what to include and what to leave out.

## How to improve gross margin

- Negotiate better supplier prices or buy in larger quantities.
- Drop products with thin margins.
- Raise prices where you have little competition (see [price elasticity](/blog/price-elasticity)).

## How to improve net margin

- Compare marketplace fees: the same product can earn more on a lower-commission channel.
- Cut postage costs (see [cheapest courier UK](/blog/cheapest-courier-uk)).
- Reduce returns with accurate descriptions and photos.
- Stop repricing below cost with a firm [floor price](/blog/floor-price).

## Gross margin vs markup

Margin divides profit by the selling price, markup divides it by cost. They are easy to confuse. See [margin vs markup](/blog/margin-vs-markup) and [how to calculate markup](/blog/how-to-calculate-markup).

## Check margin per product

Averages hide loss-makers. Work out net profit on every product after fees. For OnBuy listings, the [OnBuy fee calculator](/onbuy-fee-calculator) shows net profit and margin per item, and the [profit margin formula](/blog/profit-margin-formula) guide covers the maths in more depth.`,
  },
  {
    slug: "how-to-calculate-markup",
    title: "How to calculate markup: formula, calculator and examples",
    description:
      "How to calculate markup: the markup formula, a quick markup to margin table, worked examples, and how to set a selling price from cost for online sellers.",
    keyword: "markup calculator",
    secondary: ["how to calculate markup", "markup formula", "markup percentage", "markup to margin"],
    category: "Pricing",
    date: "2026-11-24",
    readingMinutes: 5,
    takeaways: [
      "Markup % = (selling price − cost) ÷ cost × 100.",
      "Selling price = cost × (1 + markup %).",
      "Markup is always a bigger number than margin for the same product: 50% markup is 33% margin.",
      "Marketplace sellers should add fees and VAT before applying markup, or price from target margin instead.",
    ],
    faq: [
      {
        q: "How do you calculate markup?",
        a: "Subtract the cost from the selling price, divide by the cost and multiply by 100. For example, an item costing £10 that sells for £15 has a 50% markup.",
      },
      {
        q: "How do I set a price with a markup?",
        a: "Multiply the cost by one plus the markup. For a 40% markup on a £10 item, the price is £10 × 1.4 = £14.",
      },
      {
        q: "What markup gives a 25% margin?",
        a: "A 33.3% markup gives a 25% margin. To convert, markup = margin ÷ (1 − margin).",
      },
    ],
    related: ["margin-vs-markup", "gross-vs-net-profit-margin", "how-to-price-products", "profit-margin-formula"],
    md: `To calculate markup, take the selling price minus the cost, divide by the cost and multiply by 100. An item costing £10 that sells for £15 has a 50% markup. To set a price from a markup, multiply the cost by (1 + markup), so £10 at 40% markup is £14.

## Markup formulas

| You want | Formula |
|---|---|
| Markup % | (price − cost) ÷ cost × 100 |
| Selling price | cost × (1 + markup) |
| Markup from margin | margin ÷ (1 − margin) |
| Margin from markup | markup ÷ (1 + markup) |

## Markup to margin table

| Markup | Margin |
|---|---|
| 20% | 16.7% |
| 25% | 20% |
| 33.3% | 25% |
| 50% | 33.3% |
| 75% | 42.9% |
| 100% | 50% |
| 150% | 60% |

If you think in margin but your supplier talks markup, use this table. More on the difference in [margin vs markup](/blog/margin-vs-markup).

## Worked examples

**Example 1:** cost £8, price £12. Markup = (12 − 8) ÷ 8 = 50%.

**Example 2:** you want a 60% markup on a £25 item. Price = £25 × 1.6 = £40.

**Example 3:** you want a 30% margin. Markup = 0.3 ÷ 0.7 = 42.9%, so a £20 item sells at £28.57.

## The trap for marketplace sellers

A simple markup on cost ignores marketplace fees and VAT. Say your item costs £10 and you add 50%: £15. On a marketplace taking 15% commission, with 20% VAT, the numbers become:

| Line | Amount |
|---|---|
| Price | £15.00 |
| VAT (÷ 6) | −£2.50 |
| Commission (15%) | −£2.25 |
| Cost | −£10.00 |
| **Profit** | **£0.25** |

A "50% markup" earns 25p. The fix is to include fees and VAT in the cost before marking up, or work backwards from your target profit. See [how to calculate VAT](/blog/how-to-calculate-vat) and [how to price products](/blog/how-to-price-products).

## Markup by product type

There is no single right markup. Cheap items often need high markups to cover fixed costs like postage, while expensive items can work on lower ones. What matters is the profit left after every cost, which the [gross vs net profit margin](/blog/gross-vs-net-profit-margin) guide explains.

## Price from cost automatically

For OnBuy, the free [OnBuy fee calculator](/onbuy-fee-calculator) works backwards from your cost and target profit to the right selling price, including OnBuy's fees and VAT. SellSail does the same for every product in your catalogue.`,
  },
  {
    slug: "print-on-demand-uk",
    title: "Print on demand UK: how it works, costs and best options",
    description:
      "Print on demand in the UK: how POD works, UK-based printers, costs and margins, what sells, where to sell, and how it compares with dropshipping.",
    keyword: "print on demand uk",
    secondary: ["print on demand companies uk", "uk print on demand", "print on demand t shirts uk", "is print on demand profitable"],
    category: "Dropshipping",
    date: "2026-11-25",
    readingMinutes: 7,
    takeaways: [
      "Print on demand (POD) means a printer makes and ships your design only after a customer orders.",
      "Choose a provider that prints in the UK: delivery is faster and buyers avoid import charges.",
      "Margins depend on base cost, shipping and marketplace fees. Many POD items earn a few pounds each.",
      "Original designs aimed at a clear niche sell; copying brands or artwork risks takedowns and legal claims.",
    ],
    faq: [
      {
        q: "Is print on demand profitable in the UK?",
        a: "It can be, but margins per item are modest because the printer's base price is higher than bulk printing. Profitable POD sellers focus on niches, original designs and keeping fees and delivery under control.",
      },
      {
        q: "Do I need a UK print on demand company?",
        a: "It is strongly recommended for UK customers. Printing in the UK means faster delivery and no import VAT or customs charges for your buyers.",
      },
      {
        q: "What sells best with print on demand?",
        a: "T-shirts, hoodies, mugs, tote bags, posters and phone cases are the most common. Niche designs for hobbies, professions, pets and occasions tend to outperform generic slogans.",
      },
    ],
    related: ["dropshipping-vs-wholesale", "shopify-vs-etsy", "etsy-fees-uk", "side-hustle-ideas-uk"],
    md: `Print on demand (POD) in the UK means you upload designs, list products like T-shirts or mugs, and a print partner prints and ships each item only when a customer orders. You hold no stock. To do it well, pick a provider that prints in the UK, design for a clear niche, and price so the margin survives the base cost, delivery and marketplace fees.

## How print on demand works

1. You create designs and add them to products in the POD provider.
2. You connect the provider to your shop (Etsy, Shopify, eBay and others).
3. A customer orders and pays you the retail price.
4. The provider charges you the base price plus delivery, then prints and ships.
5. You keep the difference, minus marketplace fees.

## Why print in the UK?

| | Printed in the UK | Printed abroad |
|---|---|---|
| Delivery | Usually a few days | One to several weeks |
| Customs and import VAT | None for UK buyers | Possible charges or delays |
| Marketplace delivery targets | Easier to meet | Risky |
| Returns | Simpler | Harder |

Most big POD platforms have UK print partners. Check where each product is printed, not just where the company is based.

## What does POD cost?

| Cost | Typical range |
|---|---|
| Base price (T-shirt) | Several pounds to over ten |
| Delivery | A few pounds per item |
| Marketplace or shop fees | Depends on channel (see [Etsy fees UK](/blog/etsy-fees-uk)) |
| Design | Your time, or paid design work |

That leaves many POD items earning a few pounds each. Volume and good designs matter more than price.

## What sells

- Niche designs: specific hobbies, jobs, pets, local places
- Personalised items: names, dates, custom text
- Occasions: birthdays, weddings, Christmas
- Clean, high-quality artwork that prints well

Avoid copying brands, characters, song lyrics or other people's artwork. It gets listings removed and can lead to legal claims.

## Where to sell POD products

- **Etsy:** strong for personalised and gift items.
- **Your own shop:** more control, but you bring the traffic (see [Shopify vs Etsy](/blog/shopify-vs-etsy)).
- **eBay and other marketplaces:** extra reach.

## POD vs dropshipping

POD sells your own designs on blank products. Dropshipping sells existing products from a supplier. POD is easier to brand and harder to copy, but has lower margins per item and longer production times. See [dropshipping vs wholesale](/blog/dropshipping-vs-wholesale) for the wider picture.

## Check your margin per product

Before listing, add up base price, delivery and fees for each product and size. Larger sizes often cost more, so a single price for every size can quietly lose money on the big ones.`,
  },
  {
    slug: "price-elasticity",
    title: "Price elasticity of demand: what it means for online sellers",
    description:
      "Price elasticity of demand explained for online sellers: the formula, elastic vs inelastic products, worked examples, and how to use it to set better prices.",
    keyword: "price elasticity",
    secondary: ["price elasticity of demand", "price elasticity formula", "elastic vs inelastic demand", "price elasticity examples"],
    category: "Pricing",
    date: "2026-11-26",
    readingMinutes: 6,
    takeaways: [
      "Price elasticity of demand measures how much sales change when price changes.",
      "Formula: % change in quantity sold ÷ % change in price.",
      "Elastic products (many identical sellers) lose lots of sales when price rises; inelastic products barely notice.",
      "Online sellers can measure it by testing small price changes and watching sales.",
    ],
    faq: [
      {
        q: "What is price elasticity of demand?",
        a: "It measures how sensitive buyers are to price. If a 10% price rise causes a 20% fall in sales, demand is elastic (elasticity of −2). If sales fall only 5%, demand is inelastic (−0.5).",
      },
      {
        q: "What makes a product price elastic?",
        a: "Lots of identical alternatives, easy price comparison, and non-essential purchases. Branded goods sold by many sellers on marketplaces are usually highly elastic.",
      },
      {
        q: "How can I use price elasticity to set prices?",
        a: "Raise prices on inelastic products, where you lose few sales, and compete carefully on elastic ones, where small price differences decide who wins the sale. Always stay above your floor price.",
      },
    ],
    related: ["dynamic-pricing", "psychological-pricing", "how-to-price-products", "repricing-strategies"],
    md: `Price elasticity of demand measures how much your sales change when your price changes. The formula is the % change in quantity sold divided by the % change in price. If a 10% price rise cuts sales by 20%, elasticity is −2 (elastic). If it cuts sales by 5%, it is −0.5 (inelastic), and the price rise earns you more.

## The formula

**Price elasticity = % change in quantity ÷ % change in price**

| Result (ignoring the minus sign) | Meaning |
|---|---|
| Greater than 1 | Elastic: buyers react strongly to price |
| Equal to 1 | Unit elastic: revenue stays the same |
| Less than 1 | Inelastic: buyers barely react |

## Worked example

You sell a phone stand at £10 and sell 100 a month. You raise the price to £11 (+10%).

- If sales drop to 95 (−5%), elasticity is −0.5. Revenue rises from £1,000 to £1,045, and profit rises more.
- If sales drop to 70 (−30%), elasticity is −3. Revenue falls to £770.

## Elastic vs inelastic products online

| Usually elastic | Usually inelastic |
|---|---|
| Identical branded goods sold by many sellers | Unique or own-brand products |
| Easy price comparison (shared product pages) | Urgent needs (replacement parts) |
| Non-essential items | Low-price items where the price barely matters |
| Products with substitutes | Products with loyal buyers |

On marketplaces with a buy box, like Amazon and OnBuy, identical products are very elastic: the buy-box winner takes most of the sales.

## How to measure elasticity yourself

1. Pick a product with steady sales.
2. Change the price by 5–10% for a set period (a week or two).
3. Compare units sold and profit with the previous period.
4. Repeat in the other direction.

Keep other things equal: same stock, no promotions, similar season.

## Using elasticity to price

- **Inelastic products:** test small price rises. You may earn more from fewer sales.
- **Elastic products:** stay competitive, but use a firm [floor price](/blog/floor-price) so competing never means selling at a loss.
- **Mixed catalogues:** use [dynamic pricing](/blog/dynamic-pricing) to treat each product differently.

## Elasticity and repricing

A good repricer behaves like an elasticity-aware seller: it competes hard where the buy box decides the sale, and raises prices when competitors run out of stock. SellSail does this on OnBuy within the floor and ceiling you set. See [repricing strategies](/blog/repricing-strategies) for the rules that work.`,
  },
  {
    slug: "cheapest-courier-uk",
    title: "Cheapest courier UK for online sellers: Evri, Royal Mail, DPD",
    description:
      "Cheapest courier in the UK for small online sellers: how Evri, Royal Mail, DPD, Yodel and parcel brokers compare on price, tracking, speed and reliability.",
    keyword: "cheapest courier uk",
    secondary: ["evri parcel prices", "cheapest way to send a parcel uk", "parcel broker uk", "royal mail vs evri"],
    category: "Guides",
    date: "2026-11-27",
    readingMinutes: 6,
    takeaways: [
      "The cheapest courier depends on size, weight, speed and how many parcels you send.",
      "Evri is often cheapest for small, light parcels; Royal Mail is strong for letters and small parcels with wide drop-off options.",
      "DPD and similar premium carriers cost more but offer precise delivery windows, which can reduce complaints.",
      "Parcel brokers and business accounts unlock lower rates once you send regularly.",
    ],
    faq: [
      {
        q: "Who is the cheapest courier in the UK?",
        a: "For small, light parcels, Evri and Royal Mail online prices are often the cheapest. For heavier parcels, comparing through a parcel broker usually finds a better rate. Prices change often, so compare for your typical parcel size.",
      },
      {
        q: "Is Evri cheaper than Royal Mail?",
        a: "Often for small parcels, but not always. Royal Mail can be cheaper for large letters and light items, and has more drop-off points. Compare both for your parcel size and weight.",
      },
      {
        q: "Should online sellers use a parcel broker?",
        a: "Brokers compare multiple couriers and often have discounted rates, which helps small sellers without business accounts. Check how claims and customer service work before relying on one.",
      },
    ],
    related: ["royal-mail-click-and-drop", "packaging-for-ecommerce", "hidden-costs-of-selling-online", "dropshipping-customer-service"],
    md: `The cheapest courier in the UK for online sellers depends on your parcel's size, weight and speed. For small, light parcels, Evri and Royal Mail online rates are usually the lowest. Heavier parcels are often cheaper through a parcel broker or a business account. Premium carriers like DPD cost more but give precise delivery windows.

Courier prices change often, so compare current rates for your most common parcel size.

## How UK couriers compare

| Courier | Strengths | Watch out for |
|---|---|---|
| Royal Mail | Wide drop-off network, letters and large letters, Click & Drop tool | Size limits on cheapest services |
| Evri | Often cheap for small parcels, ParcelShop drop-off | Delivery quality varies by area |
| DPD | One-hour delivery window, strong tracking | Higher price |
| Yodel | Competitive rates for some sizes | Fewer drop-off options |
| InPost lockers | Cheap, 24/7 locker drop-off | Locker sizes limit parcel dimensions |
| Parcel brokers | Compare many couriers, discounted rates | Claims go through the broker |

## What actually decides the price

1. **Size band:** many services price by size first. A box 1 cm too big jumps a band.
2. **Weight:** check the weight limit for each band.
3. **Speed:** next day costs more than 2–3 days.
4. **Tracking and insurance:** cheaper untracked services are risky for marketplace orders.
5. **Collection vs drop-off:** collections cost more for small volumes.

## How to cut postage costs

- Use the smallest packaging that protects the item (see [packaging for ecommerce](/blog/packaging-for-ecommerce)).
- Buy postage online, never at the counter.
- Use [Royal Mail Click & Drop](/blog/royal-mail-click-and-drop) or a broker to print labels in bulk.
- Once you send regularly, ask for business account rates.
- Use one carrier for most parcels and a second for heavy or valuable ones.

## Cheapest is not always best

Marketplaces measure on-time delivery and valid tracking. A late or lost parcel can cost you a refund, a bad review and account health. For most orders, a tracked 48-hour service gives the best balance.

## Include delivery in every price

Delivery is one of the biggest [hidden costs of selling online](/blog/hidden-costs-of-selling-online). Add it to your product cost before setting a price. On OnBuy, the [OnBuy fee calculator](/onbuy-fee-calculator) includes delivery in its profit figure.`,
  },
  {
    slug: "amazon-buy-box",
    title: "Amazon buy box: how to win it as a UK seller",
    description:
      "How the Amazon buy box works for UK sellers: what decides the winner, eligibility, price vs performance, FBA, and repricing tactics that protect your margin.",
    keyword: "amazon buy box",
    secondary: ["how to win the buy box on amazon", "amazon featured offer", "buy box eligibility", "amazon buy box repricer"],
    category: "Repricing",
    date: "2026-11-28",
    readingMinutes: 6,
    takeaways: [
      "The buy box (now often called the Featured Offer) is the Add to Basket button on a product page. Most Amazon sales go through it.",
      "Amazon picks the winner on price including delivery, delivery speed, seller performance and stock.",
      "FBA sellers have an advantage on delivery speed, but merchant-fulfilled sellers can still win with fast, reliable dispatch.",
      "Win it with good performance and smart repricing, not by racing to the lowest price.",
    ],
    faq: [
      {
        q: "What is the Amazon buy box?",
        a: "It is the box on a product page with the Add to Basket and Buy Now buttons. When several sellers offer the same product, Amazon chooses one offer to feature there, and that seller gets most of the sales.",
      },
      {
        q: "How does Amazon choose the buy box winner?",
        a: "Amazon does not publish the formula, but it weighs total price including delivery, delivery speed, seller performance metrics such as late dispatch and cancellations, and stock availability.",
      },
      {
        q: "Do I need the lowest price to win the buy box?",
        a: "No. A seller with faster delivery and better performance can win at a slightly higher price. Very low prices can even lose the buy box if Amazon thinks the price is not competitive with other retailers.",
      },
    ],
    related: ["amazon-repricer-uk", "onbuy-buy-box", "repricing-strategies", "sell-on-amazon-uk"],
    md: `The Amazon buy box, now often called the Featured Offer, is the Add to Basket button on a product page. When several sellers offer the same product, Amazon features one offer there, and that seller gets most of the sales. To win it, you need a competitive total price, fast and reliable delivery, strong seller metrics and stock.

## What decides the buy box?

Amazon does not publish its formula, but these factors matter:

| Factor | What helps |
|---|---|
| Total price | Item price plus delivery, competitive with other offers |
| Delivery speed | FBA or fast, reliable merchant dispatch |
| Seller performance | Low late dispatch, cancellations and defect rates |
| Stock | In stock, with enough to meet demand |
| Account | Professional plan, account in good standing |

## Eligibility

You need a Professional selling plan (see [how to sell on Amazon UK](/blog/sell-on-amazon-uk)) and healthy performance metrics. New accounts may need a track record before their offers are featured.

## FBA vs merchant fulfilled

FBA offers get Prime and are treated as fast and reliable. Merchant-fulfilled sellers can still win with quick dispatch, valid tracking and a strong record, especially on bulky or slow-moving items.

## Price tactics that work

- **Match, do not undercut blindly.** If you already offer the best delivery, matching the lowest price is often enough.
- **Raise when you can.** When competitors run out of stock, a repricer can move your price up.
- **Protect your floor.** Never follow a [price war](/blog/price-war) below your break-even price.

Read [repricing strategies](/blog/repricing-strategies) and [Amazon repricer UK](/blog/amazon-repricer-uk) for automation options.

## Why the lowest price can still lose

If your price is far below other retailers, or your delivery is slow, Amazon may feature someone else, or no one. Price is only part of the decision.

## The buy box on OnBuy

OnBuy also uses a buy box on shared product pages, and price plays a bigger part there. SellSail competes for the OnBuy buy box automatically, without ever going below the floor price it works out from your cost and OnBuy's fees. See [the OnBuy buy box](/blog/onbuy-buy-box) for details.`,
  },
  {
    slug: "cost-of-goods-sold",
    title: "Cost of goods sold (COGS): a guide for online sellers",
    description:
      "Cost of goods sold explained for online sellers: the COGS formula, what to include and exclude, worked examples, and how COGS affects margin and tax.",
    keyword: "cost of goods sold",
    secondary: ["cogs formula", "how to calculate cost of goods sold", "what is included in cogs", "cogs ecommerce"],
    category: "Fees and profit",
    date: "2026-11-29",
    readingMinutes: 6,
    takeaways: [
      "Cost of goods sold (COGS) is the direct cost of the products you actually sold in a period.",
      "Formula: opening stock + purchases − closing stock.",
      "For online sellers it usually includes the product price and inbound delivery; marketplace fees and outbound postage are usually tracked separately.",
      "Accurate COGS gives you a true gross margin and the right taxable profit.",
    ],
    faq: [
      {
        q: "What is cost of goods sold?",
        a: "It is the direct cost of the goods you sold in a period: what you paid for the products and the cost of getting them to you. It does not include general running costs like software or advertising.",
      },
      {
        q: "How do you calculate COGS?",
        a: "Add your opening stock value to the stock you bought during the period, then subtract your closing stock value. Dropshippers who hold no stock can simply total the supplier cost of each order sold.",
      },
      {
        q: "Are marketplace fees part of COGS?",
        a: "Usually they are recorded as selling expenses rather than COGS, but practices vary. What matters most is being consistent and including them somewhere when you calculate net profit.",
      },
    ],
    related: ["gross-vs-net-profit-margin", "profit-margin-formula", "hidden-costs-of-selling-online", "trading-allowance-selling-online"],
    md: `Cost of goods sold (COGS) is the direct cost of the products you actually sold in a period. The formula is opening stock + purchases − closing stock. For online sellers, COGS usually includes the price you paid for products and the delivery to get them to you. Marketplace fees and outbound postage are normally tracked as selling costs.

## The COGS formula

**COGS = opening stock + purchases − closing stock**

| Line | Example |
|---|---|
| Opening stock (1 Oct) | £3,000 |
| Purchases in October | £5,000 |
| Closing stock (31 Oct) | −£2,500 |
| **COGS for October** | **£5,500** |

## COGS for dropshippers

If you hold no stock, COGS is simply the supplier cost of every order you sold in the period, plus any supplier delivery charges. Your supplier invoices or order history give you the figure.

## What goes into COGS?

| Usually included | Usually excluded |
|---|---|
| Product purchase price | Marketplace commission |
| Inbound delivery to you | Outbound postage to customers (often separate) |
| Import duty | Advertising |
| Packaging that is part of the product | Software and subscriptions |
| | Your own wages |

Some sellers include outbound postage in COGS. Either is fine as long as you are consistent.

## Why COGS matters

1. **Gross margin:** (revenue − COGS) ÷ revenue. See [gross vs net profit margin](/blog/gross-vs-net-profit-margin).
2. **Pricing:** your price must cover COGS plus every fee.
3. **Tax:** COGS is an allowable expense, so it reduces your taxable profit (see the [trading allowance guide](/blog/trading-allowance-selling-online)).

## Common mistakes

- Using purchases instead of COGS: buying a lot of stock in one month makes that month look like a loss.
- Forgetting inbound delivery and import duty.
- Not counting stock at period end.
- Ignoring damaged or unsellable stock, which should be written off.

## From COGS to real profit per product

COGS gives you gross profit. To see what you actually keep, subtract marketplace fees, delivery, returns and VAT. The [OnBuy fee calculator](/onbuy-fee-calculator) does this per product for OnBuy, and our guide to [hidden costs of selling online](/blog/hidden-costs-of-selling-online) lists what sellers often forget.`,
  },
];
