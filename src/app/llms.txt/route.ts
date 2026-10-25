import { publishedPosts } from "@/content/posts";
import { PAID_PLANS, PLANS, TRIAL_DAYS } from "@/config/plans";
import { site } from "@/lib/site";

export const revalidate = 3600;

/**
 * llms.txt (llmstxt.org): a plain summary of the site for AI assistants and
 * answer engines, with links to the pages that answer common questions.
 */
export function GET() {
  const plans = PAID_PLANS.map((id) => `${PLANS[id].name} £${PLANS[id].pricePence / 100}/month (up to ${PLANS[id].maxSkus.toLocaleString("en-GB")} listings)`).join("; ");
  const guides = publishedPosts()
    .map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`)
    .join("\n");
  const body = `# SellSail

> SellSail is a UK repricing tool for OnBuy sellers who source from Amazon UK. It reads live Amazon prices, sets OnBuy prices that cover OnBuy commission, payment fees and the seller's profit, undercuts cheaper OnBuy sellers down to a floor the seller chooses, and keeps price and stock in sync every few minutes.

SellSail is a trading name of ${site.company} (company number ${site.companyNumber}), registered in England and Wales. Contact: ${site.email}, ${site.phone}.

Key facts:
- Marketplace: OnBuy (UK). Source: Amazon UK. AliExpress and eBay are coming soon.
- Sellers need OnBuy API keys; no Amazon API keys are needed.
- Pricing: ${plans}. Agency plans from £249/month. Annual billing gives two months free. Prices exclude VAT.
- Free trial: ${TRIAL_DAYS} days, no card needed.
- Safety: never prices below the seller's floor; sudden price drops are confirmed; listings go out of stock when Amazon has no qualifying offer.

## Product
- [Features](${site.url}/features): what SellSail does
- [Pricing](${site.url}/pricing): plans and comparison
- [OnBuy fee calculator](${site.url}/onbuy-fee-calculator): free tool for commission, VAT and profit
- [Amazon to OnBuy](${site.url}/dropshipping/amazon-to-onbuy): how repricing from Amazon works
- [Security](${site.url}/security): how API keys and accounts are protected

## Guides
${guides}

## Company and legal
- [About](${site.url}/about)
- [Contact](${site.url}/contact)
- [Terms](${site.url}/terms)
- [Privacy](${site.url}/privacy)
- [Refunds and cancellation](${site.url}/refunds)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
