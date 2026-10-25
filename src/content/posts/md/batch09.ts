import type { Post } from "../types";

// Batch 9: repricing strategy and pricing fundamentals. 11–20 Jan.
export const batch09: Post[] = [
  {
    slug: "repricing-strategies",
    title: "7 repricing strategies for UK marketplace sellers",
    description:
      "Seven repricing strategies for UK marketplace sellers, from cost-plus and beat-by-pennies to hold-at-floor and recovery pricing, and when to use each.",
    keyword: "repricing strategies",
    secondary: ["repricing strategy", "marketplace pricing strategy", "how to reprice"],
    category: "Repricing",
    date: "2027-01-11",
    readingMinutes: 8,
    takeaways: [
      "Start every strategy from a cost-plus price that covers fees and profit.",
      "Undercut cheaper sellers by pennies, inside a floor and a maximum undercut.",
      "Let prices recover when competition disappears.",
      "Use a short-term, capped loss only deliberately, for new listings.",
    ],
    faq: [
      {
        q: "What is the best repricing strategy?",
        a: "For most marketplace sellers: cost-plus pricing as the ceiling, small undercuts against cheaper rivals, a floor that keeps a minimum profit, and recovery to full price when rivals leave.",
      },
      {
        q: "How much should I undercut competitors by?",
        a: "Usually a few pence. The cheapest offer wins either way, so a bigger cut just gives away margin.",
      },
      {
        q: "Should I ever price above competitors?",
        a: "Yes, when you can't profitably match them, or when faster dispatch and better ratings let you win at a slightly higher price.",
      },
    ],
    related: ["what-is-a-repricer", "floor-price", "price-war", "onbuy-buy-box"],
    md: `A repricing strategy is the set of rules that decides your price when costs or competitors change. The best strategies keep you competitive without ever selling at a loss. Here are seven used by UK marketplace sellers, and when each makes sense.

## 1. Cost-plus (the foundation)

Price = (cost + profit) ÷ (1 − percentage fees). This is your ceiling: the full price that gives your target margin. Every other strategy works below it.

## 2. Beat by pennies

When a rival is cheaper, price a few pence under them. The cheapest offer wins whether it's 5p or £2 cheaper, so keep the cut small.

## 3. Hold at floor

When a rival goes below your floor, stop. Hold your floor price and let them sell at their margin, or loss. See [What is a floor price?](/blog/floor-price)

## 4. Maximum undercut

Never go more than a set amount below a rival, such as £2. This stops a single mispriced listing dragging you down.

## 5. Recovery pricing

When you're winning, or the rival disappears, don't stay low forever. After a while, try your full price again. If the rival is still there, you'll drop back under them.

## 6. Win the sale (capped loss)

For new listings that need first sales and reviews, allow a small loss per sale, capped at an amount you choose. Use it deliberately and review it often.

## 7. Price matching for parity

Some sellers match rather than undercut, relying on dispatch speed and ratings to win. It protects margin but may win fewer sales.

## Which strategy should you use?

| Situation | Strategy |
|---|---|
| No competitors | Cost-plus |
| Rival above your floor | Beat by pennies |
| Rival below your floor | Hold at floor |
| Erratic rival prices | Maximum undercut |
| You're winning | Recovery after a few hours |
| New listing needing reviews | Win the sale, capped |

## How SellSail combines them

SellSail uses cost-plus margin bands from the live Amazon UK price as the ceiling, beats cheaper OnBuy sellers by an amount you set, holds at your floor ("protect profit") or allows a capped loss ("win the sale"), caps the undercut, and tries your full price again a few hours after winning. [See competition repricing](/features). Related: [Price war](/blog/price-war).`,
  },
  {
    slug: "automated-vs-manual-repricing",
    title: "Automated vs manual repricing: when should you switch?",
    description:
      "Automated vs manual repricing for UK online sellers: the real cost of updating prices by hand, the signs it's time to automate, and how to switch safely.",
    keyword: "automated repricing",
    secondary: ["manual repricing", "repricing tool", "should i use a repricer"],
    category: "Repricing",
    date: "2027-01-13",
    readingMinutes: 6,
    takeaways: [
      "Manual repricing works for a small, stable catalogue.",
      "Once costs or competitors change daily, manual prices are always out of date.",
      "The hidden cost of manual repricing is margin lost between your checks.",
      "Switch safely: floors first, small undercuts, and review the first week closely.",
    ],
    faq: [
      {
        q: "How many listings before I need a repricer?",
        a: "There's no fixed number, but most sellers find manual repricing impractical beyond a few dozen listings whose costs or competitors change often.",
      },
      {
        q: "Will automated repricing lower my prices?",
        a: "Not necessarily. A good repricer also raises prices when costs rise or competitors leave. With a floor, it never goes below your minimum profit.",
      },
      {
        q: "Can I automate only some listings?",
        a: "Usually yes. Many tools let you switch individual listings in or out of automatic competition.",
      },
    ],
    related: ["what-is-a-repricer", "repricing-strategies", "ecommerce-automation-uk", "floor-price"],
    md: `Manual repricing means checking costs and competitors yourself and updating prices by hand. Automated repricing means software does it continuously. Manual works when you have a few stable products; once prices move daily, automation stops you losing margin between checks.

## Automated vs manual at a glance

| | Manual | Automated |
|---|---|---|
| Cost | Your time | Software subscription |
| Speed | Hours or days | Minutes |
| Accuracy | Drifts between checks | Follows changes continuously |
| Scale | Tens of listings | Thousands |
| Risk | Selling at a loss after cost rises | Bad rules without a floor |

## What does manual repricing really cost?

The obvious cost is time. The hidden cost is the gap between checks. If a supplier raises a price on Monday and you notice on Friday, every sale in between earns less, or loses money.

## Signs it's time to automate

- Supplier prices change daily, as with dropshipping from Amazon.
- You have more listings than you can check in a sitting.
- You keep finding listings priced below cost.
- Competitors change prices several times a day.
- You've had orders for items your supplier had run out of.

## How do you switch safely?

1. **Set floors first**, from cost plus fees plus a minimum profit.
2. **Use small undercuts** and a maximum undercut.
3. **Start with part of your catalogue**, then expand.
4. **Watch the first week**: price history, margins, sales.
5. **Keep a pause switch** you can use at any time.

SellSail starts with your margins reviewed during set-up, keeps competition off until you switch it on, lets you turn competition off for any single listing, logs every price change, and has one switch to pause all updates. [Try it free for 14 days](/signup).`,
  },
  {
    slug: "minimum-advertised-price-uk",
    title: "Minimum advertised price (MAP) in the UK: what sellers should know",
    description:
      "Minimum advertised price explained for UK sellers: MAP vs RRP, why resale price maintenance is unlawful in the UK, and how to set your own floors legally.",
    keyword: "minimum advertised price",
    secondary: ["map pricing uk", "resale price maintenance uk", "rrp vs map"],
    category: "Pricing",
    date: "2027-01-15",
    readingMinutes: 6,
    takeaways: [
      "A minimum advertised price (MAP) is a supplier's request not to advertise below a set price.",
      "In the UK, a supplier fixing or enforcing your minimum resale price is generally unlawful resale price maintenance.",
      "A recommended retail price (RRP) is allowed as long as it's only a recommendation.",
      "Your own price floor, based on your costs, is entirely up to you.",
    ],
    faq: [
      {
        q: "Is MAP pricing legal in the UK?",
        a: "Suppliers can recommend prices, but fixing or enforcing a minimum resale price, including through threats or penalties, is generally treated as resale price maintenance, which UK competition law prohibits.",
      },
      {
        q: "What's the difference between RRP and MAP?",
        a: "An RRP is a recommended selling price you're free to ignore. A MAP tries to stop resellers advertising below a minimum, which can cross into unlawful resale price maintenance in the UK.",
      },
      {
        q: "Can I set my own minimum price?",
        a: "Yes. Setting your own floor based on your costs and target profit is your decision and entirely legal.",
      },
    ],
    related: ["floor-price", "price-war", "how-to-price-products", "dynamic-pricing"],
    md: `A minimum advertised price (MAP) is a price below which a supplier asks retailers not to advertise a product. MAP policies are common in some countries, but in the UK they need care: a supplier fixing or enforcing your minimum resale price is generally unlawful. This article explains the difference between MAP, RRP and your own price floor. It's general information, not legal advice.

## MAP vs RRP vs your own floor

| | Who sets it | Binding? |
|---|---|---|
| RRP (recommended retail price) | Supplier | No, it's a recommendation |
| MAP (minimum advertised price) | Supplier | Enforcing it can be unlawful in the UK |
| Your floor price | You | Your own business decision |

## What does UK law say?

Under the Competition Act 1998, **resale price maintenance (RPM)** is when a supplier fixes or sets a minimum price at which a retailer must resell. The Competition and Markets Authority (CMA) treats RPM as a serious breach and has fined companies for it. Recommending a price is generally fine; pressuring retailers to follow it, through threats, penalties or withholding supply, is not.

## What should sellers do if a supplier insists on a minimum price?

- You can choose to follow an RRP if it suits your business.
- Be cautious about written agreements that fix your resale price.
- If you're pressured, consider taking legal advice; the CMA publishes guidance for retailers.

## Your own floor is different

Setting your own minimum price, based on your costs and the profit you want, is simply good business. It's what protects you in a [price war](/blog/price-war). See [What is a floor price?](/blog/floor-price)

## And competitors?

Agreeing prices with competitors is price fixing, which is illegal. Watching their public prices and setting yours independently is fine. See [Competitor price monitoring](/blog/competitor-price-monitoring).`,
  },
  {
    slug: "how-to-price-products",
    title: "How to price products for an online shop: a step-by-step method",
    description:
      "How to price products for an online shop or marketplace: cost-based pricing with fees and VAT, checking the market, setting a floor and ceiling, and reviewing.",
    keyword: "how to price products",
    secondary: ["pricing strategy ecommerce", "product pricing", "ecommerce pricing"],
    category: "Pricing",
    date: "2027-01-18",
    readingMinutes: 8,
    takeaways: [
      "Start from cost: product, delivery, fees, VAT and a target profit.",
      "Check the market only after you know the price that works for you.",
      "Set a floor (minimum profit) and a ceiling (full price) for every product.",
      "Review prices whenever costs or competitors change; ideally automate it.",
    ],
    faq: [
      {
        q: "What's the simplest way to price a product?",
        a: "Cost plus your target profit, divided by what's left after percentage fees. Then compare with competitors and adjust within your floor and ceiling.",
      },
      {
        q: "Should I price lower than competitors?",
        a: "Only if you still make your minimum profit. Undercut by a little where you can; hold where you can't.",
      },
      {
        q: "How often should I review prices?",
        a: "Whenever costs or competitor prices change. For dropshippers that can be several times a day, which is why many automate it.",
      },
    ],
    related: ["profit-margin-formula", "margin-vs-markup", "break-even-price", "psychological-pricing"],
    md: `To price a product for an online shop or marketplace, start from your full cost, add the profit you need, cover the fees, and only then compare with the market. This method keeps every sale profitable and gives you clear limits for competing.

## Step 1: add up your full cost

| Cost | Example |
|---|---|
| Product (supplier price) | £12.50 |
| Supplier delivery | £1.40 |
| Packaging (if you ship) | £0.00 |
| **Total cost** | **£13.90** |

## Step 2: choose your profit

Use a percentage **and** a minimum in pounds, whichever is higher. For example 25% of cost, at least £3. On £13.90 that's £3.48.

## Step 3: cover the fees

Percentage fees come out of the selling price, so divide:

**Price = (cost + profit) ÷ (1 − commission % − payment fee %)**

(13.90 + 3.48) ÷ 0.85 = **£20.45**

If you're VAT-registered, include VAT: divide by (1 − 0.15 − 1/6) instead. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## Step 4: check the market

Now look at competitors on the same marketplace:

- **They're above you:** you're competitive. Consider raising slightly towards them.
- **They're slightly below:** undercut by a few pence if you stay above your floor.
- **They're far below:** check your costs; if they're right, hold your price.

## Step 5: set a floor and a ceiling

- **Ceiling:** your full price from step 3.
- **Floor:** cost plus a minimum profit, over the fees. See [Floor price](/blog/floor-price).

## Step 6: apply finishing touches

Charm endings like .99 can help, but only within your limits. See [Psychological pricing](/blog/psychological-pricing).

## Step 7: review continuously

Costs and competitors change. A price that was right last month may now lose money. Review whenever anything changes, or automate it.

[SellSail](/features) runs steps 1 to 5 automatically for OnBuy sellers who source from Amazon UK, using margin bands you set and the live Amazon price. Try it in the [OnBuy fee calculator](/onbuy-fee-calculator) first.`,
  },
  {
    slug: "hidden-costs-of-selling-online",
    title: "9 hidden costs of selling online in the UK",
    description:
      "The hidden costs of selling online in the UK: commission on VAT and delivery, payment fees, returns, packaging, tools, chargebacks and your time.",
    keyword: "hidden costs of selling online",
    secondary: ["costs of selling online uk", "ecommerce costs", "online selling fees uk"],
    category: "Fees and profit",
    date: "2027-01-20",
    readingMinutes: 7,
    takeaways: [
      "Commission is often charged on VAT and delivery as well as the item price.",
      "Returns, packaging and failed deliveries cost more than most sellers budget.",
      "Monthly tools and plans need spreading across every order.",
      "Price with every cost included, and review margins after real sales.",
    ],
    faq: [
      {
        q: "What are the main costs of selling online in the UK?",
        a: "Product cost, delivery, marketplace commission, payment fees, VAT if registered, returns, packaging, tools and plan fees, and your time.",
      },
      {
        q: "How do I include monthly costs in my prices?",
        a: "Divide monthly costs by your expected number of orders and add that amount to the cost of each order when calculating prices.",
      },
      {
        q: "How do I find out my real profit?",
        a: "Track every cost per order for a month, including refunds and fees, and compare with revenue. That's your real net margin.",
      },
    ],
    related: ["profit-margin-formula", "onbuy-fees-explained", "vat-for-online-sellers-uk", "dropshipping-profit-margins"],
    md: `Most online sellers know their product cost and the headline commission. The costs that quietly take their profit are the others. Here are nine hidden costs of selling online in the UK, and how to account for each.

## 1. Commission on VAT and delivery
Many marketplaces charge commission on the full amount the buyer pays, including VAT and delivery, not just the item price. A 15% fee on a £24.99 item with £2.99 delivery is £4.20, not £3.75. See [OnBuy fees explained](/blog/onbuy-fees-explained).

## 2. VAT once you're registered
A sixth of every VAT-inclusive sale goes to HMRC. See [VAT for UK online sellers](/blog/vat-for-online-sellers-uk).

## 3. Payment processing
Card or payment fees, often a percentage plus a fixed amount per order, especially on your own website.

## 4. Returns and refunds
Refunded items, return postage for faulty goods, and stock that can't be resold. Budget a percentage of sales.

## 5. Packaging
Boxes, mailers, tape and labels add up per order if you ship yourself.

## 6. Failed and late deliveries
Lost parcels, reships and partial refunds for late items.

## 7. Tools and plans
Marketplace plans, repricers, listing tools and accounting software. Spread them across orders.

## 8. Chargebacks and disputes
Fees and lost revenue when buyers dispute payments.

## 9. Your time
Listing, pricing, customer service and admin. If you value it at zero, you'll never know if the business really pays.

## How do you include hidden costs in your prices?

| Cost | How to include it |
|---|---|
| Percentage fees | Divide the price by (1 − fees) |
| Per-order costs | Add to product cost |
| Monthly costs | Divide by monthly orders and add per order |
| Returns | Add a percentage allowance |

Then set a minimum profit in pounds so every sale earns something after the unexpected.

> Review real margins after a month of sales, not the margins you planned. The difference is your hidden costs.

Check your numbers with the [OnBuy fee calculator](/onbuy-fee-calculator). Related: [Profit margin formula](/blog/profit-margin-formula).`,
  },
];
