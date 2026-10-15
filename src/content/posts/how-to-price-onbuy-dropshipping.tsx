import Link from "next/link";
import { type Post } from "./types";

function Body() {
  return (
    <>
      <p>
        Dropshipping on OnBuy looks simple on paper: find a product, list it a bit above what your supplier charges, and
        keep the difference. In practice, fees, VAT and moving supplier prices eat that difference fast. Price a product
        on gut feel and you can be busy and broke at the same time.
      </p>
      <p>
        Here&apos;s a pricing method that holds up. It uses three numbers for every listing: a <strong>floor</strong>, a{" "}
        <strong>target price</strong> and a <strong>ceiling</strong>.
      </p>

      <h2 id="floor">Step 1: set a floor (your break-even price)</h2>
      <p>
        Your floor is the lowest price where you still make £0 after every cost. Below it, each sale loses money. To work
        it out you need:
      </p>
      <ul>
        <li>what your supplier charges for the item, plus their delivery charge</li>
        <li>the OnBuy commission rate for your category</li>
        <li>VAT, if you&apos;re VAT-registered</li>
      </ul>
      <p>
        Remember that OnBuy takes commission on the total the buyer pays, VAT and delivery included. That&apos;s why a
        simple &quot;cost plus 15%&quot; sum gives the wrong answer.
      </p>
      <p>
        <strong>Example:</strong> a product costs £11.50 with £2.40 supplier delivery, in a 15% category, for a
        VAT-registered seller. The floor is <strong>£20.34</strong>. At that price, VAT is £3.39 and commission is £3.05,
        which together with the £13.90 cost uses up every penny.
      </p>

      <h2 id="target">Step 2: set a target price for your margin</h2>
      <p>
        Break-even keeps you safe but doesn&apos;t pay the bills. Decide on a target margin, the share of each sale (after
        VAT) you want to keep as profit. Many small sellers aim somewhere between 10% and 25%, depending on the category
        and how competitive it is.
      </p>
      <p>
        For the same product, a 15% margin needs a price of <strong>£24.91</strong>. That leaves £3.12 profit on each
        sale. Our <Link href="/onbuy-fee-calculator">OnBuy fee calculator</Link> shows your margin at any price, so you
        can test a few before you list.
      </p>

      <h2 id="ceiling">Step 3: set a ceiling</h2>
      <p>
        A ceiling stops your price drifting too high when competitors disappear, which can make you look out of touch
        when they come back. A sensible ceiling is often a little above the typical price for that product on OnBuy.
      </p>

      <h2 id="buy-box">Step 4: compete for the Buy Box, inside your limits</h2>
      <p>
        When several sellers offer the same product, price is a big part of who wins the sale. It&apos;s tempting to match
        whoever is cheapest. Don&apos;t, unless their price is above your floor.
      </p>
      <p>
        In our example, matching a rival at £19.99 would lose about <strong>24p per sale</strong>. Holding at £20.34 means
        you might lose that sale, but you won&apos;t lose money. Rivals who sell below cost rarely stay there for long.
      </p>

      <h2 id="supplier-changes">Step 5: keep up with supplier changes</h2>
      <p>
        Dropshipping has a catch: your costs aren&apos;t fixed. Your Amazon or AliExpress supplier can change their price,
        add a delivery charge or run out of stock, and your OnBuy listing won&apos;t know.
      </p>
      <ul>
        <li>Recalculate your floor whenever the supplier&apos;s price or delivery cost changes.</li>
        <li>Pause listings as soon as the supplier is out of stock, so you don&apos;t sell something you can&apos;t send.</li>
        <li>Check prices often. The more listings you have, the harder this is to do by hand.</li>
      </ul>
      <p>
        This is the work <Link href="/features">SellSail</Link> is built to automate: it rebuilds each floor when the
        supplier changes and only reprices inside your limits.
      </p>

      <h2 id="mistakes">Common pricing mistakes</h2>
      <ul>
        <li><strong>Working out commission on the price before VAT.</strong> It&apos;s charged on the full amount.</li>
        <li><strong>Forgetting the supplier&apos;s delivery charge.</strong> It&apos;s part of your cost.</li>
        <li><strong>Matching every competitor.</strong> Some of them are selling at a loss.</li>
        <li><strong>Setting prices once and forgetting them.</strong> Supplier prices move.</li>
        <li><strong>Ignoring returns.</strong> Leave room in your margin for the occasional refund.</li>
      </ul>

      <h2 id="checklist">Pricing checklist</h2>
      <ol>
        <li>Note supplier cost and delivery.</li>
        <li>Check the OnBuy commission rate for the category.</li>
        <li>Work out your floor (break-even price).</li>
        <li>Pick a target margin and find the price that hits it.</li>
        <li>Set a ceiling.</li>
        <li>Recheck whenever your supplier changes anything.</li>
      </ol>
    </>
  );
}

export const howToPriceOnbuyDropshipping: Post = {
  slug: "how-to-price-onbuy-dropshipping",
  title: "How to price products for OnBuy dropshipping without selling at a loss",
  description:
    "A step-by-step method for pricing dropshipped products on OnBuy: work out your floor, target margin and ceiling, and compete for the Buy Box without losing money.",
  keyword: "OnBuy dropshipping pricing",
  category: "Pricing",
  date: "2026-10-16",
  readingMinutes: 7,
  cover: { src: "photo-1707157284454-553ef0a4ed0d", alt: "An office desk with a smartphone and printed financial charts" },
  Body,
};
