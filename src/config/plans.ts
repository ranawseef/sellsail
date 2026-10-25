// Subscription plans. Prices and listing limits match the marketing pricing
// page (src/content/pricing.ts).
//
// Stripe price ids come from env vars so test and live mode can differ.

export type PlanId = "trial" | "starter" | "growth" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in pence, for display. Stripe holds the real price. */
  pricePence: number;
  maxSkus: number;
  /** Seconds between push runs (how quickly OnBuy sees a new price). */
  pushIntervalS: number;
  /** Seconds before a listing's competition is checked again. */
  competeIntervalS: number;
  stripePriceEnv?: string;
};

export const TRIAL_DAYS = 14;

export const PLANS: Record<PlanId, Plan> = {
  trial: { id: "trial", name: "Free trial", pricePence: 0, maxSkus: 1000, pushIntervalS: 300, competeIntervalS: 1800 },
  starter: {
    id: "starter",
    name: "Starter",
    pricePence: 2900,
    maxSkus: 5000,
    pushIntervalS: 300,
    competeIntervalS: 1800,
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  growth: {
    id: "growth",
    name: "Growth",
    pricePence: 6900,
    maxSkus: 20000,
    pushIntervalS: 180,
    competeIntervalS: 900,
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
  },
  pro: {
    id: "pro",
    name: "Pro",
    pricePence: 14900,
    maxSkus: 50000,
    pushIntervalS: 120,
    competeIntervalS: 600,
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
};

export const PAID_PLANS: PlanId[] = ["starter", "growth", "pro"];

export function planFor(id: string | null | undefined): Plan {
  return PLANS[(id ?? "trial") as PlanId] ?? PLANS.trial;
}

/** The Stripe price id configured for a plan, or null when not set up. */
export function stripePriceId(plan: PlanId): string | null {
  const env = PLANS[plan].stripePriceEnv;
  return (env && process.env[env]) || null;
}

/** The plan a Stripe price id belongs to. */
export function planForStripePrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const id of PAID_PLANS) {
    if (stripePriceId(id) === priceId) return id;
  }
  return null;
}

export type TenantPlanState = { plan: string; planStatus: string; trialEndsAt: Date | null; paused: boolean };

/**
 * May this workspace's jobs run right now? Paused, expired,
 * cancelled, or a trial past its end date: no.
 */
export function canRunJobs(t: TenantPlanState, now = new Date()): boolean {
  if (t.paused) return false;
  if (t.planStatus === "active" || t.planStatus === "past_due") return true;
  if (t.planStatus === "trialing") return t.trialEndsAt !== null && t.trialEndsAt.getTime() > now.getTime();
  return false;
}

export function formatPence(p: number): string {
  return `£${(p / 100).toFixed(p % 100 === 0 ? 0 : 2)}`;
}
