// Onboarding progress and "needs attention" for the admin panel, as pure
// rules over facts the repo reads (activity-repo.ts), so they are tested with
// fake data and the pages, the overview and the tests can't disagree.

import { canRunJobs } from "../../config/plans.ts";

export type AccountFacts = {
  userId: number;
  email: string;
  userName: string;
  tenantId: number;
  tenantName: string;
  signedUpAt: Date;
  emailVerifiedAt: Date | null;
  /** users.last_login_at: the latest password sign-in (not set by sign-up). */
  lastLoginAt: Date | null;
  /** The first auth.signed_in activity row, if still within retention. */
  firstSignInAt: Date | null;
  /** The OnBuy connection as it is now (null: none). */
  onbuyStatus: string | null;
  onbuyConnectedAt: Date | null;
  /** The first onbuy.connected activity row: connected once, maybe removed since. */
  onbuyFirstConnectedAt: Date | null;
  listings: number;
  firstImportAt: Date | null;
  onboardedAt: Date | null;
  repriceJobEnabled: boolean;
  paused: boolean;
  firstRepriceAt: Date | null;
  firstPriceChangeAt: Date | null;
  repriceFailures24h: number;
  plan: string;
  planStatus: string;
  trialEndsAt: Date | null;
  compUntil: Date | null;
  priceChanges7d: number;
};

export type OnboardingStep = { key: string; label: string; done: boolean; at: Date | null; note?: string };

const earliest = (...ds: (Date | null | undefined)[]): Date | null =>
  ds.filter((d): d is Date => d instanceof Date).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;

/**
 * "First login" means the seller got into the dashboard: sign-up opens a
 * session but the dashboard stays shut until the email is confirmed, which is
 * done inside that session, so a confirmed email or any password sign-in counts.
 */
export function firstLoginAt(f: Pick<AccountFacts, "emailVerifiedAt" | "lastLoginAt" | "firstSignInAt">): Date | null {
  return earliest(f.firstSignInAt, f.emailVerifiedAt, f.lastLoginAt);
}

/** The eight steps from sign-up to the first price the repricer changed. */
export function onboardingSteps(f: AccountFacts): OnboardingStep[] {
  const onbuyAt = earliest(f.onbuyFirstConnectedAt, f.onbuyConnectedAt);
  const login = firstLoginAt(f);
  return [
    { key: "signed_up", label: "Signed up", done: true, at: f.signedUpAt },
    { key: "verified", label: "Verified email", done: f.emailVerifiedAt !== null, at: f.emailVerifiedAt },
    { key: "first_login", label: "First login", done: login !== null, at: login },
    {
      key: "onbuy",
      label: "OnBuy connected",
      done: onbuyAt !== null,
      at: onbuyAt,
      note: onbuyAt && !f.onbuyStatus ? "Disconnected since" : f.onbuyStatus === "error" ? "Connection now failing" : undefined,
    },
    { key: "imported", label: "Products imported", done: f.listings > 0 || f.firstImportAt !== null, at: f.firstImportAt, note: f.listings > 0 ? `${f.listings} listings now` : undefined },
    {
      key: "repricer_on",
      label: "Repricer enabled",
      done: f.onboardedAt !== null && f.repriceJobEnabled,
      at: f.onboardedAt,
      note: f.paused ? "Paused now" : undefined,
    },
    { key: "first_reprice", label: "First successful reprice", done: f.firstRepriceAt !== null, at: f.firstRepriceAt },
    { key: "first_change", label: "First price changed", done: f.firstPriceChangeAt !== null, at: f.firstPriceChangeAt },
  ];
}

// ---- needs attention ---------------------------------------------------------------

/** Sign-ups older than this are no longer chased for the first two rules. */
export const ATTENTION_LOOKBACK_DAYS = 30;
export const NEVER_LOGGED_IN_AFTER_H = 24;
export const NO_ONBUY_AFTER_H = 48;
export const NO_REPRICE_AFTER_H = 24;
export const REPEATED_ERRORS_24H = 3;
export const TRIAL_ENDING_DAYS = 3;
/** "Low usage" for a trial about to end: almost nothing imported, or nothing repriced this week. */
export const LOW_USAGE_LISTINGS = 10;

export type AttentionKey = "repeated_errors" | "no_reprice" | "trial_low_usage" | "no_onbuy" | "never_logged_in";
export type AttentionReason = { key: AttentionKey; label: string; detail: string };

/** Most urgent first: this is the order the overview lists them in. */
export const ATTENTION_ORDER: AttentionKey[] = ["repeated_errors", "no_reprice", "trial_low_usage", "no_onbuy", "never_logged_in"];

const hoursSince = (d: Date, now: Date) => (now.getTime() - d.getTime()) / 3600_000;

/** Why this seller may need a nudge, or [] when nothing is wrong. */
export function attentionReasons(f: AccountFacts, now = new Date()): AttentionReason[] {
  const out: AttentionReason[] = [];
  const recent = (d: Date) => hoursSince(d, now) <= ATTENTION_LOOKBACK_DAYS * 24;

  if (f.repriceFailures24h >= REPEATED_ERRORS_24H) {
    out.push({ key: "repeated_errors", label: "Repricing keeps failing", detail: `${f.repriceFailures24h} failed reprice runs in the last 24 hours` });
  }

  const mayRun = canRunJobs({ plan: f.plan, planStatus: f.planStatus, trialEndsAt: f.trialEndsAt, paused: f.paused }, now);
  if (f.onbuyStatus === "connected" && f.onbuyConnectedAt && !f.firstRepriceAt && mayRun && hoursSince(f.onbuyConnectedAt, now) >= NO_REPRICE_AFTER_H) {
    out.push({
      key: "no_reprice",
      label: "Connected, never repriced",
      detail: f.listings === 0 ? "OnBuy connected but no listings imported" : `OnBuy connected, ${f.listings} listings, no successful reprice yet`,
    });
  }

  if (f.planStatus === "trialing" && !f.compUntil && f.trialEndsAt) {
    const left = f.trialEndsAt.getTime() - now.getTime();
    const low = f.listings < LOW_USAGE_LISTINGS || f.priceChanges7d === 0;
    if (left > 0 && left <= TRIAL_ENDING_DAYS * 86400_000 && low) {
      const days = Math.max(1, Math.ceil(left / 86400_000));
      out.push({
        key: "trial_low_usage",
        label: "Trial ending, low usage",
        detail: `Trial ends in ${days} day${days === 1 ? "" : "s"}: ${f.listings} listings, ${f.priceChanges7d} price changes this week`,
      });
    }
  }

  if (f.emailVerifiedAt && recent(f.emailVerifiedAt) && !f.onbuyStatus && !f.onbuyFirstConnectedAt && hoursSince(f.emailVerifiedAt, now) >= NO_ONBUY_AFTER_H) {
    out.push({ key: "no_onbuy", label: "Verified, no OnBuy connection", detail: `Email verified ${Math.floor(hoursSince(f.emailVerifiedAt, now) / 24)} days ago, OnBuy never connected` });
  }

  if (recent(f.signedUpAt) && hoursSince(f.signedUpAt, now) >= NEVER_LOGGED_IN_AFTER_H && firstLoginAt(f) === null) {
    out.push({ key: "never_logged_in", label: "Signed up, never logged in", detail: "Never confirmed the email or signed in after signing up" });
  }

  return out.sort((a, b) => ATTENTION_ORDER.indexOf(a.key) - ATTENTION_ORDER.indexOf(b.key));
}
