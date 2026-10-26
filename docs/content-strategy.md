# SellSail content strategy (UK)

Keyword data: Google Keyword Planner, location United Kingdom, Google search,
Oct 2025 – Sep 2026, pulled 26 Oct 2026. Volumes are Keyword Planner's ranges
(the Ads account runs no campaigns, so exact numbers aren't shown).

## Audience

UK online sellers, mostly small businesses and side hustles:
- OnBuy sellers who want more sales without selling at a loss
- Dropshippers (Amazon → OnBuy today; AliExpress next) looking for margin and automation
- Amazon/eBay sellers considering OnBuy as a second channel

Buying stage: from "what is dropshipping" (awareness) to "best onbuy repricer" (decision).

## What the data says

| Keyword | UK monthly searches | Competition | Intent |
|---|---|---|---|
| onbuy | 100K – 1M | High | Navigational (brand) |
| onbuy uk | 10K – 100K | High | Navigational |
| dropshipping uk / dropshipping united kingdom | 1K – 10K | High | Informational |
| dropshipping suppliers uk / uk dropshipping suppliers | 1K – 10K | High | Commercial |
| dropshipping distributors uk / drop shipping manufacturers uk | 1K – 10K | High | Commercial |
| cj dropshipping uk | 1K – 10K | Medium | Navigational/commercial |
| is onbuy legit / onbuy trustpilot | 1K – 10K | Medium/Low | Commercial (trust) |
| amazon dropshipping | 1K – 10K | Medium | Informational |
| what is dropshipping | 1K – 10K | Low | Informational |
| margin vs markup | 1K – 10K | Low | Informational |
| profit margin calculator | 1K – 10K | Low | Tool |
| dynamic pricing | 1K – 10K | Low | Informational |
| price war | 1K – 10K | Low | Informational |
| what is an asin | 1K – 10K | Low | Informational |
| sku meaning | 1K – 10K | Low | Informational |
| repricer | 100 – 1K | Medium | Commercial |
| retail arbitrage uk / sell online uk | 100 – 1K | Low/High | Informational |
| sku generator / break even calculator | 100 – 1K | Medium/Low | Tool |
| psychological pricing / floor price | 100 – 1K | Low/High | Informational |
| competitor price monitoring | 100 – 1K | Low | Commercial |
| onbuy seller / onbuy seller account / onbuy returns | 100 – 1K | Low/Medium | Informational |
| aliexpress dropshipping uk / ebay dropshipping uk / shopify dropshipping uk | 100 – 1K | High | Informational |
| best dropshipping suppliers uk / uk based dropshipping suppliers | 100 – 1K | High | Commercial |
| how to sell on onbuy, onbuy fees, onbuy commission, onbuy api, onbuy vs amazon, onbuy vs ebay, onbuy listing, repricing software, inventory sync | 10 – 100 | Low/Medium | Mixed |
| onbuy repricer, best onbuy repricer, onbuy buy box, onbuy bulk upload | no data (< 10) | – | Commercial |

Takeaways:
1. OnBuy-specific seller queries are small (10–100 each) but almost uncontested and
   high-intent: a cluster of them builds topical authority and converts.
2. The traffic is in broad dropshipping and pricing definitions (1K–10K). We win those
   with the best, clearest answer plus a UK angle, then link to the OnBuy cluster.
3. "Is OnBuy legit" (1K–10K) is mostly buyers, but a seller-side review captures the
   sellers among them.
4. Brand terms ("onbuy", "onbuy uk") are OnBuy's own; we don't target them.

## Pillars and clusters

1. **Selling on OnBuy** (pillar: How to sell on OnBuy) → seller account, is OnBuy legit,
   listing optimisation, buy box, returns, API keys, vs Amazon, vs eBay, grow sales,
   UK marketplaces, multichannel, sell online UK.
2. **Dropshipping UK** (pillar: Dropshipping in the UK) → what is dropshipping, suppliers,
   Amazon dropshipping, AliExpress, eBay, Shopify, legal, VAT and tax, margins, mistakes,
   products, starting a business, customer service, retail and online arbitrage.
3. **Pricing and profit** (pillar: existing OnBuy fees guide) → margin vs markup, profit
   margin formula, break-even, psychological pricing, how to price products, hidden costs,
   MAP and UK law, dynamic pricing, price war.
4. **Repricing** (pillar: existing OnBuy repricer guide) → what is a repricer, floor price,
   competitor price monitoring, repricing strategies, automated vs manual, stock sync,
   ecommerce automation.
5. **Seller reference** (glossary hub) → what is an ASIN, SKU meaning, SKU generator,
   EAN/GTIN/ASIN, ecommerce glossary.

## Publishing calendar

The first five guides are live. Every other guide goes out three a day (07:00, 12:00, 17:00 UTC)
from 26 Oct 2026 to 13 Nov 2026; the schedule is computed in src/content/posts/index.ts.
Posts appear on their slot automatically (`isPublished`), so the cadence needs no manual work.

The full list, with keyword, volume tier, intent and date, is in
`src/content/posts/md/*.ts` (each post's `keyword`, `secondary` and `date`).

## On-page standard (every post)

- Title ≤ 65 characters with the keyword first or early; description 140–160 characters.
- Answer-first opening: a 40–60 word direct answer (what Google and AI assistants quote).
- Key takeaways box, table of contents, question-style H2s, at least one table or list.
- 3–4 FAQs, published as FAQPage structured data.
- BlogPosting + BreadcrumbList structured data, en-GB, publisher = VIVIDDEALS LTD.
- 3+ internal links: to the pillar, to sibling posts, and to a product page or the fee
  calculator. Related posts at the end.
- Facts we can't verify (OnBuy's exact fees and rules) are described generally, with a
  pointer to OnBuy's current terms. No invented statistics.

## AI search (GEO)

- /llms.txt lists the product facts and every guide with a one-line summary.
- Key takeaways and FAQs give assistants short, quotable answers.
- Organization schema (legal name, number, address, contact) and consistent facts
  across pages make the brand an unambiguous entity.
- RSS feed at /blog/feed.xml for discovery.

## Measure

- Google Search Console: impressions and clicks per post; queries per cluster.
- Targets for month 3: 50 posts indexed; 30+ ranking top 20; OnBuy cluster in top 5.
- Refresh posts that rank 8–20 after 8 weeks (update `updated`, expand, add FAQs).
- Re-pull Keyword Planner quarterly and add posts where new queries appear.

## Off-page (not in code)

- Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- Get listed on UK ecommerce tool directories and OnBuy seller communities.
- Pitch the fee calculator and margin guides to UK seller blogs and podcasts for links.
