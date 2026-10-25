import type { Post } from "../types";

// Batch 8: arbitrage, stock sync and the OnBuy operations cluster. 28 Dec – 8 Jan.
export const batch08: Post[] = [
  {
    slug: "online-arbitrage-uk",
    title: "Online arbitrage UK: buying online to resell for profit",
    description:
      "Online arbitrage in the UK explained: buying from online shops to resell on marketplaces, calculating profit, the risks, and how it compares with dropshipping.",
    keyword: "online arbitrage uk",
    secondary: ["online arbitrage", "what is online arbitrage", "reselling online uk"],
    category: "Growth",
    date: "2026-12-28",
    readingMinutes: 7,
    takeaways: [
      "Online arbitrage means buying discounted products from online shops and reselling them on marketplaces.",
      "You hold the stock, so you carry the risk if it doesn't sell.",
      "Profit must cover marketplace fees, delivery, VAT if registered, and your time.",
      "Brand restrictions and marketplace rules can block some products.",
    ],
    faq: [
      {
        q: "Is online arbitrage the same as dropshipping?",
        a: "No. In online arbitrage you buy the stock first and ship it yourself or via a fulfilment service. In dropshipping you buy only after the customer orders, and the supplier ships.",
      },
      {
        q: "Is online arbitrage legal in the UK?",
        a: "Yes. Reselling genuine goods you've bought is legal. Some marketplaces restrict certain brands or categories.",
      },
      {
        q: "How do I find online arbitrage deals?",
        a: "Look for clearance sales, price drops and discount codes, then compare with what the item sells for on your marketplace after fees.",
      },
    ],
    related: ["retail-arbitrage-uk", "dropshipping-uk-guide", "profit-margin-formula", "sell-online-uk"],
    md: `Online arbitrage is buying products from online shops when they're cheap, through sales, clearance or discount codes, and reselling them on a marketplace for more. It's the online version of [retail arbitrage](/blog/retail-arbitrage-uk), and a popular way for UK sellers to start with modest capital.

## How does online arbitrage work?

1. Spot a discounted product online.
2. Check what it sells for on your marketplace and how fast.
3. Calculate profit after every fee.
4. Buy stock, receive it, then list and sell.

## Online arbitrage vs dropshipping

| | Online arbitrage | Dropshipping |
|---|---|---|
| Buy stock first? | Yes | No |
| Who ships? | You or a fulfilment service | The supplier |
| Risk | Unsold stock | Supplier delays or stock-outs |
| Margin | Often higher per item | Often lower per item |
| Cash needed | More | Less |

## How do you calculate profit?

| | Amount |
|---|---|
| Selling price | £29.99 |
| Commission (15%) | −£4.50 |
| Delivery to buyer | −£3.50 |
| Purchase price | −£14.00 |
| Packaging | −£0.40 |
| **Profit** | **£7.59** |

If you're VAT-registered, take a sixth of the price off as VAT too. Check with the [fee calculator](/onbuy-fee-calculator).

## What are the risks?

- **Unsold stock** that ties up cash.
- **Price drops** after you buy, as other sellers find the same deal.
- **Brand restrictions** on some marketplaces.
- **Returns** on items you've already paid for.

## Is it right for you?

Online arbitrage suits sellers who enjoy deal-hunting and can store and ship stock. If you'd rather not hold stock, dropshipping may suit better. See [Dropshipping in the UK](/blog/dropshipping-uk-guide).`,
  },
  {
    slug: "stock-sync-dropshipping",
    title: "Stock sync for dropshippers: never sell what you can't send",
    description:
      "Why stock sync matters for UK dropshippers: how inventory sync works with supplier feeds and marketplaces, how often to sync, and safety rules that prevent mistakes.",
    keyword: "inventory sync",
    secondary: ["stock sync", "inventory sync dropshipping", "sync stock with supplier"],
    category: "Repricing",
    date: "2026-12-30",
    readingMinutes: 7,
    takeaways: [
      "Stock sync keeps your listings' stock in line with what your supplier actually has.",
      "Without it you oversell, cancel orders and damage your marketplace standing.",
      "Sync as often as your supplier's stock changes; for fast sellers, every few minutes.",
      "Treat suspicious data, such as everything suddenly out of stock, as an error to check.",
    ],
    faq: [
      {
        q: "What is inventory sync?",
        a: "Automatically updating the stock level on your listings from a source of truth, such as your supplier's stock feed, so what you sell matches what's available.",
      },
      {
        q: "How often should I sync stock?",
        a: "As often as stock changes. For popular items from large suppliers, every few minutes; for slow-moving items from small suppliers, hourly may be enough.",
      },
      {
        q: "What stock level should I show when dropshipping?",
        a: "Many dropshippers show a small fixed quantity, such as 3, when the supplier has stock, and 0 when they don't. That avoids showing the supplier's full stock and limits risk.",
      },
    ],
    related: ["dropshipping-mistakes", "uk-dropshipping-suppliers", "ecommerce-automation-uk", "amazon-dropshipping"],
    md: `Stock sync, or inventory sync, means automatically updating the stock on your listings to match what your supplier actually has. For dropshippers, it's essential: you don't hold the stock, so the only way to know what you can sell is your supplier's data. Without sync, you take orders you can't fulfil.

## Why does stock sync matter?

- **Overselling** leads to cancellations, which hurt your marketplace rating.
- **Late deliveries** happen when you sell items the supplier has to backorder.
- **Wasted sales** when items are back in stock but your listing still says zero.

## How does stock sync work?

1. **Read** the supplier's stock, from a feed, API or product page.
2. **Decide** what to show: often a small fixed quantity when in stock, 0 when not.
3. **Send** the stock level to your marketplace.
4. **Repeat** on a schedule.

## How often should you sync?

| Product type | Suggested frequency |
|---|---|
| Fast sellers from big suppliers | Every few minutes |
| Typical catalogue | Every 15–60 minutes |
| Slow sellers from small suppliers | Hourly to daily |

## What safety rules should you use?

- **Out of stock when unsure.** If a product's data can't be read for a while, set it to 0 rather than keep selling. SellSail, for example, sets a listing out of stock if no fresh Amazon price arrives for 24 hours.
- **Distrust mass changes.** If almost every item suddenly reads as out of stock, it's more likely a data glitch than a sell-out: check again before acting.
- **Show a small quantity**, not the supplier's full stock.
- **Log every change** so you can see what happened.

## Stock and price belong together

When a supplier is out of stock, its price data often disappears or changes too. The safest tools update price and stock together from the same check. That's how [SellSail](/features) works for OnBuy sellers sourcing from Amazon UK: each check reads the Amazon offer (fulfilled by Amazon, in stock, dispatched within 48 hours), sets the OnBuy price with fees and profit built in, and sets stock to your chosen quantity, or to 0 when there's no qualifying offer.

Related: [Dropshipping mistakes](/blog/dropshipping-mistakes) and [Ecommerce automation](/blog/ecommerce-automation-uk).`,
  },
  {
    slug: "onbuy-buy-box",
    title: "Winning on OnBuy: how the winning offer (buy box) works",
    description:
      "How to win more sales when several sellers offer the same product on OnBuy: what decides the winning offer and how to compete without losing money.",
    keyword: "onbuy buy box",
    secondary: ["onbuy winning offer", "win the buy box onbuy", "onbuy competition"],
    category: "Selling on OnBuy",
    date: "2027-01-04",
    readingMinutes: 7,
    takeaways: [
      "When several sellers list the same product on OnBuy, one offer is shown as the main offer to buyers.",
      "Price is a major factor; being a few pence cheaper is often enough.",
      "Never chase the winning offer below your floor price.",
      "Fast dispatch, accurate stock and good performance help you win and keep it.",
    ],
    faq: [
      {
        q: "What is the buy box on OnBuy?",
        a: "It's a common name for the main offer shown on a product page when several sellers list the same product. Buyers usually buy from that offer.",
      },
      {
        q: "How do I know if I'm winning on OnBuy?",
        a: "OnBuy's seller API can report whether your listing is currently winning and, if not, the leading price. Tools such as SellSail check this for you.",
      },
      {
        q: "Should I always try to win?",
        a: "Only where it's profitable. If the leading price is below your floor, holding your price is better than selling at a loss.",
      },
    ],
    related: ["competitor-price-monitoring", "repricing-strategies", "floor-price", "how-to-sell-on-onbuy"],
    md: `On OnBuy, many products are sold by several sellers on one product page. Buyers usually see one main offer, often called the buy box or winning offer, and most sales go to it. Winning that position more often, without giving away your margin, is one of the biggest levers for OnBuy sellers.

## What decides the winning offer?

OnBuy doesn't publish every detail, but as on other marketplaces, the main factors you control are:

| Factor | What you can do |
|---|---|
| Price (including delivery) | Price competitively, inside your floor |
| Stock | Keep listings in stock and accurate |
| Dispatch time | Promise times you can always meet |
| Seller performance | Few cancellations, late dispatches or complaints |

## How do you know whether you're winning?

OnBuy's seller API can tell you whether each listing is currently the winning offer and, if it isn't, the leading price. Checking this by hand across hundreds of listings isn't realistic; tools can do it every few minutes.

## How should you price to win?

1. **Know your floor** for every listing. See [What is a floor price?](/blog/floor-price)
2. **If you're losing and the leader is above your floor,** price a few pence under them.
3. **If the leader is below your floor,** hold your price.
4. **If you're winning,** don't drop further. Hold, and periodically test your full price in case the rival has gone.

> Five pence cheaper wins the same sale as five pounds cheaper. Undercut by the smallest amount that works.

## What else helps you win and keep it?

- **Short, reliable dispatch times.**
- **Accurate stock**, so you never cancel.
- **Good listings**: correct EAN, clear title, good images. See [OnBuy listing optimisation](/blog/onbuy-listing-optimisation).

## How SellSail handles the winning offer

SellSail asks OnBuy whether each listing is winning, every 10 to 30 minutes depending on your plan. When another seller is cheaper, it prices just under them, by an amount you choose, never below your floor and never more than your maximum undercut. When you're winning, it holds the price for a few hours, then tries your full price again. [See competition repricing](/features).`,
  },
  {
    slug: "onbuy-listing-optimisation",
    title: "OnBuy listing optimisation: how to make listings that sell",
    description:
      "How to optimise OnBuy listings: matching the right EAN, titles, images, details, dispatch times, pricing and stock, with a checklist for every listing.",
    keyword: "onbuy listing",
    secondary: ["onbuy listing optimisation", "onbuy product listing", "list products on onbuy"],
    category: "Selling on OnBuy",
    date: "2027-01-06",
    readingMinutes: 7,
    takeaways: [
      "Match products to the right catalogue page with the correct EAN.",
      "Clear titles, good images and complete details reduce returns and questions.",
      "Short, reliable dispatch times and accurate stock help you win sales.",
      "Use SKUs that identify the source, so pricing and stock can be automated.",
    ],
    faq: [
      {
        q: "How do I list a product on OnBuy?",
        a: "Find the product in OnBuy's catalogue, usually by EAN, and add your offer with price, stock, condition and SKU. If it isn't in the catalogue, you can usually create the product page.",
      },
      {
        q: "Do I need an EAN to sell on OnBuy?",
        a: "Most products are matched by EAN or another barcode. Check OnBuy's requirements for your category and for products without barcodes.",
      },
      {
        q: "How can I list many products at once?",
        a: "Use OnBuy's bulk upload tools or its API. Many sellers use software to create and update listings in bulk.",
      },
    ],
    related: ["how-to-sell-on-onbuy", "ean-asin-gtin", "sku-generator", "onbuy-buy-box"],
    md: `A well-optimised OnBuy listing is matched to the right product, easy to understand, competitively priced and always accurate on stock and dispatch. Here's how to get each part right, with a checklist at the end.

## 1. Match the right product (EAN)

Most OnBuy products are listed against an existing catalogue page, matched by barcode, usually the EAN. The wrong EAN means the wrong product page, and returns. Check the barcode on the actual product. See [EAN, ASIN and GTIN explained](/blog/ean-asin-gtin).

## 2. Write a clear title

When you create a product page, a good title has: brand, product type, key feature, size or quantity, and colour. Example: "Acme Stainless Steel Water Bottle 750ml, Black". Avoid all capitals and promotional words.

## 3. Use good images

- A clear main image on a plain background.
- Extra images showing size, use and details.
- Only images you're allowed to use.

## 4. Complete the details

Dimensions, materials, compatibility and what's in the box. Complete details reduce questions and returns.

## 5. Set dispatch times you can keep

Promise the time you can meet every time, not your best case. Late dispatch hurts your seller performance.

## 6. Price competitively, from cost

Every price should cover cost, OnBuy commission, VAT if registered, and profit. Then compete inside your floor. See [Winning on OnBuy](/blog/onbuy-buy-box).

## 7. Keep stock accurate

A listing that says "in stock" when you can't supply it leads to cancellations. Sync stock automatically. See [Stock sync for dropshippers](/blog/stock-sync-dropshipping).

## 8. Use meaningful SKUs

A SKU that contains the source ID, such as "AMZ-" plus the ASIN, lets tools price and stock each listing automatically. See [SKU generator](/blog/sku-generator).

## OnBuy listing checklist

| Check | Done? |
|---|---|
| Correct EAN, matched to the right product | |
| Clear title (if creating the product) | |
| Good, licensed images | |
| Complete details and dimensions | |
| Realistic dispatch time | |
| Price covers cost, fees, VAT and profit | |
| Stock synced automatically | |
| SKU identifies the source | |

[SellSail](/features) takes care of the last three for OnBuy sellers sourcing from Amazon UK.`,
  },
  {
    slug: "onbuy-api-keys",
    title: "OnBuy API keys: what they are and how to use them safely",
    description:
      "What OnBuy API keys are, what software can do with them, where to find them, and how to keep them safe when you connect repricing or listing tools to your OnBuy account.",
    keyword: "onbuy api",
    secondary: ["onbuy api keys", "onbuy seller api", "onbuy integration"],
    category: "Selling on OnBuy",
    date: "2027-01-08",
    readingMinutes: 6,
    takeaways: [
      "OnBuy API keys let approved software read and update your listings on your behalf.",
      "Keep keys private: anyone with them can change your prices and stock.",
      "Only connect tools that store keys encrypted and explain who can access them.",
      "Rotate keys if you stop using a tool or suspect they've been exposed.",
    ],
    faq: [
      {
        q: "Where do I find my OnBuy API keys?",
        a: "In your OnBuy seller account, in the API or integrations settings. Use live keys for live listings. Check OnBuy's help pages if you can't find them.",
      },
      {
        q: "Is it safe to give a tool my OnBuy API keys?",
        a: "It can be, if the tool encrypts keys, limits who can see them and logs access. Only give keys to tools you trust, and remove them when you stop using a tool.",
      },
      {
        q: "What can a tool do with my OnBuy API keys?",
        a: "Typically read your listings and orders, and update prices and stock. The exact access depends on OnBuy's API.",
      },
    ],
    related: ["how-to-sell-on-onbuy", "onbuy-seller-account", "ecommerce-automation-uk", "what-is-a-repricer"],
    md: `OnBuy API keys are credentials that let software connect to your OnBuy seller account and act on your behalf: reading your listings and updating prices and stock, for example. They're how repricers, listing tools and inventory systems work with OnBuy. Because they control your shop, they need to be handled carefully.

## What can software do with your OnBuy API keys?

Depending on OnBuy's API, tools can typically:

- read your listings and their current prices and stock;
- update prices and stock, often in large batches;
- check whether your listings are the winning offer;
- read orders.

## Where do you find your OnBuy API keys?

In your OnBuy seller account, look for the API or integrations settings. You'll usually see a consumer key and a secret key. Use your live keys for live listings. If you can't find them, check OnBuy's seller help pages.

## How do you keep your API keys safe?

| Do | Don't |
|---|---|
| Store them in a password manager | Paste them into emails or chats |
| Only enter them in tools you trust | Share them with people who don't need them |
| Check how a tool stores keys | Use tools that show keys back in plain text |
| Remove keys from tools you stop using | Leave old connections active |
| Rotate keys if you suspect exposure | Ignore unexpected price changes |

## What should you check before connecting a tool?

- **Encryption:** keys should be encrypted when stored.
- **Access:** who at the company can see them, and is access logged?
- **Disconnect:** can you remove the keys and connection in one click?
- **Safety limits:** does the tool have floors and checks so it can't set silly prices?

## How SellSail handles OnBuy API keys

SellSail encrypts OnBuy API keys (AES-256-GCM) before storing them and never shows them in your dashboard again after you save them. A small number of SellSail staff can view them to give support, and every view is logged. You can disconnect OnBuy at any time and the keys are deleted. You don't need Amazon API keys at all. More on our [security page](/security).

Related: [How to sell on OnBuy](/blog/how-to-sell-on-onbuy).`,
  },
];
