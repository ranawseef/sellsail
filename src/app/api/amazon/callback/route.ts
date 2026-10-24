// Seller Central sends the seller back here after they approve SellSail.
// Register https://sellsail.io/api/amazon/callback as the app's OAuth
// redirect URI in Seller Central.
//
// The state must match one this same user and workspace started (single use,
// 15 minutes), and the code is exchanged through the workspace's proxy.

import { NextResponse } from "next/server";
import { appUrl, getAuth, requestInfo } from "@/server/auth/context";
import { completeOAuth } from "@/server/connections/amazon";
import { proxyForJob } from "@/server/connections/proxy";
import { audit, logEvent } from "@/server/audit";
import { onboardingTarget } from "@/server/onboarding";

export async function GET(req: Request) {
  const base = appUrl();
  const auth = await getAuth();
  if (!auth) return NextResponse.redirect(`${base}/login`);

  const url = new URL(req.url);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("spapi_oauth_code") ?? "";
  const sellingPartnerId = url.searchParams.get("selling_partner_id") ?? "";
  const back = await onboardingTarget(auth.tenantId, "amazon");

  if (!state || !code || state.length > 200 || code.length > 500) {
    await logEvent(auth.tenantId, "warn", "amazon", "Amazon approval was cancelled or incomplete.");
    return NextResponse.redirect(`${base}${back}&amazon=cancelled`);
  }
  try {
    const { proxy, reason } = await proxyForJob(auth.tenantId);
    if (!proxy) throw new Error(`${reason}. Fix the proxy, then connect Amazon again.`);
    await completeOAuth(auth.tenantId, auth.userId, proxy, { state, code, sellingPartnerId, redirectUri: `${base}/api/amazon/callback` });
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "amazon.connect", detail: `Seller Central approval for ${sellingPartnerId.slice(0, 4)}••••`, ip });
    await logEvent(auth.tenantId, "info", "amazon", "Amazon account connected through Seller Central.");
    return NextResponse.redirect(`${base}${back}&amazon=connected`);
  } catch (err) {
    await logEvent(auth.tenantId, "error", "amazon", `Connecting Amazon failed: ${(err as Error).message}`);
    return NextResponse.redirect(`${base}${back}&amazon=failed`);
  }
}
