// Where to send the seller after a connection step: back into the wizard
// while onboarding, otherwise to the Connections page.
//
// Three steps. Amazon needs no step (SellSail reads Amazon prices with its
// own keys), and a proxy is optional, offered inside the OnBuy step.

import { one } from "./db/pool.ts";

export const WIZARD_STEPS = ["onbuy", "pricing", "import"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export async function onboardingTarget(tenantId: number, step: WizardStep): Promise<string> {
  const t = await one<{ onboarded_at: Date | null }>("SELECT onboarded_at FROM tenants WHERE id = ?", [tenantId]);
  return t?.onboarded_at ? `/app/connections?from=${step}` : `/app/onboarding?step=${step}`;
}
