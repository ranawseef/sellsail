// Onboarding progress and "needs attention" rules, with fake accounts.

import { test } from "node:test";
import assert from "node:assert/strict";
import { attentionReasons, firstLoginAt, onboardingSteps, type AccountFacts } from "../src/server/admin/activity-rules.ts";

const NOW = new Date("2026-11-02T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000);
const inHours = (h: number) => new Date(NOW.getTime() + h * 3600_000);

/** A seller who signed up 3 days ago and did nothing else. */
function facts(over: Partial<AccountFacts> = {}): AccountFacts {
  return {
    userId: 1,
    email: "seller@example.com",
    userName: "Sam",
    tenantId: 10,
    tenantName: "Sam's Shop",
    signedUpAt: hoursAgo(72),
    emailVerifiedAt: null,
    lastLoginAt: null,
    firstSignInAt: null,
    onbuyStatus: null,
    onbuyConnectedAt: null,
    onbuyFirstConnectedAt: null,
    listings: 0,
    firstImportAt: null,
    onboardedAt: null,
    repriceJobEnabled: true,
    paused: false,
    firstRepriceAt: null,
    firstPriceChangeAt: null,
    repriceFailures24h: 0,
    plan: "trial",
    planStatus: "trialing",
    trialEndsAt: inHours(11 * 24),
    compUntil: null,
    priceChanges7d: 0,
    ...over,
  };
}
const keys = (f: AccountFacts) => attentionReasons(f, NOW).map((r) => r.key);

test("onboarding: eight steps in order, ticked from the facts", () => {
  const none = onboardingSteps(facts());
  assert.deepEqual(none.map((s) => s.key), ["signed_up", "verified", "first_login", "onbuy", "imported", "repricer_on", "first_reprice", "first_change"]);
  assert.deepEqual(none.map((s) => s.done), [true, false, false, false, false, false, false, false]);

  const all = onboardingSteps(
    facts({
      emailVerifiedAt: hoursAgo(70),
      lastLoginAt: hoursAgo(2),
      onbuyStatus: "connected",
      onbuyConnectedAt: hoursAgo(60),
      listings: 240,
      firstImportAt: hoursAgo(59),
      onboardedAt: hoursAgo(58),
      firstRepriceAt: hoursAgo(57),
      firstPriceChangeAt: hoursAgo(56),
    }),
  );
  assert.ok(all.every((s) => s.done));
  assert.equal(all.find((s) => s.key === "first_login")?.at?.getTime(), hoursAgo(70).getTime(), "the earliest sign of being in the dashboard");
  assert.equal(all.find((s) => s.key === "imported")?.note, "240 listings now");
});

test("onboarding: the repricer counts as on only with setup finished and its job enabled; pause is noted", () => {
  const off = onboardingSteps(facts({ onboardedAt: hoursAgo(5), repriceJobEnabled: false })).find((s) => s.key === "repricer_on");
  assert.equal(off?.done, false);
  const paused = onboardingSteps(facts({ onboardedAt: hoursAgo(5), paused: true })).find((s) => s.key === "repricer_on");
  assert.equal(paused?.done, true);
  assert.equal(paused?.note, "Paused now");
  // Connected once and removed since still counts as done, with a note.
  const gone = onboardingSteps(facts({ onbuyFirstConnectedAt: hoursAgo(30) })).find((s) => s.key === "onbuy");
  assert.equal(gone?.done, true);
  assert.equal(gone?.note, "Disconnected since");
});

test("first login: a confirmed email or a password sign-in, whichever came first", () => {
  assert.equal(firstLoginAt({ emailVerifiedAt: null, lastLoginAt: null, firstSignInAt: null }), null);
  assert.equal(firstLoginAt({ emailVerifiedAt: hoursAgo(3), lastLoginAt: hoursAgo(1), firstSignInAt: null })?.getTime(), hoursAgo(3).getTime());
  assert.equal(firstLoginAt({ emailVerifiedAt: null, lastLoginAt: hoursAgo(1), firstSignInAt: hoursAgo(9) })?.getTime(), hoursAgo(9).getTime());
});

test("signed up but never logged in: after 24 hours, within 30 days", () => {
  assert.deepEqual(keys(facts()), ["never_logged_in"]);
  assert.deepEqual(keys(facts({ signedUpAt: hoursAgo(23) })), [], "give them a day");
  assert.deepEqual(keys(facts({ signedUpAt: hoursAgo(31 * 24) })), [], "older sign-ups are not chased");
  assert.deepEqual(keys(facts({ lastLoginAt: hoursAgo(1) })), []);
});

test("verified but no OnBuy connection after 48 hours", () => {
  assert.deepEqual(keys(facts({ emailVerifiedAt: hoursAgo(49) })), ["no_onbuy"]);
  assert.deepEqual(keys(facts({ emailVerifiedAt: hoursAgo(47) })), []);
  assert.deepEqual(keys(facts({ emailVerifiedAt: hoursAgo(49), onbuyStatus: "connected", onbuyConnectedAt: hoursAgo(2) })), []);
  assert.deepEqual(keys(facts({ emailVerifiedAt: hoursAgo(49), onbuyFirstConnectedAt: hoursAgo(40) })), [], "connected once: a different problem");
});

test("connected but no successful reprice, once repricing could have run for a day", () => {
  const connected = { emailVerifiedAt: hoursAgo(70), onbuyStatus: "connected", onbuyConnectedAt: hoursAgo(25), listings: 50 };
  const r = attentionReasons(facts(connected), NOW);
  assert.deepEqual(r.map((x) => x.key), ["no_reprice"]);
  assert.match(r[0].detail, /50 listings/);
  assert.match(attentionReasons(facts({ ...connected, listings: 0 }), NOW)[0].detail, /no listings imported/);
  assert.deepEqual(keys(facts({ ...connected, onbuyConnectedAt: hoursAgo(20) })), []);
  assert.deepEqual(keys(facts({ ...connected, firstRepriceAt: hoursAgo(1) })), []);
  // Paused, or a trial that ended, can't reprice: not this rule.
  assert.deepEqual(keys(facts({ ...connected, paused: true })), []);
  assert.deepEqual(keys(facts({ ...connected, trialEndsAt: hoursAgo(1) })), []);
});

test("repeated reprice errors: 3 or more failed runs in 24 hours, listed first", () => {
  assert.deepEqual(keys(facts({ lastLoginAt: hoursAgo(1), repriceFailures24h: 2 })), []);
  assert.deepEqual(keys(facts({ lastLoginAt: hoursAgo(1), repriceFailures24h: 3 })), ["repeated_errors"]);
  assert.deepEqual(keys(facts({ repriceFailures24h: 5 })), ["repeated_errors", "never_logged_in"]);
});

test("trial ending within 3 days with low usage", () => {
  const busy = { lastLoginAt: hoursAgo(1), listings: 500, priceChanges7d: 300, firstRepriceAt: hoursAgo(100) };
  assert.deepEqual(keys(facts({ ...busy, trialEndsAt: inHours(48) })), [], "busy seller: no nudge");
  assert.deepEqual(keys(facts({ ...busy, listings: 9, trialEndsAt: inHours(48) })), ["trial_low_usage"]);
  assert.deepEqual(keys(facts({ ...busy, priceChanges7d: 0, trialEndsAt: inHours(48) })), ["trial_low_usage"]);
  assert.match(attentionReasons(facts({ ...busy, listings: 2, trialEndsAt: inHours(30) }), NOW)[0].detail, /ends in 2 days/);
  assert.deepEqual(keys(facts({ ...busy, listings: 2, trialEndsAt: inHours(4 * 24) })), [], "more than 3 days left");
  assert.deepEqual(keys(facts({ ...busy, listings: 2, trialEndsAt: hoursAgo(1) })), [], "already ended");
  assert.deepEqual(keys(facts({ ...busy, listings: 2, trialEndsAt: inHours(48), compUntil: inHours(500) })), [], "free access, not a trial");
  assert.deepEqual(keys(facts({ ...busy, listings: 2, trialEndsAt: inHours(48), planStatus: "active" })), []);
});
