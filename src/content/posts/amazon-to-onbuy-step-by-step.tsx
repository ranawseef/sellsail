import Link from "next/link";
import { type Post } from "./types";
import { portal } from "@/lib/site";

function Body() {
  return (
    <>
      <p>
        Selling Amazon-sourced products on OnBuy lets you reach a growing UK marketplace without holding stock. The
        catch is that Amazon prices move all the time, and OnBuy charges commission on every sale. This step-by-step
        guide shows how to set it up so every sale still makes money.
      </p>
      <p>
        <strong>First, check the rules.</strong> Marketplace and supplier policies on dropshipping change. Read
        OnBuy&apos;s seller policies and Amazon&apos;s conditions of use before you start, and make sure you can meet
        OnBuy&apos;s dispatch times. You are the seller of record, so returns and customer service are yours.
      </p>

      <h2 id="step-1">Step 1: choose products that can carry the fees</h2>
      <p>
        Look for items where the OnBuy selling price leaves room above the Amazon price once commission and payment
        fees are paid. Cheap items under about £10 are hard: a minimum profit of £2 to £3 is a big share of the price.
        Items Amazon fulfils and delivers within a day or two are the safest, because you can promise a short dispatch
        time.
      </p>

      <h2 id="step-2">Step 2: work out your price for each item</h2>
      <p>For every listing you need three numbers:</p>
      <ul>
        <li>
          <strong>Your cost:</strong> the Amazon price, delivery included.
        </li>
        <li>
          <strong>Your profit:</strong> a percentage, with a minimum in pounds for cheaper items.
        </li>
        <li>
          <strong>The fees:</strong> OnBuy commission and payment fees, taken from the whole selling price.
        </li>
      </ul>
      <p>
        Because the fees come out of the selling price, add your cost and profit and then divide by what&apos;s left
        after fees. With 15% commission, an item that costs £13.90 with a £3.47 profit sells at (13.90 + 3.47) ÷ 0.85 =
        £20.44. Try your own numbers in the <Link href="/onbuy-fee-calculator">OnBuy fee calculator</Link>.
      </p>

      <h2 id="step-3">Step 3: list on OnBuy with matching SKUs</h2>
      <p>
        Give each OnBuy listing a SKU that includes the Amazon ASIN, for example <code>AMZ-B0XXXXXXXX</code>. That way
        your repricer always knows which Amazon product a listing comes from, even with thousands of listings.
      </p>

      <h2 id="step-4">Step 4: keep prices and stock in step with Amazon</h2>
      <p>This is where most sellers come unstuck. By hand, you would need to:</p>
      <ul>
        <li>check every Amazon price several times a day and re-price on OnBuy when it moves</li>
        <li>set a listing to out of stock the moment Amazon runs out</li>
        <li>watch for cheaper OnBuy sellers without dropping below your break-even</li>
      </ul>
      <p>
        That&apos;s impossible at any real scale, so automate it. SellSail does all three: it reads the Amazon UK
        price for every ASIN (no Amazon account or keys needed), sets your OnBuy price with fees and profit built in,
        undercuts cheaper sellers down to your floor, and sends changes to OnBuy every few minutes.
      </p>

      <h2 id="step-5">Step 5: fulfil orders fast</h2>
      <p>
        When an OnBuy order arrives, buy the item on Amazon with the customer&apos;s delivery address and mark the
        OnBuy order as dispatched with the tracking number. Fast, reliable dispatch protects your OnBuy account health,
        which matters more than any single sale.
      </p>

      <h2 id="summary">In short</h2>
      <ol>
        <li>Pick products with room for fees.</li>
        <li>Price from cost plus profit, divided by what&apos;s left after fees.</li>
        <li>Use SKUs that carry the ASIN.</li>
        <li>Automate price, stock and competition.</li>
        <li>Dispatch quickly.</li>
      </ol>
      <p>
        Ready to automate it? <Link href={portal("/signup")}>Start a 14-day free trial</Link> of SellSail. No card needed.
      </p>
    </>
  );
}

export const amazonToOnbuyStepByStep: Post = {
  slug: "amazon-to-onbuy-dropshipping-step-by-step",
  title: "Amazon to OnBuy dropshipping: a step-by-step guide for UK sellers",
  description:
    "How to dropship Amazon products on OnBuy profitably: choosing products, pricing with OnBuy fees, SKUs that carry the ASIN, keeping price and stock in sync, and fast fulfilment.",
  keyword: "Amazon to OnBuy dropshipping",
  category: "Dropshipping",
  date: "2026-10-26",
  readingMinutes: 7,
  cover: { src: "photo-1580674285054-bed31e145f59", alt: "A stack of cardboard shipping boxes in the back of a delivery van" },
  Body,
};
