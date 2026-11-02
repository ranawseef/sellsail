// Stripe billing for SellSail itself (not a seller's marketplace account, so
// it does not go through the tenant proxy; scripts/check-egress.mjs allows
// this one file to use the Stripe SDK).
//
// The webhook is the source of truth for plan and status. It is idempotent:
// each Stripe event id is recorded in stripe_events in the same transaction
// as the change it causes, so a redelivered event changes nothing. Events can
// arrive out of order, so the handler re-reads the subscription from Stripe
// rather than trusting the copy inside the event.

import Stripe from "stripe";
import { exec, one, tx } from "../db/pool.ts";
import { audit, logEvent } from "../audit.ts";
import { recordActivity } from "../activity.ts";
import { PAID_PLANS, PLANS, planFor, planForLookupKey, planForStripePrice, stripePriceId, type BillingInterval, type PlanId } from "../../config/plans.ts";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Billing is not set up yet (STRIPE_SECRET_KEY missing).");
  client ??= new Stripe(key, { maxNetworkRetries: 2, timeout: 20_000 });
  return client;
}

// Price ids found by lookup key, kept for the life of the process.
const priceCache = new Map<string, string>();

/**
 * The Stripe price for a plan and billing interval: for monthly, the env
 * override if set; otherwise the price with the plan's lookup key.
 */
export async function priceIdFor(plan: PlanId, interval: BillingInterval = "month"): Promise<string | null> {
  if (interval === "month") {
    const fromEnv = stripePriceId(plan);
    if (fromEnv) return fromEnv;
  }
  const key = interval === "year" ? PLANS[plan].yearlyLookupKey : PLANS[plan].lookupKey;
  if (!key) return null;
  const cached = priceCache.get(key);
  if (cached) return cached;
  const found = await stripe().prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const id = found.data[0]?.id ?? null;
  if (id) priceCache.set(key, id);
  return id;
}

/** Which of our plans a Stripe price is. */
function planOfPrice(price: Stripe.Price | null | undefined): PlanId | null {
  if (!price) return null;
  return planForLookupKey(price.lookup_key) ?? planForStripePrice(price.id) ?? (PAID_PLANS.includes(price.metadata?.plan as PlanId) ? (price.metadata.plan as PlanId) : null);
}

async function customerFor(tenantId: number, email: string): Promise<string> {
  const t = await one<{ name: string; stripe_customer_id: string | null }>("SELECT name, stripe_customer_id FROM tenants WHERE id = ?", [tenantId]);
  if (!t) throw new Error("Workspace not found");
  if (t.stripe_customer_id) return t.stripe_customer_id;
  const customer = await stripe().customers.create(
    { email, name: t.name, metadata: { tenant_id: String(tenantId) } },
    // Two clicks at once must not create two customers.
    { idempotencyKey: `customer-tenant-${tenantId}` },
  );
  await exec("UPDATE tenants SET stripe_customer_id = ? WHERE id = ? AND stripe_customer_id IS NULL", [customer.id, tenantId]);
  const saved = await one<{ stripe_customer_id: string }>("SELECT stripe_customer_id FROM tenants WHERE id = ?", [tenantId]);
  return saved?.stripe_customer_id ?? customer.id;
}

