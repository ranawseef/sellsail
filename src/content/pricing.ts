// Public plans, built from src/config/plans.ts so the website and the app
// can never disagree on prices, limits or sync speeds.
import { PLANS, TRIAL_DAYS, type PlanId } from "@/config/plans";

const mins = (s: number) => `${Math.round(s / 60)} min`;
const n = (v: number) => v.toLocaleString("en-GB");

export type PublicPlan = {
  id: PlanId | "agency";
  name: string;
  tagline: string;
  price: string;
  listings: string;
  highlights: string[];
  cta: string;
  href: string;
  featured: boolean;
};

const paid = (id: "starter" | "growth" | "pro", tagline: string, extra: string, featured = false): PublicPlan => ({
  id,
  name: PLANS[id].name,
  tagline,
  price: `£${PLANS[id].pricePence / 100}`,
  listings: `${n(PLANS[id].maxSkus)} listings`,
  highlights: [
    `OnBuy updated every ${mins(PLANS[id].pushIntervalS)}`,
    `Competition checked every ${mins(PLANS[id].competeIntervalS)}`,
    extra,
  ],
  cta: "Start free trial",
  href: "/signup",
  featured,
});

export const plans: PublicPlan[] = [
  paid("starter", "For new and small shops", "Live Amazon UK prices included"),
  paid("growth", "For shops that are scaling", "Everything in Starter, 4× the listings", true),
  paid("pro", "For large catalogues", "Our fastest sync and competition checks"),
  {
    id: "agency",
    name: "Agency",
    tagline: "For several OnBuy shops",
    price: "£249+",
    listings: "Custom limits",
    highlights: ["Several OnBuy accounts", "Limits and sync speed to suit you", "Set-up help from our team"],
    cta: "Talk to us",
    href: "/contact",
    featured: false,
  },
];

/** In every plan. */
export const planIncludes = [
  "Live Amazon UK prices",
  "Fee-aware OnBuy pricing",
  "Competition repricing",
  "Stock and price sync",
  "Out-of-stock protection",
  "Safety brakes and price history",
  "Optional own proxy",
  "Email support from a UK team",
];

export const trialNote = `${TRIAL_DAYS}-day free trial · No card needed · Cancel any time · Prices exclude VAT`;

/** Rows for the plan comparison table: [label, starter, growth, pro, agency]. */
export const compareRows: [string, string, string, string, string][] = [
  ["Listings", n(PLANS.starter.maxSkus), n(PLANS.growth.maxSkus), n(PLANS.pro.maxSkus), "Custom"],
  ["OnBuy price and stock updates", `Every ${mins(PLANS.starter.pushIntervalS)}`, `Every ${mins(PLANS.growth.pushIntervalS)}`, `Every ${mins(PLANS.pro.pushIntervalS)}`, "Custom"],
  ["Competition checks", `Every ${mins(PLANS.starter.competeIntervalS)}`, `Every ${mins(PLANS.growth.competeIntervalS)}`, `Every ${mins(PLANS.pro.competeIntervalS)}`, "Custom"],
  ["OnBuy accounts", "1", "1", "1", "Several"],
  ...planIncludes.map((f): [string, string, string, string, string] => [f, "yes", "yes", "yes", "yes"]),
];
