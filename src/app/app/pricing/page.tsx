import type { Metadata } from "next";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { BandsEditor, RepricerSettingsForm } from "@/components/app/pricing-forms";
import { requireAuth } from "@/server/auth/context";
import { getBands, getSettings } from "@/server/repos/pricing";
import { formatGBP } from "@/lib/format";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const auth = await requireAuth();
  const [bands, settings] = await Promise.all([getBands(auth.tenantId), getSettings(auth.tenantId)]);
  const canEdit = auth.role !== "member";

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Margins and fees"
        intro="SellSail prices each listing from the Amazon price you'd pay. Saving here re-prices your listings straight away from the Amazon prices already read, without waiting for Amazon."
      />

      <Rise>
        <SectionCard
          title="How a price is worked out"
          intro="The same sum runs in the repricer and in the preview below."
        >
          <ol className="grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["1", "Find the band", "The band whose limit is at or above the Amazon price (shipping included)."],
              ["2", "Add the profit", "Amazon price × profit %, or the minimum profit if that's more, plus the fixed profit and payment fixed fee."],
              ["3", "Cover the fees", "Divide by (1 − commission % − payment fee %) so the fees are paid out of the price, not your margin."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl bg-mist p-4">
                <span className="flex size-7 items-center justify-center rounded-lg bg-sun text-sm font-extrabold" aria-hidden="true">
                  {n}
                </span>
                <p className="mt-2 font-bold">{t}</p>
                <p className="mt-1 leading-relaxed text-body">{d}</p>
              </li>
            ))}
          </ol>
        </SectionCard>
      </Rise>

      <Rise delay={0.05}>
        <SectionCard title="Price bands" intro="Up to 30 bands. Cheaper items usually need a higher percentage and a minimum profit in pounds.">
          {canEdit ? (
            <BandsEditor bands={bands} fees={settings.fees} />
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 font-semibold">Up to</th>
                    <th scope="col" className="py-2 font-semibold">Profit %</th>
                    <th scope="col" className="py-2 font-semibold">Fixed</th>
                    <th scope="col" className="py-2 font-semibold">Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((b) => (
                    <tr key={b.upTo} className="border-b border-line last:border-0">
                      <td className="py-2">{formatGBP(b.upTo)}</td>
                      <td className="py-2">{b.profitPct}%</td>
                      <td className="py-2">{formatGBP(b.fixedProfit)}</td>
                      <td className="py-2">{formatGBP(b.minProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[13px] text-muted">Only a workspace admin or owner can change pricing.</p>
            </div>
          )}
        </SectionCard>
      </Rise>

      {canEdit && (
        <Rise delay={0.1}>
          <SectionCard
            id="settings"
            title="Fees, stock and SKUs"
            intro="OnBuy's commission is charged on the price including VAT and delivery. Commission rates vary by category and change: check OnBuy's current fee page."
          >
            <RepricerSettingsForm values={{ ...settings.fees, inStockQty: settings.inStockQty, outOfStockPrice: settings.outOfStockPrice, boostPct: settings.boostPct, skuPrefixes: settings.skuPrefixes, prefixedOnly: settings.prefixedOnly }} />
          </SectionCard>
        </Rise>
      )}
    </>
  );
}
