import Link from "next/link";
import { CATEGORY_RATES, RATES_SOURCE, formatRate } from "@/lib/calc";
import { type Post } from "./types";

function Body() {
  return (
    <>
      <p>
        You list a product on OnBuy at £24.99, it sells, and the money lands in your account. But it isn&apos;t £24.99.
        By the time OnBuy takes commission and you set aside VAT, a good chunk has gone. If you don&apos;t know exactly
        how much, you can&apos;t price with confidence.
      </p>
      <p>This guide walks through every fee on a typical OnBuy sale, with a worked example you can copy.</p>

      <h2 id="commission">1. OnBuy commission: the main fee</h2>
      <p>
        OnBuy charges a commission on every sale. The rate depends on the product&apos;s category. Most categories sit at
        15%, but some are lower and one is higher. A few examples:
      </p>
      <ul>
        {CATEGORY_RATES.filter((c) =>
          ["Consumer Electronics", "Health & Beauty", "DIY & Tools", "Jewellery", "Everything else / standard"].includes(c.label),
        ).map((c) => (
          <li key={c.label}>
            <strong>{c.label}:</strong> {formatRate(c.bps)}
          </li>
        ))}
      </ul>
      <p>
        You&apos;ll find every category in the table on our <Link href="/onbuy-fee-calculator">OnBuy fee calculator</Link>{" "}
        page. Those figures come from {RATES_SOURCE}. Rates do change, and a few categories drop to a lower rate above a
        certain price, so always check the rate shown in your own OnBuy seller account.
      </p>

      <h3>What the commission is charged on</h3>
      <p>
        This is the part most new sellers get wrong. Commission isn&apos;t worked out on your price before VAT. It&apos;s
        charged on the <strong>delivered total the buyer pays</strong>: the item price including VAT, plus any delivery
        charge.
      </p>
      <p>
        So if you sell an item at £24.99 and charge £2.99 delivery, a 15% commission is taken from £27.98, not £24.99.
        That&apos;s about £4.20 rather than £3.75.
      </p>

      <h3>The minimum fee</h3>
      <p>
        There&apos;s also a minimum commission of £0.25 per sale. It only matters for very cheap items: at 15%, anything
        selling for less than about £1.67 hits the minimum.
      </p>

      <h2 id="vat">2. VAT: money that was never yours</h2>
      <p>
        If your business is VAT-registered, the price a buyer pays on OnBuy includes VAT. At the standard 20% rate, that
        means one-sixth of a VAT-inclusive price belongs to HMRC. On a £24.99 sale, that&apos;s £4.17.
      </p>
      <p>
        If you&apos;re not VAT-registered, you don&apos;t charge VAT on your sales, but you also can&apos;t reclaim VAT on
        what you buy. Either way, VAT rules can get complicated quickly, especially for imported goods, so it&apos;s worth
        a conversation with an accountant before you scale up.
      </p>

      <h2 id="other-costs">3. The costs that aren&apos;t on OnBuy&apos;s invoice</h2>
      <p>OnBuy&apos;s fees are only part of the picture. To know your real profit, you also need to count:</p>
      <ul>
        <li><strong>The product cost</strong> you pay your supplier.</li>
        <li><strong>Supplier delivery</strong>, if they charge to ship to your customer.</li>
        <li><strong>Packaging</strong>, if you ship anything yourself.</li>
        <li><strong>Payment or other fees</strong> from any tools or services you use.</li>
        <li>
          <strong>Your OnBuy subscription</strong>, a monthly cost charged separately. Spread it across your sales when
          you plan margins.
        </li>
      </ul>

      <h2 id="example">4. A worked example</h2>
      <p>Let&apos;s put it together for a VAT-registered seller in a 15% category:</p>
      <ul>
        <li>Selling price (including VAT): <strong>£24.99</strong>, free delivery</li>
        <li>VAT (one-sixth): <strong>£4.17</strong>, leaving £20.82</li>
        <li>OnBuy commission (15% of £24.99): <strong>£3.75</strong></li>
        <li>Supplier cost: <strong>£11.50</strong> plus <strong>£2.40</strong> delivery</li>
        <li>
          Profit: £20.82 − £3.75 − £13.90 = <strong>£3.17</strong>, a margin of about 15%
        </li>
      </ul>
      <p>
        A sale that looks like £24.99 earns you £3.17. That&apos;s not a bad result, but it shows how little room there
        is. Drop the price to £19.99 to chase a competitor and you&apos;d lose 24p on every sale.
      </p>

      <h2 id="break-even">5. Find your break-even price</h2>
      <p>
        Your break-even price is the lowest price where profit is zero. For the example above, it&apos;s £20.34. Any lower
        and every sale costs you money.
      </p>
      <p>
        Knowing this number for every listing is the single best protection you have. It tells you how low you can safely
        go when you compete for the Buy Box, and when to walk away instead. Our{" "}
        <Link href="/onbuy-fee-calculator">free calculator</Link> works it out for you.
      </p>

      <h2 id="summary">Quick summary</h2>
      <ul>
        <li>Commission depends on category, mostly 15%, and is charged on the full amount the buyer pays.</li>
        <li>There&apos;s a £0.25 minimum commission per sale.</li>
        <li>If you&apos;re VAT-registered, one-sixth of a standard-rate price is VAT.</li>
        <li>Count supplier cost, delivery, packaging and your subscription too.</li>
        <li>Work out a break-even price for every product and never price below it.</li>
      </ul>
    </>
  );
}

export const onbuyFeesExplained: Post = {
  slug: "onbuy-fees-explained",
  title: "OnBuy fees explained: commission, VAT and what you really keep",
  description:
    "A plain-English guide to OnBuy seller fees in 2026: commission by category, the £0.25 minimum, VAT, and a worked example showing your real profit.",
  keyword: "OnBuy fees",
  category: "Fees and profit",
  date: "2026-10-16",
  readingMinutes: 6,
  cover: { src: "photo-1768839720849-fef976b3ffff", alt: "A teal calculator and a white pen on a white desk" },
  Body,
};
