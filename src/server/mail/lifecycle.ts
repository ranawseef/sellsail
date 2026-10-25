// Account emails sent on a schedule: a welcome once the email is confirmed,
// and reminders 4 days and 1 day before a free trial ends.
//
// Runs from the scheduler's hourly maintenance. Each (workspace, kind) is
// claimed in lifecycle_emails before sending, so an email goes out at most
// once even with several processes; a failed send releases the claim so the
// next hour tries again.

import { exec, q } from "../db/pool.ts";
import { sendMessageEmail, mailConfigured, type MessageEmail } from "./send.ts";
import { site } from "../../lib/site.ts";

type Kind = "welcome" | "trial_4d" | "trial_1d";
type Target = { tenant_id: number; email: string; name: string; trial_ends_at: Date | null };

const OWNER = `SELECT t.id AS tenant_id, u.email, u.name, t.trial_ends_at
                 FROM tenants t
                 JOIN memberships m ON m.tenant_id = t.id AND m.role = 'owner'
                 JOIN users u ON u.id = m.user_id AND u.email_verified_at IS NOT NULL`;

const NOT_SENT = (kind: Kind) => `NOT EXISTS (SELECT 1 FROM lifecycle_emails le WHERE le.tenant_id = t.id AND le.kind = '${kind}')`;

const appUrl = () => (process.env.APP_URL || site.appUrl).replace(/\/+$/, "");

function message(kind: Kind, t: Target): MessageEmail {
  const first = t.name.split(" ")[0] || "there";
  const base = appUrl();
  if (kind === "welcome") {
    return {
      subject: "Welcome to SellSail",
      heading: `Welcome aboard, ${first}`,
      paragraphs: [
        "Your 14-day free trial has started. Three steps get your OnBuy listings repricing from Amazon:",
        "1. Connect OnBuy with your API keys.  2. Check the suggested margin bands.  3. Import your listings or upload a CSV.",
        "Once that's done, SellSail reads Amazon prices, sets OnBuy prices that cover every fee, and keeps stock in sync around the clock. Switch on Competition to undercut cheaper sellers without going below your floor.",
        "Any questions, just reply to this email.",
      ],
      cta: { label: "Finish setting up", url: `${base}/app/overview` },
    };
  }
  const days = kind === "trial_4d" ? "4 days" : "1 day";
  return {
    subject: kind === "trial_4d" ? "Your SellSail trial ends in 4 days" : "Your SellSail trial ends tomorrow",
    heading: `${days} left on your free trial`,
    paragraphs: [
      `Hi ${first}, your SellSail free trial ends in ${days}. After that, repricing and OnBuy updates stop until you choose a plan.`,
      "Plans start at £29 a month, or pay yearly and get two months free. You can change or cancel at any time.",
    ],
    cta: { label: "Choose a plan", url: `${base}/app/billing` },
  };
}

async function sendAll(kind: Kind, where: string): Promise<number> {
  const targets = await q<Target>(`${OWNER} WHERE ${where} AND ${NOT_SENT(kind)} LIMIT 50`);
  let sent = 0;
  for (const t of targets) {
    const claim = await exec("INSERT IGNORE INTO lifecycle_emails (tenant_id, kind) VALUES (?, ?)", [t.tenant_id, kind]);
    if (claim.affectedRows !== 1) continue;
    if (await sendMessageEmail(t.email, message(kind, t))) sent++;
    else await exec("DELETE FROM lifecycle_emails WHERE tenant_id = ? AND kind = ?", [t.tenant_id, kind]);
  }
  return sent;
}

export async function sendLifecycleEmails(): Promise<void> {
  if (!mailConfigured()) return;
  const trialing = "t.plan_status = 'trialing' AND t.comp_until IS NULL";
  // Only workspaces made in the last week get a welcome, so turning this on
  // doesn't email every existing account.
  await sendAll("welcome", "t.created_at > NOW(3) - INTERVAL 7 DAY");
  await sendAll("trial_4d", `${trialing} AND t.trial_ends_at BETWEEN NOW(3) + INTERVAL 1 DAY AND NOW(3) + INTERVAL 4 DAY`);
  await sendAll("trial_1d", `${trialing} AND t.trial_ends_at BETWEEN NOW(3) AND NOW(3) + INTERVAL 1 DAY`);
}
