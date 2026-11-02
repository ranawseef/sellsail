// Stripe webhook: signature check, idempotency and plan mapping.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { resetDatabase, skipDb } from "./helpers/db.ts";
import { closePool, exec, one, q } from "../src/server/db/pool.ts";
import { createAccount } from "../src/server/tenants/accounts.ts";
import { handleWebhook, mapStatus, WebhookSignatureError } from "../src/server/billing/stripe.ts";
import { canRunJobs, planForStripePrice } from "../src/config/plans.ts";

const SECRET = "whsec_test_secret";
process.env.STRIPE_SECRET_KEY = "sk_test_not_used_for_network";
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
process.env.STRIPE_PRICE_GROWTH = "price_growth";

const signer = new Stripe("sk_test_x");
function signed(event: object): { body: string; sig: string } {
  const body = JSON.stringify(event);
  return { body, sig: signer.webhooks.generateTestHeaderString({ payload: body, secret: SECRET }) };
}
function subscriptionEvent(id: string, type: string, sub: { id: string; customer: string; status: string; price: string }) {
  return {
    id,
    object: "event",
    type,
    data: { object: { id: sub.id, object: "subscription", customer: sub.customer, status: sub.status, metadata: {}, items: { data: [{ price: { id: sub.price } }] } } },
  };
}

before(async () => {
  if (!skipDb) await resetDatabase();
});
after(async () => {
  if (!skipDb) await closePool();
});

test("status and price mapping", () => {
  assert.equal(mapStatus("active"), "active");
  assert.equal(mapStatus("trialing"), "active");
  assert.equal(mapStatus("unpaid"), "past_due");
  assert.equal(mapStatus("incomplete_expired"), "canceled");
  assert.equal(mapStatus("incomplete"), null);
  assert.equal(planForStripePrice("price_growth"), "growth");
  assert.equal(planForStripePrice("price_unknown"), null);
  const t = { plan: "trial", planStatus: "trialing", trialEndsAt: new Date(Date.now() + 1000), paused: false };
  assert.equal(canRunJobs(t), true);
  assert.equal(canRunJobs({ ...t, trialEndsAt: new Date(Date.now() - 1000) }), false);
  assert.equal(canRunJobs({ ...t, planStatus: "canceled" }), false);
  assert.equal(canRunJobs({ ...t, planStatus: "active", paused: true }), false);
});

test("a forged or altered webhook is refused", { skip: skipDb }, async () => {
  const { body, sig } = signed(subscriptionEvent("evt_forged", "customer.subscription.deleted", { id: "sub_x", customer: "cus_x", status: "canceled", price: "p" }));
  await assert.rejects(handleWebhook(body.replace("canceled", "active"), sig), WebhookSignatureError);
  await assert.rejects(handleWebhook(body, null), WebhookSignatureError);
});

test("a cancellation applies once; a redelivery changes nothing", { skip: skipDb }, async () => {
  const { tenantId } = await createAccount({ email: "pay@example.com", name: "P", password: "a long password", workspace: "Pay", ip: "" });
  await exec("UPDATE tenants SET stripe_customer_id = 'cus_1', stripe_subscription_id = 'sub_1', plan = 'growth', plan_status = 'active' WHERE id = ?", [tenantId]);

  const { body, sig } = signed(subscriptionEvent("evt_1", "customer.subscription.deleted", { id: "sub_1", customer: "cus_1", status: "canceled", price: "price_growth" }));
  assert.equal(await handleWebhook(body, sig), "applied");
  let t = await one<{ plan_status: string; plan: string }>("SELECT plan_status, plan FROM tenants WHERE id = ?", [tenantId]);
  assert.equal(t?.plan_status, "canceled");

  // Someone re-activates manually; the old event arriving again must not cancel them.
  await exec("UPDATE tenants SET plan_status = 'active' WHERE id = ?", [tenantId]);
  assert.equal(await handleWebhook(body, sig), "duplicate");
  t = await one("SELECT plan_status FROM tenants WHERE id = ?", [tenantId]);
  assert.equal(t?.plan_status, "active");

  // The change is on the workspace's activity timeline once, with no Stripe ids or card data.
  const acts = await q<{ detail: string; user_id: number | null }>("SELECT detail, user_id FROM user_activity WHERE tenant_id = ? AND type = 'billing.subscription_changed'", [tenantId]);
  assert.equal(acts.length, 1);
  assert.equal(acts[0].user_id, null);
  assert.deepEqual(JSON.parse(acts[0].detail), { plan: "growth", status: "canceled", previousPlan: "growth", previousStatus: "active", stripeEvent: "customer.subscription.deleted" });
  assert.ok(!acts[0].detail.includes("cus_1") && !acts[0].detail.includes("sub_1"));
});

test("cancelling an old subscription doesn't touch a newer one", { skip: skipDb }, async () => {
  const { tenantId } = await createAccount({ email: "two@example.com", name: "T", password: "a long password", workspace: "Two", ip: "" });
  await exec("UPDATE tenants SET stripe_customer_id = 'cus_2', stripe_subscription_id = 'sub_new', plan_status = 'active' WHERE id = ?", [tenantId]);
  const { body, sig } = signed(subscriptionEvent("evt_2", "customer.subscription.deleted", { id: "sub_old", customer: "cus_2", status: "canceled", price: "price_growth" }));
  assert.equal(await handleWebhook(body, sig), "stale");
  const t = await one<{ plan_status: string }>("SELECT plan_status FROM tenants WHERE id = ?", [tenantId]);
  assert.equal(t?.plan_status, "active");
});
