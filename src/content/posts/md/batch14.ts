import type { Post } from "../types";

// Batch 14: second wave, mid-volume topics from Google Keyword Planner (UK,
// 17 Nov 2026). Publishing order and dates are set in ../index.ts.
export const batch14: Post[] = [
  {
    slug: "average-order-value",
    title: "Average order value (AOV): formula and 9 ways to raise it",
    description:
      "Average order value explained for online sellers: the AOV formula, worked examples, why it matters for profit, and practical ways to increase it in the UK.",
    keyword: "average order value",
    secondary: ["aov formula", "how to calculate average order value", "increase average order value", "aov ecommerce"],
    category: "Growth",
    date: "2026-11-30",
    readingMinutes: 6,
    takeaways: [
      "Average order value = total revenue ÷ number of orders.",
      "Raising AOV spreads fixed costs like postage and packing over more revenue, so profit per order rises.",
      "Bundles, multi-buy offers and free delivery thresholds are the simplest levers.",
      "Track AOV per channel: marketplaces and your own shop behave differently.",
    ],
    faq: [
      {
        q: "How do you calculate average order value?",
        a: "Divide total revenue by the number of orders in the same period. For example, £6,000 from 200 orders is an AOV of £30.",
      },
      {
        q: "Why does average order value matter?",
        a: "Many costs, like postage, packing and payment fees, are charged per order. A higher AOV means those costs take a smaller share of each sale, so profit per order rises.",
      },
      {
        q: "What is a good average order value?",
        a: "It depends on what you sell. Compare your AOV against your own past figures and against your cost per order, rather than against other industries.",
      },
    ],
    related: ["customer-lifetime-value", "ecommerce-kpis", "ecommerce-conversion-rate", "psychological-pricing"],
    md: `Average order value (AOV) is the average amount a customer spends per order: total revenue divided by the number of orders. If you take £6,000 from 200 orders, your AOV is £30. Raising AOV is one of the fastest ways to grow profit, because postage, packing and other per-order costs are spread over more revenue.

## The AOV formula

**AOV = total revenue ÷ number of orders**

Use the same period and the same revenue basis (with or without VAT) every time you compare.

## Why AOV matters for profit

| | Order A | Order B |
|---|---|---|
| Order value | £20 | £35 |
| Product cost (50%) | £10 | £17.50 |
| Postage and packing | £3.50 | £3.80 |
| Profit before fees | £6.50 | £13.70 |

Order B is 75% bigger but makes more than twice the profit, because postage barely changed.

## 9 ways to increase AOV

1. **Bundles:** sell related items together, for example a yoga mat with a strap.
2. **Multi-buy offers:** "2 for £18" on consumables.
3. **Free delivery threshold:** set it just above your current AOV.
4. **Larger pack sizes:** sell 3-packs and 6-packs at a better unit price.
5. **Cross-sells:** suggest accessories on product pages and in packaging inserts.
6. **Upsells:** offer the better model with a clear reason to choose it.
7. **Price endings:** £24.99 instead of £25 (see [psychological pricing](/blog/psychological-pricing)).
8. **Gift options:** gift wrap or messages around Christmas and occasions.
9. **Variation listings:** show all sizes and colours together so buyers add more than one.

## AOV on marketplaces vs your own shop

On marketplaces, most orders are a single item because buyers come for one product. Bundles and multi-packs are the best levers there. In your own shop, free delivery thresholds and cross-sells work better.

## Track AOV with other KPIs

AOV is one of three numbers that decide revenue: traffic × [conversion rate](/blog/ecommerce-conversion-rate) × AOV. Our [ecommerce KPIs guide](/blog/ecommerce-kpis) shows which other numbers to track, and [customer lifetime value](/blog/customer-lifetime-value) shows what a customer is worth over time.

## Do not raise AOV at the cost of margin

A bundle discount that is too deep can raise AOV while cutting profit. Check profit per order, not just order size. The [OnBuy fee calculator](/onbuy-fee-calculator) shows profit for any price on OnBuy.`,
  },
  {
    slug: "customer-lifetime-value",
    title: "Customer lifetime value (CLV): formula for online sellers",
    description:
      "Customer lifetime value explained: the CLV formula, a simple worked example for online sellers, how it guides marketing spend, and ways to increase it.",
    keyword: "customer lifetime value",
    secondary: ["clv formula", "how to calculate customer lifetime value", "ltv ecommerce", "increase customer lifetime value"],
    category: "Growth",
    date: "2026-12-01",
    readingMinutes: 6,
    takeaways: [
      "Customer lifetime value (CLV) estimates the total profit a customer brings over their relationship with you.",
      "Simple formula: average order value × orders per year × years as a customer × profit margin.",
      "CLV tells you how much you can afford to spend to win a customer.",
      "Marketplace customers belong partly to the marketplace, so CLV matters most in your own shop.",
    ],
    faq: [
      {
        q: "How do you calculate customer lifetime value?",
        a: "A simple method is average order value × number of orders per year × number of years a customer stays × profit margin. For example, £30 × 3 × 2 × 25% = £45 of lifetime profit.",
      },
      {
        q: "What is a good CLV to CAC ratio?",
        a: "A common rule of thumb is that lifetime value should be at least three times what it costs to acquire a customer. If it is lower, you may be overspending on marketing.",
      },
      {
        q: "Does CLV matter for marketplace sellers?",
        a: "Yes, but less directly. Marketplaces limit how you can contact buyers, so repeat sales come from great products, reviews and being easy to find again.",
      },
    ],
    related: ["average-order-value", "ecommerce-kpis", "dropshipping-customer-service", "grow-onbuy-sales"],
    md: `Customer lifetime value (CLV) is the total profit you expect from a customer over their whole relationship with your business. A simple formula is average order value × orders per year × years as a customer × profit margin. It tells you how much you can afford to spend to win a new customer and still make money.

## A simple CLV formula

**CLV = AOV × purchases per year × years retained × profit margin**

| Input | Example |
|---|---|
| Average order value | £30 |
| Purchases per year | 3 |
| Years as a customer | 2 |
| Profit margin | 25% |
| **CLV (profit)** | **£45** |

Some people quote CLV as revenue (£180 here). Profit is more useful for decisions.

## Why CLV matters

- **Marketing budget:** if a customer is worth £45 in profit, spending £60 to acquire one loses money.
- **Customer service:** keeping a customer happy is cheaper than finding a new one.
- **Product range:** consumables and accessories bring customers back.

A common rule of thumb is CLV at least 3× your customer acquisition cost (CAC).

## How to increase CLV

1. **Sell products people re-buy:** consumables, refills, accessories.
2. **Raise [average order value](/blog/average-order-value)** with bundles and multi-packs.
3. **Excellent service:** fast replies and easy returns (see [dropshipping customer service](/blog/dropshipping-customer-service)).
4. **Packaging inserts:** a thank-you card with your shop name (within each marketplace's rules).
5. **Email in your own shop:** follow-ups and reorder reminders with consent.
6. **Consistent quality:** one bad experience ends the relationship.

## CLV on marketplaces

Marketplaces like Amazon, eBay and OnBuy limit off-platform contact with buyers. Repeat purchases there come from being the seller buyers find again: competitive prices, good reviews and holding the buy box. See [grow OnBuy sales](/blog/grow-onbuy-sales).

## CLV with other KPIs

CLV pairs with AOV, conversion rate and return rate. Our [ecommerce KPIs guide](/blog/ecommerce-kpis) puts them together into a simple monthly dashboard.`,
  },
  {
    slug: "consumer-rights-online-sellers",
    title: "Consumer rights for UK online sellers: refunds and returns",
    description:
      "UK consumer rights for online sellers: the 14-day cancellation right, Consumer Rights Act refunds for faulty goods, exemptions and what your policy needs.",
    keyword: "consumer rights act refunds",
    secondary: ["consumer contracts regulations 14 days", "online returns law uk", "refund rules uk", "faulty goods refund uk"],
    category: "Guides",
    date: "2026-12-02",
    readingMinutes: 7,
    takeaways: [
      "Online buyers can usually cancel within 14 days of receiving goods, for any reason (Consumer Contracts Regulations 2013).",
      "After cancelling, they have another 14 days to return the goods, and you must refund within 14 days of getting them back.",
      "Faulty goods have a separate 30-day right to reject for a full refund (Consumer Rights Act 2015).",
      "Some items are exempt from the cancellation right, such as personalised goods and opened hygiene items.",
    ],
    faq: [
      {
        q: "How long do customers have to return online purchases in the UK?",
        a: "Customers buying online from a business can usually cancel within 14 days of receiving the goods, without giving a reason. They then have another 14 days to send the goods back.",
      },
      {
        q: "Do I have to refund delivery costs?",
        a: "When a customer cancels within 14 days, you must refund the original standard delivery charge. The customer usually pays the return postage if your terms say so. For faulty goods, you cover the return costs.",
      },
      {
        q: "What are the rules for faulty goods?",
        a: "Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose and as described. Buyers can reject faulty goods for a full refund within 30 days, and after that are entitled to a repair or replacement first.",
      },
      {
        q: "Which items can't be returned under the 14-day rule?",
        a: "Exemptions include personalised or made-to-order items, perishable goods, sealed hygiene or health products that have been unsealed, and sealed audio, video or software that has been opened.",
      },
    ],
    related: ["onbuy-returns", "dropshipping-customer-service", "is-dropshipping-legal-uk", "how-to-sell-on-ebay-uk"],
    md: `In the UK, online buyers can usually cancel an order within 14 days of receiving it for any reason, under the Consumer Contracts Regulations 2013. You must then refund within 14 days of getting the goods back, including standard delivery. Faulty goods are covered separately by the Consumer Rights Act 2015, with a 30-day right to reject for a full refund.

This is general information, not legal advice. Check GOV.UK or get advice for your specific case.

## The two sets of rights

| | Change of mind (distance selling) | Faulty goods |
|---|---|---|
| Law | Consumer Contracts Regulations 2013 | Consumer Rights Act 2015 |
| Applies to | Online, phone and mail order from businesses | All sales from businesses |
| Time limit | 14 days from delivery to cancel | 30 days to reject; then repair or replace |
| Reason needed | No | Goods not as described, faulty or unfit |
| Return postage | Customer, if your terms say so | You |

## The 14-day cancellation right

1. The buyer tells you they want to cancel within 14 days of receiving the goods.
2. They return the goods within a further 14 days.
3. You refund within 14 days of receiving the goods (or proof of return).
4. The refund includes the original standard delivery charge.

You can deduct an amount if the goods were handled more than needed to inspect them, for example clearly used.

## Exemptions

The 14-day right does not apply to:

- Personalised or made-to-order goods
- Perishable goods
- Sealed hygiene or health items once unsealed
- Sealed audio, video or software once opened

## Faulty goods

Goods must be of satisfactory quality, fit for purpose and as described.

- **Within 30 days:** the buyer can reject for a full refund.
- **After 30 days (up to 6 months):** you get one chance to repair or replace. If that fails, the buyer can get a refund (possibly reduced for use after 6 months).
- In the first 6 months, a fault is assumed to have been there at delivery unless you can show otherwise.

## Marketplace rules on top

Marketplaces often set their own returns rules, which can be more generous than the law. Check your marketplace's current policy. See [OnBuy returns](/blog/onbuy-returns) and [how to sell on eBay UK](/blog/how-to-sell-on-ebay-uk).

## Dropshipping and returns

As the seller, you are responsible to the buyer even if your supplier ships the goods. Agree returns terms with suppliers before listing (see [is dropshipping legal in the UK](/blog/is-dropshipping-legal-uk)).

## What to put in your returns policy

- The 14-day cancellation window and how to cancel
- Who pays return postage for change-of-mind returns
- Your returns address
- Refund timescales
- Exempt items
- How to report faulty goods

Keep it short and in plain English. Our [customer service guide](/blog/dropshipping-customer-service) has template replies for returns.`,
  },
  {
    slug: "etsy-fees-uk",
    title: "Etsy fees UK: listing, transaction and payment fees explained",
    description:
      "Etsy fees in the UK explained: listing fee, transaction fee, payment processing, Offsite Ads, VAT on fees, a worked example and how to price for profit.",
    keyword: "etsy fees uk",
    secondary: ["etsy seller fees uk", "etsy transaction fee", "etsy offsite ads fee", "etsy fee calculator uk"],
    category: "Fees and profit",
    date: "2026-12-03",
    readingMinutes: 6,
    takeaways: [
      "Etsy charges a listing fee per item, a transaction fee on the total sale, and a payment processing fee.",
      "Offsite Ads can add a further fee on sales that come from Etsy's external adverts.",
      "UK sellers pay VAT on Etsy's fees, which raises the real cost if you are not VAT registered.",
      "Add every fee into your price, or small items can end up barely profitable.",
    ],
    faq: [
      {
        q: "How much does Etsy charge per sale in the UK?",
        a: "Etsy charges a transaction fee (a percentage of the item price plus delivery and gift wrap) and a payment processing fee (a percentage plus a small fixed amount). There is also a listing fee per item. Check Etsy's current fee schedule for today's rates.",
      },
      {
        q: "What is the Etsy Offsite Ads fee?",
        a: "When a sale comes from an Etsy advert on another site, Etsy charges an extra percentage fee. Smaller shops can opt out; larger shops are enrolled automatically.",
      },
      {
        q: "Do I pay VAT on Etsy fees?",
        a: "Yes. Etsy adds UK VAT to its fees. VAT-registered sellers can usually reclaim it; others should treat it as a cost.",
      },
    ],
    related: ["shopify-vs-etsy", "print-on-demand-uk", "ebay-fees-uk", "hidden-costs-of-selling-online"],
    md: `Etsy fees in the UK have three main parts: a listing fee for each item, a transaction fee on the total sale (item, delivery and gift wrap), and a payment processing fee per order. Offsite Ads can add another fee on sales from Etsy's external adverts, and UK sellers pay VAT on all of these.

Etsy updates its fees from time to time, so check its current fee schedule before pricing.

## Etsy fees at a glance

| Fee | How it is charged |
|---|---|
| Listing fee | Per listing, renews when the item sells or after four months |
| Transaction fee | Percentage of item price + delivery + gift wrap |
| Payment processing | Percentage of the order total plus a small fixed fee |
| Offsite Ads | Percentage of the sale, only on sales from Etsy's external ads |
| Etsy Ads (onsite) | Optional daily budget |
| Etsy Plus | Optional monthly subscription |
| VAT | Added to Etsy's fees for UK sellers |

## Worked example

An item sells for £20 with £3.50 delivery. Using illustrative rates of £0.16 listing, 6.5% transaction, and 4% + £0.20 payment processing, not VAT registered (so 20% VAT on fees is a cost):

| Line | Amount |
|---|---|
| Buyer pays | £23.50 |
| Listing fee | −£0.16 |
| Transaction fee (6.5% of £23.50) | −£1.53 |
| Payment processing (4% + £0.20) | −£1.14 |
| VAT on fees (20%) | −£0.57 |
| Postage | −£3.20 |
| Materials and making | −£8.00 |
| **Profit** | **£8.90** |

If the sale came from Offsite Ads, take off a further percentage. That can turn a good margin into a thin one.

## How to keep Etsy fees under control

- Put fees into your price from the start.
- Consider whether to opt out of Offsite Ads, if your shop is small enough to be allowed to.
- Charge realistic delivery: the transaction fee applies to delivery too.
- Renew listings wisely: every renewal costs a listing fee.

## Etsy vs other channels

Etsy suits handmade, vintage, personalised and [print on demand](/blog/print-on-demand-uk) items. For branded or general products, eBay or OnBuy may fit better. Compare with [eBay fees UK](/blog/ebay-fees-uk) and read [Shopify vs Etsy](/blog/shopify-vs-etsy) if you are thinking about your own shop.`,
  },
  {
    slug: "packaging-for-ecommerce",
    title: "Packaging for ecommerce: a practical guide for UK sellers",
    description:
      "Ecommerce packaging for UK online sellers: choosing boxes and mailers, protecting items, cutting postage with the right size, and branding on a budget.",
    keyword: "packaging for ecommerce",
    secondary: ["ecommerce packaging uk", "mailing bags uk", "cheap packaging for small business", "eco friendly packaging uk"],
    category: "Guides",
    date: "2026-12-04",
    readingMinutes: 6,
    takeaways: [
      "The right packaging protects the item at the lowest size and weight band.",
      "Poly mailers suit soft items; boxes suit fragile or rigid products; padded envelopes fit small flat items.",
      "Size bands drive postage prices, so a slightly smaller box can save money on every order.",
      "Recyclable, right-sized packaging is cheaper to post and what buyers increasingly expect.",
    ],
    faq: [
      {
        q: "What packaging do online sellers need?",
        a: "Most sellers need a few sizes of mailing bags or boxes, protective filler, tape, and labels. Choose sizes that fit your most common products snugly to keep postage costs down.",
      },
      {
        q: "Where can I buy cheap packaging in the UK?",
        a: "Packaging wholesalers and online suppliers sell in bulk at much lower unit prices than high-street shops. Buying in larger quantities lowers the cost per parcel.",
      },
      {
        q: "Is eco-friendly packaging more expensive?",
        a: "Often slightly, but right-sized recyclable packaging can offset the difference through cheaper postage and fewer damaged items.",
      },
    ],
    related: ["cheapest-courier-uk", "royal-mail-click-and-drop", "hidden-costs-of-selling-online", "customer-lifetime-value"],
    md: `Good ecommerce packaging protects your product at the smallest size and lowest weight band your courier offers. For UK sellers, that usually means poly mailers for soft goods, padded envelopes for small flat items, and right-sized boxes for anything fragile. Packaging is a real cost per order, so choose a few standard sizes and buy them in bulk.

## Choosing the right packaging

| Packaging | Best for | Watch out for |
|---|---|---|
| Poly mailing bags | Clothing, textiles, soft items | No crush protection |
| Padded envelopes | Small flat items, books, accessories | Limited protection for fragile items |
| Cardboard boxes | Fragile, rigid or heavy products | Bigger boxes jump size bands |
| Postal tubes | Posters, prints | Higher postage per item |
| Large letter boxes | Thin items under Royal Mail's large letter size | Strict size and thickness limits |

## Packaging and postage price

Couriers price mostly by size band and weight. A box a little too big can push you into the next band on every order. Measure your products, then pick packaging that fits the smallest band possible. Compare carriers in [cheapest courier UK](/blog/cheapest-courier-uk).

## Protecting the item

- Fill gaps so the product cannot move.
- Use paper or recyclable filler instead of loose plastic.
- Double-box fragile items.
- Test by shaking the packed parcel.

A damaged item costs a refund, a return and maybe a bad review, far more than better packaging.

## Sustainability

UK buyers increasingly expect less plastic and recyclable packaging. Simple wins:

- Right-size boxes to avoid wasted space
- Recyclable paper mailers and paper tape
- Reuse supplier boxes where they are clean and suitable

## Branding on a budget

A thank-you card or a sticker with your shop name costs pennies. On marketplaces, follow each platform's rules about inserts and do not direct buyers off the platform.

## Packaging for dropshippers

If you dropship, your supplier packs the order. Ask what packaging they use, whether they can ship unbranded (so their invoice or prices are not included) and how they protect fragile items.

## Count packaging in your costs

Packaging, tape and labels are a cost on every order. Add them to your product cost along with postage. See [hidden costs of selling online](/blog/hidden-costs-of-selling-online) for the full list.`,
  },
  {
    slug: "shopify-vs-etsy",
    title: "Shopify vs Etsy: which is better for UK sellers?",
    description:
      "Shopify vs Etsy for UK sellers: costs, traffic, control, branding, fees and what each suits best, plus when to use both alongside marketplaces.",
    keyword: "shopify vs etsy",
    secondary: ["etsy or shopify", "shopify vs etsy fees", "should i sell on etsy or shopify", "shopify vs etsy uk"],
    category: "Marketplaces",
    date: "2026-12-05",
    readingMinutes: 6,
    takeaways: [
      "Etsy is a marketplace with built-in buyers for handmade, vintage, craft and personalised items.",
      "Shopify is software for your own online shop: full control, but you bring the traffic.",
      "Etsy costs are mostly per sale; Shopify costs are mostly monthly, plus payment fees and apps.",
      "Many sellers start on Etsy to find buyers, then add Shopify to build a brand.",
    ],
    faq: [
      {
        q: "Is Etsy or Shopify cheaper?",
        a: "Etsy is cheaper to start because you mainly pay per listing and per sale. Shopify has a monthly subscription plus payment fees and often app costs, but no per-sale marketplace commission on most plans beyond payment processing.",
      },
      {
        q: "Which gets more traffic, Etsy or Shopify?",
        a: "Etsy brings its own shoppers searching for products. A Shopify store gets no traffic by default; you need SEO, social media, ads or email to bring visitors.",
      },
      {
        q: "Can I use Etsy and Shopify together?",
        a: "Yes. Many sellers list on Etsy for its buyers and run a Shopify store for repeat customers and brand building, keeping stock in sync between them.",
      },
    ],
    related: ["etsy-fees-uk", "print-on-demand-uk", "multichannel-selling-uk", "uk-online-marketplaces"],
    md: `Shopify vs Etsy comes down to traffic vs control. Etsy is a marketplace with millions of buyers looking for handmade, vintage, craft and personalised items, and you pay mostly per sale. Shopify is software for your own shop: you control the brand, prices and customer data, but you must bring every visitor yourself and pay a monthly fee.

## Side-by-side comparison

| | Etsy | Shopify |
|---|---|---|
| What it is | Marketplace | Your own online shop |
| Built-in traffic | Yes | No |
| Costs | Listing, transaction and payment fees | Monthly plan, payment fees, apps |
| Branding | Limited, Etsy's look | Full control |
| Customer data | Limited | Yours (with consent) |
| Competition | Other sellers on the same page | Only for attention |
| Product rules | Handmade, vintage, craft supplies, designed items | Almost anything legal |

## Choose Etsy if

- You sell handmade, vintage, personalised or [print on demand](/blog/print-on-demand-uk) items.
- You want buyers from day one.
- You prefer paying per sale over a monthly bill.

See [Etsy fees UK](/blog/etsy-fees-uk) for a full breakdown.

## Choose Shopify if

- You want to build a brand and repeat customers.
- You sell products that do not fit Etsy's rules.
- You can drive traffic through SEO, social media, ads or email.

## Use both

A common path:

1. Start on Etsy to test products and find buyers.
2. Open a Shopify store for repeat buyers and better margins.
3. Keep stock in sync so you never oversell (see [stock sync](/blog/stock-sync-dropshipping)).

## What about general products?

If you sell branded or general goods rather than handmade, UK marketplaces such as Amazon, eBay and OnBuy reach far more buyers than Etsy. See [UK online marketplaces](/blog/uk-online-marketplaces) and [multichannel selling](/blog/multichannel-selling-uk) to choose the right mix.`,
  },
  {
    slug: "side-hustle-ideas-uk",
    title: "Online side hustle ideas UK: 10 ways to sell from home",
    description:
      "Online selling side hustle ideas for the UK: reselling, dropshipping, print on demand, handmade, and more, with startup costs, time needed and tax basics.",
    keyword: "side hustle ideas uk",
    secondary: ["online side hustle uk", "selling side hustle", "best side hustles uk 2026", "side hustle from home uk"],
    category: "Growth",
    date: "2026-12-06",
    readingMinutes: 7,
    takeaways: [
      "Selling online is one of the most flexible UK side hustles: low startup costs and hours that fit around a job.",
      "Reselling, dropshipping, print on demand and handmade are the most common starting points.",
      "Up to £1,000 of gross trading income a year is covered by the trading allowance; above that you register for Self Assessment.",
      "Start small, track profit after every fee, and grow what works.",
    ],
    faq: [
      {
        q: "What is the best online side hustle in the UK?",
        a: "It depends on your time, money and skills. Reselling and print on demand need very little upfront money; dropshipping needs time for research and customer service; handmade suits people with a craft skill.",
      },
      {
        q: "Do I have to pay tax on a side hustle?",
        a: "If your gross trading income is over £1,000 in a tax year, you need to register for Self Assessment and may owe tax on the profit. Below that, the trading allowance usually covers it.",
      },
      {
        q: "How much can I earn from an online side hustle?",
        a: "Earnings vary widely. Many people make a few hundred pounds a month; some grow it into a full-time business. Profit depends on margins, effort and choosing products with demand.",
      },
    ],
    related: ["trading-allowance-selling-online", "vinted-selling-tips", "print-on-demand-uk", "start-dropshipping-business-uk"],
    md: `The best online side hustles in the UK for selling from home include reselling on eBay and Vinted, dropshipping on marketplaces, print on demand, and selling handmade goods. Most cost little to start and fit around a job. Choose one based on your time, money and skills, track profit after fees, and remember the £1,000 trading allowance.

## 10 online selling side hustles

| Side hustle | Startup cost | Time needed | Good for |
|---|---|---|---|
| Decluttering on Vinted or eBay | None | Low | Getting started |
| Reselling charity shop and car boot finds | Low | Medium | People with an eye for value |
| Retail and online arbitrage | Medium | Medium | Bargain hunters |
| Dropshipping on marketplaces | Low | Medium | People who like research and systems |
| Print on demand | Low | Medium | Designers and niche fans |
| Handmade on Etsy | Materials | High | Makers |
| Selling digital products | Low | Front-loaded | Creators |
| Wholesale and own stock | Higher | High | Growing sellers |
| TikTok Shop affiliate | None | Content time | Content creators |
| Refurbishing and upcycling | Low to medium | High | Practical skills |

Our guides go deeper: [Vinted selling tips](/blog/vinted-selling-tips), [retail arbitrage UK](/blog/retail-arbitrage-uk), [start a dropshipping business](/blog/start-dropshipping-business-uk), [print on demand UK](/blog/print-on-demand-uk) and [TikTok Shop UK](/blog/tiktok-shop-uk).

## How to choose

- **Little money, little time:** declutter, then resell.
- **Little money, more time:** dropshipping or print on demand.
- **A craft skill:** handmade on Etsy.
- **Cash to invest:** wholesale, with higher margins.

## Tax basics

Selling your own unwanted things is not usually taxable. Buying to resell or making to sell is trading. If your gross trading income is over £1,000 in a tax year, register for Self Assessment. Marketplaces report sellers with 30+ sales or about £1,700 a year to HMRC. Read the [trading allowance guide](/blog/trading-allowance-selling-online).

## Make it profitable

Many side hustles fail because sellers count revenue, not profit. For every sale, subtract product cost, marketplace fees, postage and packaging. If you sell on OnBuy, the [OnBuy fee calculator](/onbuy-fee-calculator) does the sums for you.

## Grow without burning out

Automate the boring parts: stock syncing, repricing and order updates. That is the point where a side hustle can grow without taking every evening.`,
  },
  {
    slug: "vinted-selling-tips",
    title: "Vinted selling tips: how to sell faster in the UK",
    description:
      "Vinted selling tips for UK sellers: photos, titles, pricing, bundles, postage, bumps, buyer protection, tax rules and when to move beyond Vinted.",
    keyword: "vinted selling tips",
    secondary: ["how to sell on vinted", "vinted tips uk", "sell faster on vinted", "vinted tax hmrc"],
    category: "Marketplaces",
    date: "2026-12-07",
    readingMinutes: 6,
    takeaways: [
      "Bright photos on a plain background and clear titles with brand, size and condition sell items faster.",
      "Price by checking sold items, then leave a little room for offers.",
      "Bundle discounts and quick replies increase sales.",
      "Vinted reports sellers to HMRC above the platform reporting thresholds; reselling for profit is trading.",
    ],
    faq: [
      {
        q: "Does Vinted charge sellers fees?",
        a: "Vinted does not usually charge UK sellers a selling fee; buyers pay a buyer protection fee. Sellers can pay for optional features like bumps. Check Vinted's current terms.",
      },
      {
        q: "How do I sell faster on Vinted?",
        a: "Use bright, clear photos, accurate titles with brand and size, fair prices based on similar sold items, bundle discounts, and reply quickly to messages and offers.",
      },
      {
        q: "Does Vinted report to HMRC?",
        a: "Yes. Vinted shares information with HMRC for sellers who reach 30 or more sales, or about £1,700 or more, in a calendar year. Selling your own used clothes for less than you paid is not usually taxable.",
      },
    ],
    related: ["side-hustle-ideas-uk", "trading-allowance-selling-online", "how-to-sell-on-ebay-uk", "cheapest-courier-uk"],
    md: `To sell faster on Vinted in the UK, take bright photos on a plain background, write titles with brand, item, size and condition, and price by checking similar sold items. Offer bundle discounts, reply quickly, and post within the deadline. If you start buying items to resell for profit, HMRC treats that as trading.

## Photos that sell

- Natural daylight, plain background
- Front, back, label and any flaws
- Worn or hung, not crumpled on a bed
- First photo shows the whole item clearly

## Titles and descriptions

| Part | Example |
|---|---|
| Title | Zara black wool coat, size M, excellent condition |
| Brand and size | Fill in the fields: buyers filter by them |
| Condition | Honest, mention any marks |
| Measurements | Pit to pit and length for clothing |
| Keywords | Style words buyers search, for example "oversized" or "vintage" |

Good descriptions cut questions and returns. Our guide to [writing product descriptions](/blog/write-product-descriptions) applies here too.

## Pricing

1. Search the same brand and item, and look at what has sold.
2. Price slightly above where you are happy to land, to leave room for offers.
3. Lower the price after a week or two if there is no interest.

## More Vinted tips

- **Bundle discounts:** encourage buyers to take several items.
- **Reply fast:** quick sellers get more sales.
- **Post on time:** late posting hurts your reviews.
- **Refresh listings:** re-listing or optional bumps can bring items back into view.
- **Package well:** clean, folded and protected (see [packaging for ecommerce](/blog/packaging-for-ecommerce)).

## Vinted and tax

Selling your own wardrobe usually is not taxable. If you buy items to resell at a profit, that is trading. Vinted reports sellers to HMRC under the platform reporting rules once they reach the thresholds. Read the [trading allowance guide](/blog/trading-allowance-selling-online).

## Moving beyond Vinted

Vinted is built for second-hand fashion and personal items. If you start reselling new or branded goods at volume, marketplaces such as eBay, Amazon and OnBuy suit business sellers better. See [how to sell on eBay UK](/blog/how-to-sell-on-ebay-uk) and [side hustle ideas UK](/blog/side-hustle-ideas-uk).`,
  },
  {
    slug: "ecommerce-conversion-rate",
    title: "Ecommerce conversion rate: benchmarks and how to improve it",
    description:
      "Ecommerce conversion rate explained for UK sellers: the formula, typical benchmarks, why marketplace and shop rates differ, and practical ways to improve yours.",
    keyword: "ecommerce conversion rate",
    secondary: ["average conversion rate ecommerce uk", "conversion rate formula", "improve conversion rate", "marketplace conversion rate"],
    category: "Growth",
    date: "2026-12-08",
    readingMinutes: 6,
    takeaways: [
      "Conversion rate = orders ÷ sessions (or listing views) × 100.",
      "Online shops often convert in the low single digits; marketplace listings can convert higher because buyers arrive ready to buy.",
      "Price, photos, delivery time and reviews have the biggest impact.",
      "Compare against your own past figures, not other industries.",
    ],
    faq: [
      {
        q: "How do you calculate ecommerce conversion rate?",
        a: "Divide the number of orders by the number of sessions or listing views in the same period and multiply by 100. For example, 30 orders from 1,000 sessions is a 3% conversion rate.",
      },
      {
        q: "What is a good ecommerce conversion rate?",
        a: "For online shops, figures between 1% and 4% are commonly reported, but it varies a lot by product, price and traffic source. Marketplace listings often convert higher. Track your own trend over time.",
      },
      {
        q: "How can I increase my conversion rate?",
        a: "Competitive pricing, clear photos, accurate descriptions, fast delivery, visible returns policy and good reviews. On marketplaces with a buy box, winning the buy box is the biggest single factor.",
      },
    ],
    related: ["ecommerce-kpis", "average-order-value", "write-product-descriptions", "onbuy-listing-optimisation"],
    md: `Ecommerce conversion rate is the share of visits that end in an order: orders ÷ sessions × 100. If 1,000 visits produce 30 orders, your conversion rate is 3%. Online shops commonly convert in the low single digits, while marketplace listings can convert higher because buyers arrive ready to buy. Price, photos, delivery and reviews move it most.

## The formula

**Conversion rate = orders ÷ sessions × 100**

On marketplaces, use listing views (or page views) instead of sessions, where the marketplace reports them.

## Why rates vary so much

| Factor | Effect |
|---|---|
| Traffic source | Search traffic converts better than social browsing |
| Price point | Cheap items convert better than expensive ones |
| Channel | Marketplaces often convert higher than new shops |
| Device | Mobile often converts lower than desktop |
| Season | Black Friday and December convert higher |

So compare against your own numbers month by month rather than chasing an industry average.

## What improves conversion

1. **Price:** on buy-box marketplaces, the buy-box winner gets most sales (see [Amazon buy box](/blog/amazon-buy-box) and [OnBuy buy box](/blog/onbuy-buy-box)).
2. **Photos:** sharp, bright, several angles, with scale.
3. **Titles and descriptions:** answer the questions buyers have (see [writing product descriptions](/blog/write-product-descriptions)).
4. **Delivery:** fast, clearly stated delivery dates.
5. **Trust:** reviews, a clear returns policy, accurate stock.
6. **Mobile experience:** fast pages and easy checkout in your own shop.

## Fix the biggest leak first

Look for products with many views but few sales. These usually have a price, photo or delivery problem. Fixing one high-traffic listing beats tweaking ten quiet ones.

## Conversion rate with other KPIs

Revenue = traffic × conversion rate × [average order value](/blog/average-order-value). Our [ecommerce KPIs guide](/blog/ecommerce-kpis) shows how to track all three, and [OnBuy listing optimisation](/blog/onbuy-listing-optimisation) covers listing fixes specific to OnBuy.`,
  },
  {
    slug: "write-product-descriptions",
    title: "How to write product descriptions that sell (with template)",
    description:
      "How to write product descriptions that sell on marketplaces and your own shop: a simple template, examples, SEO keywords, and mistakes that cause returns.",
    keyword: "how to write product descriptions",
    secondary: ["product description template", "product description examples", "marketplace listing description", "seo product descriptions"],
    category: "Selling on OnBuy",
    date: "2026-12-09",
    readingMinutes: 6,
    takeaways: [
      "Lead with the main benefit and who the product is for, then the key facts.",
      "Use short bullet points for features, sizes, materials and what is in the box.",
      "Include the words buyers search for naturally, especially in the title and first lines.",
      "Accurate descriptions reduce questions and returns as much as they increase sales.",
    ],
    faq: [
      {
        q: "How long should a product description be?",
        a: "Long enough to answer a buyer's questions and no longer. For most marketplace products, a short opening paragraph plus five to eight bullet points works well.",
      },
      {
        q: "Should I copy the manufacturer's description?",
        a: "You can use the facts, but rewriting the description in your own words, focused on benefits and buyer questions, usually converts better and helps your own shop's SEO.",
      },
      {
        q: "How do I add keywords to product descriptions?",
        a: "Use the phrases buyers search for, such as brand, product type, size and key feature, naturally in the title, the first sentence and the bullet points. Avoid stuffing repeated keywords.",
      },
    ],
    related: ["onbuy-listing-optimisation", "ecommerce-conversion-rate", "how-to-sell-on-ebay-uk", "consumer-rights-online-sellers"],
    md: `To write product descriptions that sell, open with the main benefit and who the product is for, then list the key facts in short bullet points: features, size, materials, compatibility and what is in the box. Use the words buyers search for naturally, and be accurate. Clear descriptions win sales and cut returns.

## A simple template

1. **Opening line:** what it is, who it is for, the main benefit.
2. **Bullets (5–8):** key features, each turned into a benefit.
3. **Specs:** size, weight, materials, colours, compatibility.
4. **In the box:** everything included.
5. **Care or use notes:** if relevant.
6. **Delivery and returns:** if the channel allows.

## Example

**Before:** "Yoga mat. 6mm. Purple. Non-slip."

**After:**

A thick 6mm yoga mat that cushions knees and wrists, for home workouts, yoga and pilates.

- Non-slip textured surface on both sides, for grip on hard floors
- 183 × 61 cm, fits most home spaces
- Lightweight with a carry strap
- Easy to wipe clean
- Free from latex

## Write for search, then for people

Buyers search for brand, product type, size, colour and key feature. Put those words in the title and first lines, naturally. Keyword stuffing makes listings harder to read and can break marketplace rules.

## Marketplace vs your own shop

| | Marketplace | Your own shop |
|---|---|---|
| Format | Fixed fields, bullet points | Free layout |
| Shared product page | Often (Amazon, OnBuy) | No |
| SEO | Marketplace search | Google search |
| Duplicate text | Common | Rewrite to rank on Google |

On marketplaces with shared product pages, your offer competes mainly on price and delivery, so check the shared description is accurate. See [OnBuy listing optimisation](/blog/onbuy-listing-optimisation).

## Mistakes that cause returns

- Missing sizes or measurements
- Photos that do not match the variant
- Vague compatibility ("fits most phones")
- Overclaiming quality or results

UK consumer law says goods must be as described (see [consumer rights for online sellers](/blog/consumer-rights-online-sellers)), so accuracy protects you too.

## Measure the result

Track views and orders before and after a rewrite. A higher [conversion rate](/blog/ecommerce-conversion-rate) on the same traffic means the description is working.`,
  },
  {
    slug: "ecommerce-kpis",
    title: "Ecommerce KPIs: the 10 numbers UK online sellers should track",
    description:
      "The ecommerce KPIs that matter for UK online sellers: profit per order, margin, conversion rate, AOV, return rate, buy box share and more, with formulas.",
    keyword: "ecommerce kpis",
    secondary: ["ecommerce metrics", "kpis for online sellers", "ecommerce dashboard", "marketplace seller metrics"],
    category: "Growth",
    date: "2026-12-10",
    readingMinutes: 6,
    takeaways: [
      "Track profit KPIs (net profit, margin, profit per order) before vanity numbers like revenue.",
      "Revenue = traffic × conversion rate × average order value: improve any one of the three.",
      "Marketplace sellers should also watch buy box share, late dispatch and cancellation rates.",
      "Review a short dashboard monthly and act on the worst number first.",
    ],
    faq: [
      {
        q: "What are the most important ecommerce KPIs?",
        a: "Net profit and net margin first, then conversion rate, average order value, return rate and customer lifetime value. Marketplace sellers should add buy box share and account health metrics.",
      },
      {
        q: "How often should I review KPIs?",
        a: "Check operational numbers like late dispatch and stock daily or weekly, and review profit, margin and growth KPIs monthly.",
      },
      {
        q: "What is buy box share?",
        a: "The percentage of time, or of page views, in which your offer holds the buy box on shared product pages. Higher buy box share usually means more sales on Amazon and OnBuy.",
      },
    ],
    related: ["average-order-value", "ecommerce-conversion-rate", "customer-lifetime-value", "gross-vs-net-profit-margin"],
    md: `The ecommerce KPIs that matter most for UK online sellers are net profit, net margin and profit per order, followed by conversion rate, average order value, return rate and customer lifetime value. Marketplace sellers should add buy box share, late dispatch rate and cancellation rate. Review them monthly and fix the weakest number first.

## The 10 KPIs

| KPI | Formula | Why it matters |
|---|---|---|
| Revenue | Total sales (ex VAT) | Scale |
| Net profit | Revenue − all costs | What you keep |
| Net margin | Net profit ÷ revenue | Health of each pound sold |
| Profit per order | Net profit ÷ orders | Shows if small orders lose money |
| Conversion rate | Orders ÷ sessions | Listing and price quality |
| Average order value | Revenue ÷ orders | Spreads per-order costs |
| Return rate | Returns ÷ orders | Product and description quality |
| Customer lifetime value | AOV × orders per year × years × margin | What a customer is worth |
| Buy box share | Time or views holding the buy box | Sales on shared pages |
| Late dispatch / cancellation rate | Late or cancelled ÷ orders | Account health |

## The revenue equation

**Revenue = traffic × conversion rate × average order value**

To grow, improve one of the three. See [conversion rate](/blog/ecommerce-conversion-rate) and [average order value](/blog/average-order-value).

## Profit KPIs first

Revenue can rise while profit falls, for example when a repricer wins more sales at lower prices. Always track net profit and margin per product. Our guide to [gross vs net profit margin](/blog/gross-vs-net-profit-margin) explains the difference.

## Marketplace health KPIs

Marketplaces watch your late dispatch, cancellations, valid tracking and response times. Falling behind can limit your account. Check these weekly, and keep [stock synced](/blog/stock-sync-dropshipping) to avoid cancellations.

## A simple monthly dashboard

1. Revenue, net profit, net margin (this month vs last)
2. Top 10 products by profit, not revenue
3. Products with the most views and fewest sales
4. Return rate by product
5. Buy box share on your top products
6. Late dispatch and cancellations

## Let the tools do the counting

SellSail's dashboard shows profit per product after OnBuy fees, buy box position and pricing decisions, so you can see which products earn and which just keep you busy. Try the free [OnBuy fee calculator](/onbuy-fee-calculator) to start.`,
  },
];
