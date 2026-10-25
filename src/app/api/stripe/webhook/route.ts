// Stripe webhook. Point Stripe at https://sellsail.io/api/stripe/webhook and
// send: checkout.session.completed, customer.subscription.created/updated/
// deleted/paused/resumed, invoice.paid, invoice.payment_failed and
// invoice.payment_action_required.

import { handleWebhook, WebhookSignatureError } from "@/server/billing/stripe";

export async function POST(req: Request) {
  // The signature covers the exact bytes Stripe sent, so read the raw body.
  const body = await req.text();
  try {
    const outcome = await handleWebhook(body, req.headers.get("stripe-signature"));
    return Response.json({ received: true, outcome });
  } catch (err) {
    if (err instanceof WebhookSignatureError) return Response.json({ error: "invalid signature" }, { status: 400 });
    console.error("[stripe] webhook failed:", (err as Error).message);
    return Response.json({ error: "temporary failure" }, { status: 500 }); // Stripe retries
  }
}