/** Hosted Checkout for a new subscription. Returns the URL to send the browser to. */
export async function checkoutUrl(tenantId: number, email: string, plan: PlanId, baseUrl: string, interval: BillingInterval = "month"): Promise<string> {
  if (!PAID_PLANS.includes(plan)) throw new Error("Unknown plan");
  // A workspace with a live subscription changes plan in the portal, so it is
  // never charged for two subscriptions at once.
  const t = await one<{ stripe_subscription_id: string | null; plan_status: string }>("SELECT stripe_subscription_id, plan_status FROM tenants WHERE id = ?", [tenantId]);
  if (t?.stripe_subscription_id && (t.plan_status === "active" || t.plan_status === "past_due")) {
    throw new BillingError("You already have a subscription. Change plan from Manage billing.");
  }
  const price = await priceIdFor(plan, interval);
  if (!price) throw new BillingError(`The ${planFor(plan).name} plan isn't set up for payment yet.`);
  const customer = await customerFor(tenantId, email);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: String(tenantId),
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { tenant_id: String(tenantId) } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    // Businesses can add a VAT number; it is printed on their invoices.
    tax_id_collection: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    success_url: `${baseUrl}/app/billing?checkout=success`,
    cancel_url: `${baseUrl}/app/billing?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout link");
  return session.url;
}

/** Stripe's customer portal: change plan, card, invoices, cancel. */
export async function portalUrl(tenantId: number, baseUrl: string): Promise<string> {
  const t = await one<{ stripe_customer_id: string | null }>("SELECT stripe_customer_id FROM tenants WHERE id = ?", [tenantId]);
  if (!t?.stripe_customer_id) throw new BillingError("No billing account yet. Choose a plan first.");
  const session = await stripe().billingPortal.sessions.create({ customer: t.stripe_customer_id, return_url: `${baseUrl}/app/billing` });
  return session.url;
}

/** A billing problem written for the seller, safe to show. */
export class BillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingError";
  }
}

export type InvoiceRow = { id: string; number: string | null; total: number; currency: string; status: string; created: Date; url: string | null; pdf: string | null };

/** The workspace's latest invoices, for the billing page. Empty when billing isn't set up. */
export async function listInvoices(tenantId: number, limit = 12): Promise<InvoiceRow[]> {
  if (!process.env.STRIPE_SECRET_KEY) return [];
  const t = await one<{ stripe_customer_id: string | null }>("SELECT stripe_customer_id FROM tenants WHERE id = ?", [tenantId]);
  if (!t?.stripe_customer_id) return [];
  try {
    const list = await stripe().invoices.list({ customer: t.stripe_customer_id, limit });
    return list.data
      .filter((i) => i.status !== "draft")
      .map((i) => ({
        id: i.id ?? "",
        number: i.number ?? null,
        total: i.total,
        currency: i.currency,
        status: i.status ?? "open",
        created: new Date(i.created * 1000),
        url: i.hosted_invoice_url ?? null,
        pdf: i.invoice_pdf ?? null,
      }));
  } catch (err) {
    console.error("[stripe] invoices list failed:", (err as Error).message);
    return [];
  }
}

/** Stripe subscription status -> our plan_status. Null means "leave as is". */
export function mapStatus(status: string): "active" | "past_due" | "canceled" | null {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return null; // incomplete, paused: wait for the next event
  }
}

type Change = { tenantId: number; plan: PlanId | null; status: ReturnType<typeof mapStatus>; customerId: string; subscriptionId: string };

async function changeFromSubscription(sub: Stripe.Subscription): Promise<Change | null> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const byCustomer = await one<{ id: number }>("SELECT id FROM tenants WHERE stripe_customer_id = ?", [customerId]);
  const metaTenant = Number(sub.metadata?.tenant_id);
  const tenantId = byCustomer?.id ?? (Number.isInteger(metaTenant) && metaTenant > 0 ? metaTenant : 0);
  if (!tenantId) return null;
  return { tenantId, plan: planOfPrice(sub.items.data[0]?.price), status: mapStatus(sub.status), customerId, subscriptionId: sub.id };
}

export class WebhookSignatureError extends Error {}

/**
 * Verifies and applies one webhook delivery. Throws WebhookSignatureError for
 * a bad signature (answer 400) and anything else for a failure Stripe should
 * retry (answer 500).
 */
export async function handleWebhook(rawBody: string, signature: string | null): Promise<string> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature ?? "", secret);
  } catch {
    throw new WebhookSignatureError("Invalid signature");
  }

  if (await one("SELECT 1 FROM stripe_events WHERE id = ?", [event.id])) return "duplicate";

  let change: Change | null = null;
  let notice: { tenantId: number; message: string; amountPence: number } | null = null;
  if (event.type === "invoice.payment_failed" || event.type === "invoice.payment_action_required") {
    // Tell the seller in the dashboard; the subscription events change the status.
    const inv = event.data.object as Stripe.Invoice;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    const t = customerId ? await one<{ id: number }>("SELECT id FROM tenants WHERE stripe_customer_id = ?", [customerId]) : null;
    if (t) {
      const amount = `£${(inv.amount_due / 100).toFixed(2)}`;
      notice = {
        tenantId: t.id,
        amountPence: inv.amount_due,
        message:
          event.type === "invoice.payment_failed"
            ? `Your SellSail payment of ${amount} failed. Update your card under Billing → Manage billing to keep repricing.`
            : `Your bank needs you to confirm the SellSail payment of ${amount}. Open Billing → Manage billing to approve it.`,
      };
    }
  } else if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
    const tenantId = Number(s.client_reference_id);
    if (subId && Number.isInteger(tenantId) && tenantId > 0) {
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
      if (customerId) await exec("UPDATE tenants SET stripe_customer_id = COALESCE(stripe_customer_id, ?) WHERE id = ?", [customerId, tenantId]);
      change = await changeFromSubscription(await stripe().subscriptions.retrieve(subId));
    }
  } else if (event.type.startsWith("customer.subscription.")) {
    const sub = event.data.object as Stripe.Subscription;
    const fresh = event.type === "customer.subscription.deleted" ? sub : await stripe().subscriptions.retrieve(sub.id);
    change = await changeFromSubscription(fresh);
  }

  let before: { plan: string; plan_status: string } | null = null;
  const outcome = await tx(async (t) => {
    const ins = await t.exec("INSERT IGNORE INTO stripe_events (id) VALUES (?)", [event.id]);
    if (ins.affectedRows === 0) return "duplicate"; // another delivery got here first
    if (notice) {
      await logEvent(notice.tenantId, "warn", "billing", notice.message, t);
      return "noted";
    }
    if (!change) return "ignored";
    const current = await t.q<{ stripe_subscription_id: string | null; plan: string; plan_status: string }>(
      "SELECT stripe_subscription_id, plan, plan_status FROM tenants WHERE id = ? FOR UPDATE",
      [change.tenantId],
    );
    before = current[0] ?? null;
    // A cancelled old subscription must not overwrite a newer active one.
    if (change.status === "canceled" && current[0]?.stripe_subscription_id && current[0].stripe_subscription_id !== change.subscriptionId) {
      return "stale";
    }
    if (change.status === null) return "ignored";
    await t.exec(
      `UPDATE tenants SET plan = COALESCE(?, plan), plan_status = ?, stripe_subscription_id = ?,
         stripe_customer_id = COALESCE(stripe_customer_id, ?), comp_until = NULL, comp_note = NULL WHERE id = ?`,
      [change.plan, change.status, change.subscriptionId, change.customerId, change.tenantId],
    );
    await audit({ tenantId: change.tenantId, userId: null, action: "billing.subscription", detail: `${change.plan ?? "plan unchanged"}: ${change.status} (${event.type})` }, t);
    return "applied";
  });

  // Activity is written after the commit, so it can never roll back (or fail) the billing change.
  if (outcome === "noted" && notice) {
    const n = notice as { tenantId: number; amountPence: number };
    await recordActivity({
      type: event.type === "invoice.payment_failed" ? "billing.payment_failed" : "billing.payment_action_required",
      tenantId: n.tenantId,
      detail: { amountPence: n.amountPence, stripeEvent: event.type },
    });
  } else if (outcome === "applied" && change) {
    const c = change as Change;
    const was = before as { plan: string; plan_status: string } | null;
    await recordActivity({
      type: "billing.subscription_changed",
      tenantId: c.tenantId,
      detail: { plan: c.plan, status: c.status, previousPlan: was?.plan ?? null, previousStatus: was?.plan_status ?? null, stripeEvent: event.type },
    });
  }
  return outcome;
}
