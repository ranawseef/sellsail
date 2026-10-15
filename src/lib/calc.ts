// Small fee maths for the public calculator. Integer pence and basis points
// throughout so there are no float money bugs. Rates are estimates; the page
// tells sellers to check OnBuy's current fees.

export const VAT_BPS = 2000; // UK standard rate, 20%
export const MIN_COMMISSION_PENCE = 25; // unverified, from third-party docs

export const CATEGORY_RATES = [
  { value: "1500", label: "Most categories (15%)" },
  { value: "700", label: "Consumer electronics (7%)" },
  { value: "2000", label: "Jewellery (20%)" },
];

export function toPence(input: string): number {
  const n = Math.round(parseFloat(input.replace(/[£,\s]/g, "")) * 100);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatPounds(pence: number): string {
  const sign = pence < 0 ? "−" : "";
  return `${sign}£${(Math.abs(pence) / 100).toFixed(2)}`;
}

function feesOn(grossPence: number, commissionBps: number) {
  const vat = Math.round((grossPence * VAT_BPS) / (10000 + VAT_BPS));
  const commission =
    grossPence > 0 ? Math.max(Math.round((grossPence * commissionBps) / 10000), MIN_COMMISSION_PENCE) : 0;
  return { vat, commission, net: grossPence - vat };
}

export type CalcInput = {
  costPence: number;
  supplierDeliveryPence: number;
  pricePence: number; // VAT included
  deliveryChargedPence: number; // VAT included
  commissionBps: number;
};

export function calculate(input: CalcInput) {
  const costs = input.costPence + input.supplierDeliveryPence;
  const gross = input.pricePence + input.deliveryChargedPence;
  // Commission is charged on the VAT- and delivery-inclusive total.
  const f = feesOn(gross, input.commissionBps);
  const profit = f.net - f.commission - costs;

  // Lowest whole-penny price (delivery charge held fixed) with profit >= 0.
  const breakEven = (() => {
    let p = 0;
    let hi = 10_000_000;
    if (feesOn(hi + input.deliveryChargedPence, input.commissionBps).net - feesOn(hi + input.deliveryChargedPence, input.commissionBps).commission - costs < 0) return null;
    while (p < hi) {
      const mid = Math.floor((p + hi) / 2);
      const g = feesOn(mid + input.deliveryChargedPence, input.commissionBps);
      if (g.net - g.commission - costs >= 0) hi = mid;
      else p = mid + 1;
    }
    return p;
  })();

  return {
    vat: f.vat,
    commission: f.commission,
    profit,
    marginPct: f.net > 0 ? (profit * 100) / f.net : null,
    breakEven,
  };
}
