import type { Post } from "../types";

// Batch 3: pricing and selling concepts with UK volume (dynamic pricing, price war,
// repricer, retail arbitrage, selling online). Published Mon/Wed/Fri from 28 Oct.
export const batch03: Post[] = [
  {
    slug: "dynamic-pricing",
    title: "Dynamic pricing explained: how it works for online sellers",
    description:
      "Dynamic pricing explained for UK online sellers: what it is, how it works on marketplaces, the strategies behind it, the risks, and how to use it without eroding profit.",
    keyword: "dynamic pricing",
    secondary: ["dynamic pricing ecommerce", "what is dynamic pricing", "dynamic pricing strategy"],
    category: "Pricing",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "Dynamic pricing means changing prices automatically in response to costs, competitors or demand.",
      "For marketplace sellers, the two inputs that matter most are supplier cost and competitor prices.",
      "Good dynamic pricing has a floor (never below a minimum profit) and a ceiling (never above a sensible maximum).",
      "Without guard rails, dynamic pricing turns into a race to the bottom.",
    ],
    faq: [
      {
        q: "What is an example of dynamic pricing?",
        a: "Airline seats and hotel rooms that rise as dates fill up, ride-hailing surge pricing, and marketplace sellers whose prices move automatically when a supplier's cost or a competitor's price changes.",
      },
      {
        q: "Is dynamic pricing legal in the UK?",
        a: "Yes, changing your own prices is legal. Prices must not be misleading under consumer law, and sellers must not agree prices with competitors, which competition law forbids.",
      },
      {
        q: "Do small sellers need dynamic pricing?",
        a: "If your costs or competitors change often, as they do for dropshippers and marketplace sellers, automated pricing protects margin and saves hours of manual updates.",
      },
    ],
    related: ["what-is-a-repricer", "price-war", "floor-price", "repricing-strategies"],
    md: `Dynamic pricing means your prices change automatically when something that matters changes: your cost, a competitor's price, or demand. Instead of setting a price once and forgetting it, rules decide the price continuously. For UK marketplace sellers, it's the difference between keeping your margin and finding out a week later that you've been selling at a loss.

## How does dynamic pricing work?

Every dynamic pricing system has three parts:

1. **Inputs:** the data it watches, such as supplier cost, competitor prices, stock levels or time.
2. **Rules:** how inputs turn into a price, such as "cost plus 25%, at least £3 profit, 5p under the cheapest rival".
3. **Guard rails:** limits it never crosses, such as a floor and a ceiling.

## What are the main types of dynamic pricing?

| Type | Driven by | Common in |
|---|---|---|
| Cost-based | Your supplier's price | Dropshipping, reselling |
| Competitor-based | Other sellers' prices | Marketplaces |
| Demand-based | How fast items sell | Travel, events |
| Time-based | Season, day or hour | Hospitality, retail sales |
| Stock-based | How much is left | Clearance, limited stock |

Most marketplace sellers combine cost-based and competitor-based pricing: the price follows cost, then adjusts for competition within safe limits.

## Why do marketplace sellers use dynamic pricing?

- **Costs move.** Supplier prices change, sometimes several times a day if you source from Amazon.
- **Competitors move.** Other sellers change prices to win sales.
- **Margins are thin.** After commission and VAT, a few pence decide whether you profit.
- **Scale.** Updating hundreds of prices by hand isn't realistic.

## What are the risks of dynamic pricing?

- **Race to the bottom.** Two automated sellers undercutting each other can fall below cost. See [Price war](/blog/price-war).
- **Bad data.** A supplier glitch showing a £50 item at £5 can push your price down for no reason.
- **Customer trust.** Wild price swings look odd to buyers.
- **Margin creep.** Small cuts add up over thousands of sales.

> Every dynamic pricing rule needs a floor: the lowest price that still pays every fee and your minimum profit. Without one, automation just loses money faster.

## How do you set up dynamic pricing safely?

1. **Start from cost.** Calculate the price that covers cost, fees, VAT and profit.
2. **Set a floor** from a minimum profit in pounds. Read [What is a floor price?](/blog/floor-price)
3. **Set a ceiling,** usually your full cost-plus-margin price.
4. **Compete inside the range:** undercut cheaper rivals by a few pence, never below the floor.
5. **Check suspicious inputs:** treat sudden huge cost drops as errors until confirmed.
6. **Review regularly:** which listings sit at the floor, and are they worth keeping?

## Dynamic pricing for OnBuy sellers

SellSail is dynamic pricing built for OnBuy sellers who source from Amazon UK:

- **Cost input:** the live Amazon UK price for each listing.
- **Rules:** margin bands with a profit percentage and minimum profit, with OnBuy commission and payment fees added.
- **Competition:** it checks who's winning each OnBuy listing and prices just under cheaper sellers.
- **Guard rails:** never below your floor, never above your band price, sudden drops confirmed before use.

[See how it works](/features) or read [What is a repricer?](/blog/what-is-a-repricer)`,
  },
  {
    slug: "price-war",
    title: "Price war: how to avoid a race to the bottom on marketplaces",
    description:
      "What is a price war, why marketplace sellers fall into them, and practical ways to compete on price without destroying your margin. With UK seller examples.",
    keyword: "price war",
    secondary: ["race to the bottom", "marketplace price war", "how to avoid a price war"],
    category: "Pricing",
    date: "2026-10-25",
    readingMinutes: 7,
    takeaways: [
      "A price war is when competing sellers keep cutting prices to win sales until nobody makes money.",
      "Automated repricers make price wars faster: two of them can reach cost in minutes.",
      "The defence is a floor built from your real costs, plus small undercuts rather than big ones.",
      "Compete on dispatch speed, stock reliability and listing quality, not just price.",
    ],
    faq: [
      {
        q: "Who wins a price war?",
        a: "Usually nobody. The seller with the lowest costs survives longest, but margins fall for everyone. The smartest move is often to hold at your floor and let a loss-making rival sell out.",
      },
      {
        q: "How do I stop my repricer starting a price war?",
        a: "Set a floor price for every listing, undercut by pennies rather than pounds, cap how far below a rival you'll go, and let prices rise again when a rival raises theirs or disappears.",
      },
      {
        q: "Is it illegal to agree prices with competitors?",
        a: "Yes. Agreeing prices with competitors is price fixing, which is illegal under UK competition law. You must set your prices independently.",
      },
    ],
    related: ["floor-price", "repricing-strategies", "dynamic-pricing", "onbuy-buy-box"],
    md: `A price war is what happens when competing sellers keep undercutting each other to win sales until the price falls below what anyone can profit from. On marketplaces it's common, and with automated repricers it can happen in minutes rather than weeks. The good news: you don't have to take part.

## How does a price war start?

1. Seller A lowers a price to win more sales.
2. Seller B notices and goes lower.
3. Seller A's repricer reacts and goes lower still.
4. Repeat until one hits cost, or below.

On a marketplace, every step takes seconds when both sides use automated tools with no floor.

## Why are price wars so damaging?

- **Margins vanish** for everyone, often permanently, because buyers learn the low price.
- **Sellers sell at a loss** without noticing, especially when they forget fees and VAT.
- **Quality and service suffer** when there's no money left for them.

A simple example, with a £13.90 cost and 15% commission:

| Price | Commission | Profit per sale |
|---|---|---|
| £20.45 | £3.07 | £3.48 |
| £18.99 | £2.85 | £2.24 |
| £17.49 | £2.62 | £0.97 |
| £16.35 | £2.45 | £0.00 (break-even) |
| £15.99 | £2.40 | −£0.31 |

The last sale costs you money every time it happens.

## How do you avoid a price war?

### Set a floor for every listing
Your floor is the lowest price that still pays every fee and your minimum profit. When a rival goes below it, stop. See [What is a floor price?](/blog/floor-price)

### Undercut by pennies, not pounds
Being 5p cheaper is usually enough to be the cheapest offer. Cutting by £1 just gives away margin.

### Cap your undercut
Never go more than a set amount below a rival, so one mispriced competitor can't drag you down.

### Let prices rise again
When a rival raises their price or sells out, your price should return to normal. Repricers that only move down leave money on the table.

### Compete on more than price
Buyers also weigh delivery speed, seller rating and stock reliability. Fast dispatch can win a sale at a slightly higher price.

> Holding at your floor while a rival sells at a loss isn't losing. They'll run out of stock or money; you'll still be there with your margin intact.

## What should you never do?

Don't agree prices with competitors. Price fixing is illegal under UK competition law. Set your prices independently, based on your own costs and the prices you can see.

## How SellSail handles price wars

SellSail's competition feature asks OnBuy who's winning each listing. When another seller is cheaper, it prices 5p under them (you choose the amount), but never below your floor and never more than your maximum undercut. When you're winning, it holds the price for a few hours, then tries your full price again in case the rival has gone. [See competition repricing](/features).`,
  },
  {
    slug: "what-is-a-repricer",
    title: "What is a repricer? Automated repricing explained",
    description:
      "What is a repricer and how does repricing software work? The types of repricer, what features matter, the risks, and how to choose one for Amazon, eBay or OnBuy.",
    keyword: "repricer",
    secondary: ["what is a repricer", "repricing software", "repricing tool", "automated repricing"],
    category: "Repricing",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "A repricer is software that changes your marketplace prices automatically, based on rules you set.",
      "Rule-based repricers follow fixed instructions; algorithmic ones weigh several signals.",
      "The most important feature is a reliable floor, ideally calculated from your live costs.",
      "For dropshippers, the repricer must also follow supplier price and stock, not just competitors.",
    ],
    faq: [
      {
        q: "How does a repricer work?",
        a: "It reads data such as competitor prices and your costs, applies your rules to decide a price, then sends the new price to the marketplace through its API, repeating every few minutes.",
      },
      {
        q: "Is a repricer worth it?",
        a: "If you have more than a few dozen listings, or your costs and competitors change often, a repricer usually pays for itself through protected margins and time saved.",
      },
      {
        q: "Can a repricer lose me money?",
        a: "Yes, if its floor is wrong or missing. A repricer with a fixed minimum price that's out of date can follow a rival below your real cost. Choose one that builds floors from live costs.",
      },
    ],
    related: ["onbuy-repricer-guide", "repricing-strategies", "floor-price", "automated-vs-manual-repricing"],
    md: `A repricer is software that changes your prices on a marketplace automatically. You set the rules, such as "stay 5p under the cheapest seller, never below my minimum profit", and the repricer applies them every few minutes, sending new prices through the marketplace's API. It's how sellers stay competitive across hundreds or thousands of listings without updating prices by hand.

## How does a repricer work?

Every repricer runs the same loop:

1. **Read** the inputs: competitor prices, your cost, sometimes stock and sales speed.
2. **Decide** a price using your rules.
3. **Send** the price to the marketplace and confirm it was accepted.
4. **Repeat**, usually every few minutes.

## What types of repricer are there?

| Type | How it decides | Good for |
|---|---|---|
| Rule-based | Fixed rules, such as "5p under the lowest price" | Simple, predictable control |
| Algorithmic | Weighs several signals, such as sales speed and competitor ratings | Large catalogues on busy marketplaces |
| Cost-based | Follows your supplier's price | Dropshippers and resellers |
| Hybrid | Cost-based price, then adjusts for competitors within limits | Dropshippers on competitive marketplaces |

## What features matter most in a repricer?

- **A floor from real costs.** The price should never fall below cost plus fees plus minimum profit.
- **A ceiling.** It shouldn't push prices up to silly levels when there's no competition.
- **Fee awareness.** Commission is usually charged on the full price, so the maths must account for it.
- **Speed.** Updates every few minutes, not once a day.
- **Safety checks.** Suspicious data, such as a 90% cost drop, should be confirmed before use.
- **History.** A log of what changed, when and why.
- **Stock sync** for dropshippers: out of stock when the supplier is.

## What are the risks of using a repricer?

- **Out-of-date floors.** If the minimum price was typed in months ago, it may now be below cost.
- **Price wars** with other repricers. See [Price war](/blog/price-war).
- **Bad inputs.** A competitor's mistake or a supplier glitch can trigger the wrong price.

## Do you need a repricer?

| Situation | Repricer? |
|---|---|
| Fewer than 20 listings, stable costs | Probably not yet |
| Hundreds of listings | Yes |
| Dropshipping from a supplier whose prices change | Yes, cost-based |
| Busy marketplace with many sellers per product | Yes |

See [Automated vs manual repricing](/blog/automated-vs-manual-repricing) for when to switch.

## What about OnBuy repricers?

OnBuy has fewer repricing tools than Amazon or eBay. SellSail is built for OnBuy sellers who source from Amazon UK: it prices every listing from the live Amazon cost with fees and profit built in, competes against cheaper OnBuy sellers down to your floor, and syncs price and stock every few minutes. Read our [OnBuy repricer guide](/blog/onbuy-repricer-guide) or [start a free trial](/signup).`,
  },
  {
    slug: "retail-arbitrage-uk",
    title: "Retail arbitrage UK: how it works, profits and pitfalls",
    description:
      "Retail arbitrage in the UK explained: buying from shops to resell online, how much you can make, the costs, the rules on brands and marketplaces, and how to start.",
    keyword: "retail arbitrage uk",
    secondary: ["what is retail arbitrage", "retail arbitrage", "reselling uk"],
    category: "Growth",
    date: "2026-10-25",
    readingMinutes: 8,
    takeaways: [
      "Retail arbitrage means buying discounted products in shops and reselling them online for more.",
      "Profit comes from clearance and price differences, minus marketplace fees, delivery and your time.",
      "Some brands restrict resale on certain marketplaces, so check before you buy stock.",
      "Track every purchase and sale: the income is taxable once you're trading.",
    ],
    faq: [
      {
        q: "Is retail arbitrage legal in the UK?",
        a: "Yes. Reselling goods you've bought is legal. Marketplaces may restrict some brands or categories, and goods must be genuine and as described.",
      },
      {
        q: "How much can you make from retail arbitrage?",
        a: "Profit per item is often a few pounds after fees. Sellers who make it work buy in volume, sell fast-moving items and keep costs low.",
      },
      {
        q: "Do I pay tax on retail arbitrage?",
        a: "If you're buying to resell for profit, that's trading, and the profit is taxable. Register with HMRC and keep records of every purchase and sale.",
      },
    ],
    related: ["online-arbitrage-uk", "sell-online-uk", "dropshipping-uk-guide", "profit-margin-formula"],
    md: `Retail arbitrage is buying products from high-street or online shops at a low price, often on clearance, and reselling them on a marketplace for more. In the UK, sellers use it to start with little capital and learn what sells before moving to wholesale or dropshipping.

## How does retail arbitrage work?

1. **Find** a discounted product in a shop, such as a clearance item or a deal.
2. **Check** what it sells for online and how fast it sells.
3. **Work out** the profit after fees, delivery and VAT if you're registered.
4. **Buy** if the numbers work.
5. **List and sell** it online, then send it to the buyer, or send stock to a fulfilment service.

## Retail arbitrage vs online arbitrage vs dropshipping

| Model | Where you buy | Do you hold stock? | Upfront cost |
|---|---|---|---|
| Retail arbitrage | Physical shops | Yes | Medium |
| Online arbitrage | Online shops | Yes | Medium |
| Dropshipping | Supplier ships to customer | No | Low |

More: [Online arbitrage in the UK](/blog/online-arbitrage-uk) and [Dropshipping in the UK](/blog/dropshipping-uk-guide).

## How do you work out if a deal is profitable?

| Line | Example |
|---|---|
| Selling price | £24.99 |
| Marketplace commission (15%) | −£3.75 |
| Delivery to buyer | −£3.20 |
| Packaging | −£0.40 |
| Purchase price | −£11.00 |
| **Profit** | **£6.64** |

If you're VAT-registered, take VAT off the selling price too. Use our [fee calculator](/onbuy-fee-calculator) to check quickly.

## What are the pitfalls?

- **Brand restrictions.** Some marketplaces limit who can sell certain brands or categories. Check before buying stock.
- **Slow sellers.** Cheap stock that doesn't sell ties up your cash.
- **Your time.** Shopping trips, listing and packing take hours. Count them.
- **Condition.** Damaged boxes can mean returns.
- **Receipts.** Keep them: you may need to prove where goods came from.

## Is retail arbitrage a business?

Once you're buying to resell for profit, HMRC treats it as trading. Register, keep records and declare the profit. The [trading allowance](https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income) covers the first £1,000 of trading income a year.

## Where retail arbitrage leads

Many UK sellers start with arbitrage, learn which products and channels work, then move to dropshipping or wholesale to scale without driving round shops. If you move to dropshipping from Amazon onto OnBuy, [SellSail](/features) keeps every price and stock level in sync automatically.`,
  },
  {
    slug: "sell-online-uk",
    title: "How to start selling online in the UK: a practical guide",
    description:
      "How to start selling online in the UK: choosing what to sell, picking marketplaces or your own website, legal and tax basics, pricing, delivery and growing sales.",
    keyword: "sell online uk",
    secondary: ["how to sell online uk", "start selling online", "selling online uk"],
    category: "Growth",
    date: "2026-10-25",
    readingMinutes: 10,
    takeaways: [
      "Start on a marketplace to reach buyers immediately; add your own website later.",
      "Decide your model first: hold stock, dropship or make your own products.",
      "Register with HMRC once you're trading, and register for VAT if turnover passes £90,000.",
      "Price from real costs plus fees, and keep stock accurate from day one.",
    ],
    faq: [
      {
        q: "What is the easiest way to sell online in the UK?",
        a: "Listing on an established marketplace, such as OnBuy, eBay or Amazon, because buyers are already there. Your own website gives more control but you must bring the traffic.",
      },
      {
        q: "Do I need a licence to sell online in the UK?",
        a: "Most products don't need a licence, but some do, such as alcohol, and many have safety rules, such as electrical goods, toys and cosmetics. Check the rules for your category.",
      },
      {
        q: "When do I need to tell HMRC?",
        a: "When you're trading for profit and your income passes the £1,000 trading allowance, register for Self Assessment, or set up a limited company.",
      },
    ],
    related: ["uk-online-marketplaces", "how-to-sell-on-onbuy", "dropshipping-uk-guide", "multichannel-selling-uk"],
    md: `To start selling online in the UK, choose what you'll sell and how you'll source it, pick a place to sell (usually a marketplace first), set up the legal basics, and price every product so it covers its costs. This guide takes you through each step with the UK details that matter.

## 1. What should you sell?

Pick products you can source reliably and sell at a profit after fees. Good first products:

- sell steadily all year, not just at Christmas;
- are light and hard to break, so delivery is cheap;
- aren't dominated by one big brand selling direct;
- leave room for fees: if commission and delivery take half the price, move on.

## 2. How will you source products?

| Model | How it works | Best for |
|---|---|---|
| Hold stock | Buy wholesale, store and ship yourself | Control over quality and packing |
| Dropshipping | Supplier ships to your customer | Low start-up cost, wide range |
| Arbitrage | Buy discounted retail stock and resell | Learning what sells |
| Make your own | Handmade or own-brand products | Unique products, higher margins |

See [Dropshipping in the UK](/blog/dropshipping-uk-guide) and [Retail arbitrage UK](/blog/retail-arbitrage-uk).

## 3. Where should you sell?

**Marketplaces** give you instant access to buyers; **your own website** gives you control. Most sellers start on a marketplace.

| Channel | Strength | Consideration |
|---|---|---|
| OnBuy | UK marketplace, less crowded | Commission per sale |
| eBay | Big UK audience, good for used and niche items | Rules on sourcing |
| Amazon | Largest audience | Fierce competition, strict policies |
| Etsy | Handmade and vintage | Niche audience |
| Your own site | Full control, no commission | You must drive traffic |

More: [UK online marketplaces: where to sell](/blog/uk-online-marketplaces).

## 4. Legal and tax basics

- **Register with HMRC** once you're trading and your income passes the £1,000 trading allowance.
- **VAT:** register when your VAT-taxable turnover passes £90,000 in a rolling 12 months.
- **Consumer law:** online buyers usually have 14 days to cancel, and goods must match their description.
- **Product safety:** check the rules for your category.
- **Data protection:** if you hold customer data, follow UK GDPR.

## 5. Price for profit

Every price must cover your cost, delivery, marketplace commission, payment fees, VAT if registered, and your profit. Use [the profit margin formula](/blog/profit-margin-formula) and our [fee calculator](/onbuy-fee-calculator) before you list.

## 6. Delivery and service

Promise dispatch times you can always keep, add tracking, and reply to messages within a day. On marketplaces, late dispatch and cancellations hurt your seller rating.

## 7. Grow

- Add products that sell like your best ones.
- Add a second marketplace: [Multichannel selling in the UK](/blog/multichannel-selling-uk).
- Automate pricing and stock once you have more listings than you can watch.

If you sell on OnBuy and source from Amazon UK, [SellSail](/features) automates pricing and stock so you can grow without spending your evenings updating prices. Start with our [guide to selling on OnBuy](/blog/how-to-sell-on-onbuy).`,
  },
];
