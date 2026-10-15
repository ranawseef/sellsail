import { SectionHeading } from "@/components/sections";

// Example: £13.90 total supplier cost, 15% commission, 20% VAT.
// Matching a rival at £19.99 loses £0.24 a sale; the floor is £20.34.
export function Comparison() {
  return (
    <section aria-labelledby="compare-title" className="mx-auto max-w-[1200px] px-6 py-16">
      <SectionHeading
        title={
          <span id="compare-title">
            Most repricers race to the bottom. SellSail knows <span className="highlight px-1">where the bottom is</span>.
          </span>
        }
        intro="Same example product, same rival cutting to £19.99."
      />
      <div className="mt-11 grid gap-5 md:grid-cols-2">
        <div className="rounded-[28px] border border-line bg-white p-8">
          <div className="font-bold text-muted">A simple price-matching repricer</div>
          <div className="mt-6 flex h-36 items-end gap-4 border-b-2 border-[#c9d5d0] px-2" aria-hidden="true">
            <div className="bar-grow h-[92%] flex-1 rounded-t-xl bg-[#d5ddd9]" />
            <div className="bar-grow h-[80%] flex-1 rounded-t-xl bg-[#d5ddd9] [animation-delay:.15s]" />
            <div className="bar-grow h-[66%] flex-1 rounded-t-xl bg-[#9aaba4] [animation-delay:.3s]" />
          </div>
          <div className="flex gap-4 px-2 pt-2 text-sm text-muted">
            <span className="flex-1">£24.99</span><span className="flex-1">£22.49</span><span className="flex-1">£19.99</span>
          </div>
          <p className="mt-6 font-display text-[32px] font-extrabold tracking-[-0.03em] text-[#9b1c1c]">−£0.24 every sale</p>
          <p className="mt-1.5 leading-relaxed text-muted">It follows the rival down and sells below cost once fees are counted.</p>
        </div>
        <div className="rounded-[28px] bg-ink p-8 text-white">
          <div className="font-bold text-sun">SellSail</div>
          <div className="relative mt-6 flex h-36 items-end gap-4 border-b-2 border-[#3a5248] px-2" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-[68%] border-t-2 border-dashed border-sun" />
            <span className="absolute right-0 bottom-[calc(68%+6px)] text-[13px] font-semibold text-sun">floor £20.34</span>
            <div className="bar-grow h-[92%] flex-1 rounded-t-xl bg-sea-mid" />
            <div className="bar-grow h-[80%] flex-1 rounded-t-xl bg-sea-mid [animation-delay:.15s]" />
            <div className="bar-grow h-[68%] flex-1 rounded-t-xl bg-sea [animation-delay:.3s]" />
          </div>
          <div className="flex gap-4 px-2 pt-2 text-sm text-[#b9d3c9]">
            <span className="flex-1">£24.99</span><span className="flex-1">£22.49</span><span className="flex-1">£20.34</span>
          </div>
          <p className="mt-6 font-display text-[32px] font-extrabold tracking-[-0.03em]">Never below break-even</p>
          <p className="mt-1.5 leading-relaxed text-[#c9ddd5]">It holds at your floor and wins the Buy Box back when the rival recovers.</p>
        </div>
      </div>
    </section>
  );
}
