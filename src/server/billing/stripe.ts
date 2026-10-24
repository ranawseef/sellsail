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
import { audit } from "../audit.ts";
import { PAID_PLANS, planFor, planForStripePrice, stripePriceId, type PlanId } from "../../config/plans.ts";

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
export async function checkoutUrl(tenantId: number, email: string, plan: PlanId, baseUrl: string): Promise<string> {
  if (!PAID_PLANS.includes(plan)) throw new Error("Unknown plan");
  const price = stripePriceId(plan);
  if (!price) throw new Error(`The ${planFor(plan).name} plan isn't set up for payment yet.`);
  const customer = await customerFor(tenantId, email);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: String(tenantId),
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { tenant_id: String(tenantId) } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    success_url: `${baseUrl}/app/billing?checkout=success`,
    cancel_url: `${baseUrl}/app/billing?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout link");
  return session.url;
}

/** Stripe's customer portal: change plan, card, invoices, cancel. */
export async function portalUrl(tenantId: number, baseUrl: string): Promise<string> {
  const t = await one<{ stripe_customer_id: string | null }>("SELECT stripe_customer_id FROM tenants WHERE id = ?", [tenantId]);
  if (!t?.stripe_customer_id) throw new Error("No billing account yet. Choose a plan first.");
  const session = await stripe().billingPortal.sessions.create({ customer: t.stripe_customer_id, return_url: `${baseUrl}/app/billing` });
  return session.url;
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
  const priceId = sub.items.data[0]?.price?.id ?? null;
  return { tenantId, plan: planForStripePrice(priceId), status: mapStatus(sub.status), customerId, subscriptionId: sub.id };
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
  if (event.type === "checkout.session.completed") {
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

  const outcome = await tx(async (t) => {
    const ins = await t.exec("INSERT IGNORE INTO stripe_events (id) VALUES (?)", [event.id]);
    if (ins.affectedRows === 0) return "duplicate"; // another delivery got here first
    if (!change) return "ignored";
    const current = await t.q<{ stripe_subscription_id: string | null }>("SELECT stripe_subscription_id FROM tenants WHERE id = ? FOR UPDATE", [change.tenantId]);
    // A cancelled old subscription must not overwrite a newer active one.
    if (change.status === "canceled" && current[0]?.stripe_subscription_id && current[0].stripe_subscription_id !== change.subscriptionId) {
      return "stale";
    }
    if (change.status === null) return "ignored";
    await t.exec(
      `UPDATE tenants SET plan = COALESCE(?, plan), plan_status = ?, stripe_subscription_id = ?,
         stripe_customer_id = COALESCE(stripe_customer_id, ?) WHERE id = ?`,
      [change.plan, change.status, change.subscriptionId, change.customerId, change.tenantId],
    );
    await audit({ tenantId: change.tenantId, userId: null, action: "billing.subscription", detail: `${change.plan ?? "plan unchanged"}: ${change.status} (${event.type})` }, t);
    return "applied";
  });
  return outcome;
}
