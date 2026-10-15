import Link from "next/link";
import { type Post } from "./types";

function Body() {
  return (
    <>
      <p>
        Plenty of UK sellers find products on Amazon or AliExpress and sell them on OnBuy. It can work, but it&apos;s
        also where new sellers get caught out, by marketplace rules, slow deliveries or margins that vanish once fees are
        counted. Before you list a single product, run through these checks.
      </p>
      <p>
        <em>
          This is general guidance, not legal advice. Marketplace policies change, so always read the current rules
          yourself.
        </em>
      </p>

      <h2 id="rules">1. Read the rules on every side</h2>
      <p>Dropshipping involves at least two companies&apos; rules: the marketplace you sell on and the one you buy from.</p>
      <ul>
        <li>
          <strong>OnBuy:</strong> read OnBuy&apos;s seller terms and policies on dropshipping, dispatch times and
          tracking. If anything is unclear, ask OnBuy&apos;s seller support in writing before you start.
        </li>
        <li>
          <strong>Amazon:</strong> Amazon has a dropshipping policy for sellers on its own marketplace, and other
          marketplaces such as eBay restrict buying from another retailer to ship straight to your customer. Read
          Amazon&apos;s conditions of use and check how they apply to the way you plan to buy.
        </li>
        <li>
          <strong>AliExpress:</strong> check the terms for buyers and any reseller or business purchasing options your
          supplier offers.
        </li>
      </ul>
      <p>
        Whatever the setup, you are the <strong>seller of record</strong>. That means the buyer&apos;s contract is with
        you, and so is the responsibility for delivery, returns and refunds.
      </p>

      <h2 id="delivery">2. Promise delivery times you can keep</h2>
      <p>
        This is the biggest practical difference between the two sources. Many Amazon products reach UK customers quickly,
        while AliExpress orders often take much longer, especially from overseas warehouses.
      </p>
      <ul>
        <li>Set your OnBuy dispatch and delivery times to match the slowest realistic case, not the best one.</li>
        <li>Prefer AliExpress sellers that ship from UK or European warehouses when speed matters.</li>
        <li>Make sure every order has tracking you can pass to OnBuy.</li>
      </ul>
      <p>Late dispatch and missing tracking hurt your account, so it&apos;s better to promise less and deliver early.</p>

      <h2 id="margins">3. Check the margin after every fee</h2>
      <p>
        Amazon and AliExpress prices can look cheap until you add OnBuy commission (often 15%, charged on the full price
        including VAT and delivery), VAT if you&apos;re registered, and your supplier&apos;s delivery charge. Work out a
        break-even price for each product before you list it.
      </p>
      <p>
        Our <Link href="/blog/onbuy-fees-explained">guide to OnBuy fees</Link> explains the maths, and the{" "}
        <Link href="/onbuy-fee-calculator">free calculator</Link> does it for you.
      </p>

      <h2 id="stock">4. Plan for price and stock changes</h2>
      <p>
        Your supplier doesn&apos;t know or care about your OnBuy listing. Prices go up, delivery charges appear and items
        sell out. If your listing doesn&apos;t keep up, you&apos;ll either sell at a loss or sell something you can&apos;t
        send.
      </p>
      <ul>
        <li>Check supplier prices and stock regularly, more often for fast-moving products.</li>
        <li>Raise your price, or pause the listing, when the supplier&apos;s cost goes up.</li>
        <li>Pause straight away when the supplier is out of stock.</li>
      </ul>
      <p>
        Doing this by hand works for a handful of products. Beyond that, it&apos;s what tools like{" "}
        <Link href="/dropshipping">SellSail</Link> automate.
      </p>

      <h2 id="customers">5. Look after the customer experience</h2>
      <ul>
        <li>
          <strong>Packaging and paperwork:</strong> customers can be confused when a parcel arrives with another
          retailer&apos;s branding or invoice. Check what your supplier includes.
        </li>
        <li>
          <strong>Returns:</strong> UK buyers generally have a legal right to cancel most online orders within 14 days.
          Know how you&apos;ll handle a return when the item came from a supplier abroad.
        </li>
        <li>
          <strong>Product safety:</strong> you&apos;re responsible for what you sell. Avoid products without proper
          safety marking or labelling, especially electricals, cosmetics and children&apos;s items.
        </li>
      </ul>

      <h2 id="tax">6. Get the tax side right</h2>
      <p>
        VAT on imported goods, VAT registration thresholds and record-keeping all affect your real margin. Rules differ
        depending on where goods ship from and how you&apos;re set up, so speak to an accountant who knows ecommerce before
        you scale.
      </p>

      <h2 id="checklist">Before-you-start checklist</h2>
      <ol>
        <li>Read OnBuy&apos;s seller policies and your supplier&apos;s terms.</li>
        <li>Choose suppliers that offer tracking and realistic UK delivery times.</li>
        <li>Work out a break-even price and target price for every product.</li>
        <li>Set dispatch times you can always meet.</li>
        <li>Have a plan for price changes, stock-outs and returns.</li>
        <li>Talk to an accountant about VAT.</li>
      </ol>
    </>
  );
}

export const amazonAliexpressToOnbuy: Post = {
  slug: "amazon-aliexpress-to-onbuy-dropshipping",
  title: "Dropshipping from Amazon and AliExpress to OnBuy: what to check first",
  description:
    "Thinking of dropshipping Amazon or AliExpress products on OnBuy? Check the marketplace rules, delivery times, margins, stock and returns before you list.",
  keyword: "OnBuy dropshipping",
  category: "Dropshipping",
  date: "2026-10-16",
  readingMinutes: 7,
  cover: { src: "photo-1580674285054-bed31e145f59", alt: "A stack of cardboard shipping boxes in the back of a delivery van" },
  Body,
};
