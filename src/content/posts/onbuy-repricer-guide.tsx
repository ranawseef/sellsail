import Link from "next/link";
import { type Post } from "./types";

function Body() {
  return (
    <>
      <p>
        An OnBuy repricer is software that changes your OnBuy prices for you, automatically and around the clock. Done
        well, it keeps you competitive without you watching every listing. Done badly, it chases rivals down until you
        are selling at a loss. This guide explains how repricers work, what to look for, and the mistakes that cost
        sellers money.
      </p>

      <h2 id="what">What an OnBuy repricer does</h2>
      <p>Every repricer runs the same loop, again and again:</p>
      <ol>
        <li>
          <strong>Read the inputs:</strong> your cost for each item and what other OnBuy sellers are charging.
        </li>
        <li>
          <strong>Decide a price:</strong> apply your rules, for example &quot;5p under the cheapest seller, but never
          below my floor&quot;.
        </li>
        <li>
          <strong>Send it to OnBuy</strong> through OnBuy&apos;s seller API, and check it was accepted.
        </li>
      </ol>
      <p>The differences between repricers are in how good each of those three steps is.</p>

      <h2 id="floor">The most important feature: a real floor</h2>
      <p>
        A floor is the lowest price a listing may ever go to. Most repricers ask you to type a fixed minimum price for
        each product. That works until your supplier&apos;s price changes: the minimum you typed last month is now below
        your break-even, and the repricer happily follows a rival into a loss.
      </p>
      <p>
        A better approach builds the floor from live numbers: your current supplier cost, the OnBuy commission and
        payment fees, and the minimum profit you want. When the cost moves, the floor moves with it. That is the single
        biggest difference between a repricer that protects you and one that just matches prices.
      </p>

      <h2 id="checklist">What to look for</h2>
      <ul>
        <li>
          <strong>Fee-aware prices.</strong> OnBuy takes commission from the whole sale price, so the repricer must add
          fees on top of your cost, not take them out of your margin.
        </li>
        <li>
          <strong>Live costs.</strong> If you dropship, the repricer should read your supplier&apos;s current price, not
          rely on a number you typed in.
        </li>
        <li>
          <strong>Stock protection.</strong> When your supplier runs out, your OnBuy listing should go out of stock
          straight away, so you never sell something you can&apos;t send.
        </li>
        <li>
          <strong>Safety brakes.</strong> A supplier glitch that shows a £50 item at £5 should be checked again, not
          pushed live to OnBuy.
        </li>
        <li>
          <strong>Sensible competition.</strong> Undercutting a rival by a few pence is enough. Undercutting by pounds
          just gives margin away.
        </li>
        <li>
          <strong>A clear history.</strong> You should be able to see what price changed, when and why.
        </li>
        <li>
          <strong>Speed.</strong> Prices that reach OnBuy within minutes, not once a day.
        </li>
      </ul>

      <h2 id="mistakes">Common repricing mistakes</h2>
      <h3>Racing to the bottom</h3>
      <p>
        Two price-matching repricers facing each other will keep cutting until one of them hits its minimum. If that
        minimum is wrong, both sellers lose money on every sale. Always price against a floor that covers your real
        costs.
      </p>
      <h3>Forgetting the fees</h3>
      <p>
        A price that looks like a 20% margin can be close to zero once commission and payment fees are taken. Work out
        your numbers with our <Link href="/onbuy-fee-calculator">OnBuy fee calculator</Link> before you set any rules.
      </p>
      <h3>Never raising prices again</h3>
      <p>
        When a cheaper rival sells out or leaves, your price should go back up. A repricer that only ever moves down
        leaves money on the table.
      </p>

      <h2 id="sellsail">How SellSail does it</h2>
      <p>
        SellSail is built for sellers who source from Amazon UK. It reads the current Amazon price for every listing,
        sets an OnBuy price that covers commission, payment fees and your profit, and checks who is winning each listing
        on OnBuy. When a rival is cheaper, it prices just under them, never below the floor you choose, and tries your
        full price again once the rival has gone. Stock follows Amazon, and sudden price drops are confirmed before they
        are used.
      </p>
      <p>
        You can try it free for 14 days, no card needed: <Link href="/signup">start your free trial</Link>, or see{" "}
        <Link href="/features">all features</Link>.
      </p>
    </>
  );
}

export const onbuyRepricerGuide: Post = {
  slug: "onbuy-repricer-guide",
  title: "OnBuy repricer guide: how repricing works and what to look for",
  description:
    "What an OnBuy repricer does, why a fee-aware floor matters more than anything else, what to look for when choosing one, and the mistakes that make sellers lose money.",
  keyword: "OnBuy repricer",
  category: "Repricing",
  date: "2026-10-26",
  readingMinutes: 6,
  cover: { src: "photo-1707157284454-553ef0a4ed0d", alt: "An office desk with a smartphone and printed financial charts" },
  Body,
};
