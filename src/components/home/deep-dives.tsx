import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BrowserFrame, CheckList, Eyebrow } from "@/components/sections";
import { portal } from "@/lib/site";

function Callout({ text, side }: { text: string; side: "left" | "right" }) {
  // Hand-drawn style note pointing at the app mock. Decorative only.
  return (
    <div
      aria-hidden="true"
      className={`absolute top-36 hidden flex-col xl:flex ${side === "left" ? "-left-28 items-end" : "-right-24 items-start"}`}
    >
      {side === "right" && (
        <svg width="80" height="46" viewBox="0 0 80 46" fill="none">
          <path className="draw-in" d="M76 40 C 56 10, 30 6, 6 18" stroke="#10231c" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 12 L6 18 L15 23" stroke="#10231c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="rounded-xl bg-ink px-3.5 py-2 text-[13px] font-bold text-white">{text}</span>
      {side === "left" && (
        <svg width="90" height="50" viewBox="0 0 90 50" fill="none">
          <path className="draw-in" d="M10 4 C 30 40, 60 44, 86 30" stroke="#10231c" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 24 L86 30 L77 35" stroke="#10231c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export function FloorsDive() {
  return (
    <div id="floors" className="flex flex-wrap items-center gap-8 rounded-[28px] bg-mint p-5 sm:gap-12 sm:rounded-[36px] sm:p-12">
      <div className="min-w-0 flex-[1_1_380px]">
        <Eyebrow>Fee-aware pricing</Eyebrow>
        <h3 className="mt-3 font-display text-[34px] leading-none sm:text-[44px] font-extrabold tracking-[-0.04em]">
          Know your real break-even on every listing
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-body">
          OnBuy takes its commission from the whole price. SellSail adds commission, payment fees and your profit on top
          of the Amazon cost, so every price pays for itself.
        </p>
        <CheckList
          items={[
            "Margin bands by Amazon price: profit %, minimum profit, fixed amount",
            "Commission and payment fees counted on every listing",
            "Prices move when Amazon's do, within minutes",
          ]}
        />
        <Link href={portal("/signup")} className={`${buttonVariants({ variant: "sea" })} mt-7`}>
          Start free trial <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="relative min-w-0 flex-[1_1_420px]">
        <BrowserFrame title="How a price is built">
          <div className="p-5">
            <div className="font-bold">
              Bamboo cutlery set <span className="text-[13px] font-medium text-muted">· example</span>
            </div>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2.5 text-[15px]">
              <dt className="text-muted">Amazon price</dt>
              <dd>£11.50</dd>
              <dt className="text-muted">Amazon delivery</dt>
              <dd>£2.40</dd>
              <dt className="text-muted">Your profit (25% band)</dt>
              <dd>£3.47</dd>
              <dt className="text-muted">OnBuy commission (15%)</dt>
              <dd>£3.07</dd>
              <dt className="border-t-2 border-dashed border-line-soft pt-2.5 font-bold">OnBuy price</dt>
              <dd className="border-t-2 border-dashed border-line-soft pt-2.5 font-display text-[22px] font-extrabold">£20.44</dd>
            </dl>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sun-soft p-3.5">
              <span className="font-semibold">Lowest it goes against a rival (£1 profit kept)</span>
              <span className="font-display text-[22px] font-extrabold">£17.53</span>
            </div>
          </div>
        </BrowserFrame>
        <Callout text="Every fee counted" side="left" />
      </div>
    </div>
  );
}

export function BuyBoxDive() {
  const rows: [string, string, string, "mint" | "sky" | "sun"][] = [
    ["Bamboo cutlery set", "£23.48", "Winning", "mint"],
    ["Yoga mat", "£24.99", "Winning", "mint"],
    ["Steel water bottle", "£19.99", "Repricing…", "sky"],
    ["LED desk lamp", "£24.73", "Held at floor", "sun"],
  ];
  return (
    <div id="buybox" className="flex flex-wrap-reverse items-center gap-8 rounded-[28px] bg-sun-soft p-5 sm:gap-12 sm:rounded-[36px] sm:p-12">
      <div className="relative min-w-0 flex-[1_1_420px]">
        <BrowserFrame
          title="Competition"
          right={
            <span className="inline-flex items-center gap-1.5 font-bold text-sea-dark">
              <span className="size-2 animate-pulse-soft rounded-full bg-sea" /> Watching
            </span>
          }
        >
          <ul className="px-3 pt-2 pb-3">
            {rows.map(([name, price, status, tone]) => (
              <li key={name} className="flex items-center justify-between gap-3 border-b border-[#f1f4f2] px-2 py-3 last:border-0">
                <span className="font-semibold">{name}</span>
                <span className="flex items-center gap-2.5">
                  <span className="font-bold">{price}</span>
                  <Badge variant={tone} size="sm">{status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </BrowserFrame>
        <Callout text="Won't go below cost" side="right" />
      </div>
      <div className="min-w-0 flex-[1_1_380px]">
        <Eyebrow className="text-[#6b5300]">Competition</Eyebrow>
        <h3 className="mt-3 font-display text-[34px] leading-none sm:text-[44px] font-extrabold tracking-[-0.04em]">
          Win the sales worth winning
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-sun-ink">
          SellSail asks OnBuy who is winning each listing. When another seller is cheaper, it prices just under them,
          never below the floor you set.
        </p>
        <CheckList
          items={[
            "Winning and losing listings at a glance",
            "Holds at your floor when a rival goes too low",
            "Tries your full price again when the rival is gone",
          ]}
        />
        <Link href={portal("/signup")} className={`${buttonVariants({ variant: "ink" })} mt-7`}>
          Start free trial <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function SyncDive() {
  return (
    <div id="sync" className="flex flex-wrap items-center gap-8 rounded-[28px] bg-ink p-5 sm:gap-12 sm:rounded-[36px] text-white sm:p-12">
      <div className="min-w-0 flex-[1_1_380px]">
        <Eyebrow className="text-sun">Stock sync and safety</Eyebrow>
        <h3 className="mt-3 font-display text-[34px] leading-none sm:text-[44px] font-extrabold tracking-[-0.04em]">
          Amazon changes. Your listings keep up.
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-[#c9ddd5]">
          SellSail keeps checking Amazon for every listing. Cost goes up, your price goes up. Amazon runs out, the listing
          goes out of stock. Something looks wrong, it checks again before OnBuy sees it.
        </p>
        <CheckList
          tone="sun"
          items={[
            "Prices and stock sent to OnBuy every few minutes",
            "Out of stock straight away when Amazon runs out",
            "Sudden price drops confirmed before they're used",
          ]}
        />
        <Link href={portal("/signup")} className={`${buttonVariants({ variant: "sun" })} mt-7`}>
          Start free trial <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="min-w-0 flex-[1_1_420px]">
        <BrowserFrame title="Activity" dark>
          <div className="p-4">
            <div className="mb-3 text-[13px] text-[#9fbdb1]">Latest sync · example</div>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              <li className="flex items-center gap-3 rounded-xl bg-[#13261e] p-3">
                <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-sun font-extrabold text-ink">↑</span>
                <span>Amazon cost +£1.20 on <strong>LED desk lamp</strong>. Price raised.</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-[#13261e] p-3">
                <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-coral font-extrabold text-[#9b3a1a]">‖</span>
                <span><strong>Kitchen scale</strong> out of stock on Amazon. Set to 0 on OnBuy.</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-[#13261e] p-3">
                <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-sea-mid font-extrabold">✓</span>
                <span><strong>Bamboo cutlery set</strong> repriced to £23.48. Now the cheapest.</span>
              </li>
            </ul>
          </div>
        </BrowserFrame>
      </div>
    </div>
  );
}
