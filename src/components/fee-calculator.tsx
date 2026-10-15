"use client";

import { useId, useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { CATEGORY_RATES, calculate, formatPounds, formatRate, toPence } from "@/lib/calc";
import { cn } from "@/lib/utils";

export function FeeCalculator({ showDelivery = false, className }: { showDelivery?: boolean; className?: string }) {
  const id = useId();
  const [cost, setCost] = useState("11.50");
  const [supplierDelivery, setSupplierDelivery] = useState("2.40");
  const [price, setPrice] = useState("24.99");
  const [deliveryCharged, setDeliveryCharged] = useState("0.00");
  const [rate, setRate] = useState("1500");

  const r = calculate({
    costPence: toPence(cost),
    supplierDeliveryPence: toPence(supplierDelivery),
    pricePence: toPence(price),
    deliveryChargedPence: showDelivery ? toPence(deliveryCharged) : 0,
    commissionBps: parseInt(rate, 10),
  });
  const loss = r.profit < 0;

  return (
    <form
      className={cn("grid grid-cols-1 gap-4 rounded-3xl bg-white p-6 text-ink sm:grid-cols-2", className)}
      onSubmit={(e) => e.preventDefault()}
      aria-label="OnBuy fee and profit calculator"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-cost`}>Item cost (£)</Label>
        <Input id={`${id}-cost`} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-sdel`}>Supplier delivery (£)</Label>
        <Input
          id={`${id}-sdel`}
          inputMode="decimal"
          value={supplierDelivery}
          onChange={(e) => setSupplierDelivery(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-price`}>Selling price inc VAT (£)</Label>
        <Input id={`${id}-price`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      {showDelivery && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-cdel`}>Delivery you charge inc VAT (£)</Label>
          <Input
            id={`${id}-cdel`}
            inputMode="decimal"
            value={deliveryCharged}
            onChange={(e) => setDeliveryCharged(e.target.value)}
          />
        </div>
      )}
      <div className={cn("flex flex-col gap-1.5", showDelivery && "sm:col-span-2")}>
        <Label htmlFor={`${id}-rate`}>OnBuy category</Label>
        <Select id={`${id}-rate`} value={rate} onChange={(e) => setRate(e.target.value)}>
          {CATEGORY_RATES.map((c) => (
            <option key={c.label} value={String(c.bps)}>
              {c.label} ({formatRate(c.bps)})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:col-span-2 sm:grid-cols-3" aria-live="polite">
        <div className={cn("rounded-2xl p-4", loss ? "bg-[#fde8e8]" : "bg-mint")}>
          <div className="text-[13px] font-semibold text-body">Profit per sale</div>
          <div className={cn("font-display text-[28px] font-extrabold", loss ? "text-[#9b1c1c]" : "text-sea-dark")}>
            {formatPounds(r.profit)}
          </div>
        </div>
        <div className="rounded-2xl bg-[#f3f5f4] p-4">
          <div className="text-[13px] font-semibold text-body">Margin</div>
          <div className="font-display text-[28px] font-extrabold">
            {r.marginPct === null ? "—" : `${r.marginPct.toFixed(1)}%`}
          </div>
        </div>
        <div className="rounded-2xl bg-sun-soft p-4">
          <div className="text-[13px] font-semibold text-sun-ink">Break-even price</div>
          <div className="font-display text-[28px] font-extrabold">
            {r.breakEven === null ? "—" : formatPounds(r.breakEven)}
          </div>
        </div>
      </div>
      <p className="text-[13px] text-muted sm:col-span-2">
        VAT {formatPounds(r.vat)} · OnBuy commission {formatPounds(r.commission)}. Estimates only: check OnBuy&apos;s
        current fees before you price.
      </p>
    </form>
  );
}
