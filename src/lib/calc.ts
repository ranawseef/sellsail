// Small fee maths for the public calculator. Integer pence and basis points
// throughout so there are no float money bugs.

export const VAT_BPS = 2000; // UK standard rate, 20%
export const MIN_COMMISSION_PENCE = 25;

// OnBuy commission by category. Source: Re-Pricer's OnBuy fees table
// (re-pricer.com/free-tools/onbuy-fees), which says it was read from OnBuy's
// API on 2 August 2026. Not yet checked against OnBuy's own fee page. A few
// categories have a lower rate above a value threshold that is not published
// there, so these are flat rates.
export const RATES_SOURCE = "Re-Pricer's OnBuy fee table, read from OnBuy's API on 2 August 2026";

export const CATEGORY_RATES: { label: string; bps: number }[] = [
  { label: "Everything else / standard", bps: 1500 },
  { label: "Arts, Crafts & Sewing", bps: 1500 },
  { label: "Baby & Toddler", bps: 800 },
  { label: "Beer, Wine & Spirits", bps: 1000 },
  { label: "Books", bps: 1500 },
  { label: "Business, Office & Industrial Supplies", bps: 1500 },
  { label: "Car & Automotive Parts", bps: 1500 },
  { label: "Clothing, Shoes & Accessories", bps: 1500 },
  { label: "Consumer Electronics", bps: 700 },
  { label: "DIY & Tools", bps: 1300 },
  { label: "Electronic Accessories", bps: 1500 },
  { label: "Food & Drink", bps: 800 },
  { label: "Furniture", bps: 1500 },
  { label: "Games Consoles", bps: 800 },
  { label: "Health & Beauty", bps: 800 },
  { label: "Jewellery", bps: 2000 },
  { label: "Large Appliances", bps: 700 },
  { label: "Musical Instruments & DJ", bps: 1200 },
  { label: "Music, VHS, DVD", bps: 1500 },
  { label: "Pet Supplies", bps: 1500 },
  { label: "Power Tools", bps: 1300 },
  { label: "Small Appliances", bps: 1500 },
  { label: "Software", bps: 1500 },
  { label: "Sports & Outdoors", bps: 1500 },
  { label: "Toys & Games", bps: 1500 },
  { label: "Video Games", bps: 1500 },
  { label: "Watches", bps: 1500 },
];

export function formatRate(bps: number) {
  return `${bps / 100}%`;
}

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
  // Commission is charged on the delivered total the buyer pays.
  const profitAt = (price: number) => {
    const g = feesOn(price + input.deliveryChargedPence, input.commissionBps);
    return g.net - g.commission - costs;
  };
  const f = feesOn(input.pricePence + input.deliveryChargedPence, input.commissionBps);
  const profit = f.net - f.commission - costs;

  // Lowest whole-penny price (delivery charge held fixed) with profit >= 0.
  const MAX = 10_000_000;
  let breakEven: number | null = null;
  if (profitAt(MAX) >= 0) {
    let lo = 0;
    let hi = MAX;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (profitAt(mid) >= 0) hi = mid;
      else lo = mid + 1;
    }
    breakEven = lo;
  }

  return {
    vat: f.vat,
    commission: f.commission,
    profit,
    marginPct: f.net > 0 ? (profit * 100) / f.net : null,
    breakEven,
  };
}
