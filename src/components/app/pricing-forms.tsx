"use client";

// Pricing bands and repricer settings. The preview runs the same
// marketplacePrice() the repricer uses, so what the seller sees here is what
// the worker will do.

import { useActionState, useId, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TextField, CheckboxField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import { saveBandsAction, saveSettingsAction } from "@/server/actions/app";
import { bandFor, estimatedProfit, marketplacePrice, validateBands, type PricingBand, type PricingFees } from "@/lib/pricing";
import { formatGBP } from "@/lib/format";

type Row = { key: number; upTo: string; profitPct: string; fixedProfit: string; minProfit: string };

const toRow = (b: PricingBand, key: number): Row => ({
  key,
  upTo: String(b.upTo),
  profitPct: String(b.profitPct),
  fixedProfit: b.fixedProfit.toFixed(2),
  minProfit: b.minProfit.toFixed(2),
});
const toBand = (r: Row): PricingBand => ({ upTo: Number(r.upTo), profitPct: Number(r.profitPct), fixedProfit: Number(r.fixedProfit), minProfit: Number(r.minProfit) });

export function BandsEditor({ bands, fees, next, submitLabel = "Save bands" }: { bands: PricingBand[]; fees: PricingFees; next?: string; submitLabel?: string }) {
  const id = useId();
  const [rows, setRows] = useState<Row[]>(() => bands.map(toRow));
  const [nextKey, setNextKey] = useState(bands.length);
  const [sample, setSample] = useState("24.99");
  const [state, action] = useActionState(saveBandsAction, undefined);

  const parsed = useMemo(() => rows.map(toBand), [rows]);
  const problems = useMemo(() => (rows.some((r) => [r.upTo, r.profitPct, r.fixedProfit, r.minProfit].some((v) => v.trim() === "" || !Number.isFinite(Number(v)))) ? ["Fill every box with a number."] : validateBands(parsed)), [rows, parsed]);
  const sorted = [...parsed].sort((a, b) => a.upTo - b.upTo);

  const amz = Number(sample);
  const price = problems.length === 0 && amz > 0 ? marketplacePrice(amz, parsed, fees) : null;
  const band = amz > 0 ? bandFor(parsed, amz) : null;

  const update = (key: number, field: keyof Omit<Row, "key">, value: string) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  return (
    <form action={action} className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-1.5 text-sm">
          <caption className="sr-only">Pricing bands</caption>
          <thead>
            <tr className="text-left text-[13px] font-semibold text-muted">
              <th scope="col" className="pb-1 font-semibold">Amazon price up to (£)</th>
              <th scope="col" className="pb-1 font-semibold">Profit %</th>
              <th scope="col" className="pb-1 font-semibold">Fixed profit (£)</th>
              <th scope="col" className="pb-1 font-semibold">Minimum profit (£)</th>
              <th scope="col" className="pb-1">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key}>
                {(["upTo", "profitPct", "fixedProfit", "minProfit"] as const).map((field) => (
                  <td key={field} className="pr-2">
                    <Input
                      name={field}
                      inputMode="decimal"
                      value={r[field]}
                      onChange={(e) => update(r.key, field, e.target.value)}
                      aria-label={`Band ${i + 1}: ${field === "upTo" ? "Amazon price up to" : field === "profitPct" ? "profit %" : field === "fixedProfit" ? "fixed profit" : "minimum profit"}`}
                      className="min-h-11"
                    />
                  </td>
                ))}
                <td className="w-12">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-3"
                    disabled={rows.length <= 1}
                    onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                    aria-label={`Remove band ${i + 1}`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length >= 30}
          onClick={() => {
            const top = sorted.length ? sorted[sorted.length - 1] : { upTo: 0, profitPct: 15, fixedProfit: 0, minProfit: 3 };
            setRows((rs) => [...rs, toRow({ ...top, upTo: Math.min(9999, Math.round(top.upTo * 2) || 10) }, nextKey)]);
            setNextKey((k) => k + 1);
          }}
        >
          <Plus aria-hidden="true" className="size-4" /> Add band
        </Button>
        <p className="text-[13px] text-muted">Each band covers prices above the band before it, up to its own limit. Above the last band, listings go out of stock rather than sell without profit.</p>
      </div>

      <div className="grid gap-4 rounded-2xl bg-sun-soft p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-sample`}>Try an Amazon price (£)</Label>
          <Input id={`${id}-sample`} inputMode="decimal" value={sample} onChange={(e) => setSample(e.target.value)} />
        </div>
        <dl className="grid grid-cols-3 gap-3" aria-live="polite">
          <div>
            <dt className="text-[13px] font-semibold text-sun-ink">OnBuy price</dt>
            <dd className="font-display text-2xl font-extrabold">{price === null ? "—" : formatGBP(price)}</dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-sun-ink">Profit after fees</dt>
            <dd className="font-display text-2xl font-extrabold text-sea-dark">{price === null ? "—" : formatGBP(estimatedProfit(amz, price, fees))}</dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-sun-ink">Band</dt>
            <dd className="font-display text-2xl font-extrabold">{band ? `≤ £${band.upTo}` : amz > 0 ? "None" : "—"}</dd>
          </div>
        </dl>
        <p className="text-[13px] text-sun-ink sm:col-span-2">
          With fees of {fees.marketplaceFeePct}% + {fees.paymentFeePct}% + {formatGBP(fees.paymentFixedFee)}. Profit is before VAT and delivery: check these with your accountant.
        </p>
      </div>

      {problems.length > 0 && (
        <ul className="list-disc rounded-xl bg-danger-soft py-3 pr-3 pl-8 text-sm font-semibold text-danger" role="alert">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="ink" pendingLabel="Saving and repricing…" disabled={problems.length > 0}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

export type SettingsValues = {
  marketplaceFeePct: number;
  paymentFeePct: number;
  paymentFixedFee: number;
  inStockQty: number;
  outOfStockPrice: number;
  boostPct: number | null;
  skuPrefixes: string;
  prefixedOnly: boolean;
};

export function RepricerSettingsForm({ values }: { values: SettingsValues }) {
  const id = useId();
  const [state, action] = useActionState(saveSettingsAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <TextField
        id={`${id}-mfee`}
        name="marketplaceFeePct"
        label="OnBuy commission %"
        inputMode="decimal"
        defaultValue={String(values.marketplaceFeePct)}
        hint="Check your category rate on OnBuy's fee page."
        required
      />
      <TextField id={`${id}-pfee`} name="paymentFeePct" label="Payment fee %" inputMode="decimal" defaultValue={String(values.paymentFeePct)} required />
      <TextField id={`${id}-pfix`} name="paymentFixedFee" label="Payment fixed fee (£)" inputMode="decimal" defaultValue={values.paymentFixedFee.toFixed(2)} required />
      <TextField id={`${id}-qty`} name="inStockQty" label="Stock to show when in stock" inputMode="numeric" defaultValue={String(values.inStockQty)} required />
      <TextField
        id={`${id}-oos`}
        name="outOfStockPrice"
        label="Price when out of stock (£)"
        inputMode="decimal"
        defaultValue={values.outOfStockPrice.toFixed(2)}
        hint="Sent with stock 0, so nothing sells by mistake."
        required
      />
      <TextField
        id={`${id}-boost`}
        name="boostPct"
        label="OnBuy boost %"
        inputMode="numeric"
        defaultValue={values.boostPct === null ? "" : String(values.boostPct)}
        hint="Optional extra commission for OnBuy promotion. Empty for none."
      />
      <TextField
        id={`${id}-prefix`}
        name="skuPrefixes"
        label="SKU prefixes"
        defaultValue={values.skuPrefixes}
        placeholder="SK01, AMZ-"
        hint="If your OnBuy SKUs are a prefix plus the ASIN. Separate with commas."
        className="sm:col-span-2"
      />
      <CheckboxField
        id={`${id}-prefonly`}
        name="prefixedOnly"
        defaultChecked={values.prefixedOnly}
        label="Only manage prefixed SKUs"
        hint="Leaves bare-ASIN listings on your account alone."
        className="sm:pt-7"
      />
      <div className="flex flex-col gap-3 sm:col-span-3">
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="ink" pendingLabel="Saving…">
            Save settings
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
