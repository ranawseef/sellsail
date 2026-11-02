// Customer activity: the event types SellSail records about each seller and
// what their repricer did, and the cleaner every event detail goes through.
// Pure, so tests and the admin pages share it with the writer in
// src/server/activity.ts.
//
// Details are small JSON objects of counts, ids, setting names and our own
// short messages. cleanDetail() is the safety net, not the plan: it drops any
// key that sounds like a secret and masks values that look like keys, tokens,
// card numbers or email addresses, so a careless call can't store one.

export type ActivityCategory = "account" | "onbuy" | "listings" | "repricer" | "stock" | "billing" | "errors";

type TypeInfo = { label: string; category: ActivityCategory; problem?: boolean };

/** Every type that may be recorded. Adding one here is the only way to record something new. */
export const ACTIVITY_TYPES = {
  "auth.signed_up": { label: "Signed up", category: "account" },
  "auth.email_verified": { label: "Email verified", category: "account" },
  "auth.signed_in": { label: "Signed in", category: "account" },
  "auth.signed_out": { label: "Signed out", category: "account" },
  "auth.sign_in_failed": { label: "Sign-in failed", category: "account", problem: true },
  "auth.password_reset_requested": { label: "Password reset requested", category: "account" },
  "auth.password_reset": { label: "Password reset", category: "account" },
  "auth.password_changed": { label: "Password changed", category: "account" },

  "onbuy.connected": { label: "OnBuy connected", category: "onbuy" },
  "onbuy.disconnected": { label: "OnBuy disconnected", category: "onbuy" },
  "onbuy.test_failed": { label: "OnBuy connection test failed", category: "onbuy", problem: true },
  "proxy.saved": { label: "Proxy saved", category: "onbuy" },
  "proxy.removed": { label: "Proxy removed", category: "onbuy" },
  "proxy.test_failed": { label: "Proxy test failed", category: "onbuy", problem: true },

  "listings.import_started": { label: "OnBuy import started", category: "listings" },
  "listings.imported": { label: "OnBuy import finished", category: "listings" },
  "listings.csv_uploaded": { label: "CSV uploaded", category: "listings" },

  "repricer.settings_changed": { label: "Repricer settings changed", category: "repricer" },
  "repricer.bands_changed": { label: "Pricing bands changed", category: "repricer" },
  "repricer.competition_changed": { label: "Competition settings changed", category: "repricer" },
  "repricer.enabled": { label: "Setup finished, repricer on", category: "repricer" },
  "repricer.paused": { label: "Repricer paused", category: "repricer" },
  "repricer.resumed": { label: "Repricer resumed", category: "repricer" },
  "reprice.hourly": { label: "Repricing, hourly summary", category: "repricer" },
  "reprice.first_success": { label: "First successful reprice", category: "repricer" },
  "reprice.first_price_change": { label: "First price changed", category: "repricer" },
  "reprice.failing": { label: "Repricing started failing", category: "repricer", problem: true },
  "reprice.recovered": { label: "Repricing working again", category: "repricer" },

  "stock_sync.hourly": { label: "OnBuy sync, hourly summary", category: "stock" },
  "stock_sync.failing": { label: "OnBuy sync started failing", category: "stock", problem: true },
  "stock_sync.recovered": { label: "OnBuy sync working again", category: "stock" },
  "stock_sync.stale_out_of_stock": { label: "Stale listings set out of stock", category: "stock", problem: true },

  "billing.checkout_started": { label: "Checkout opened", category: "billing" },
  "billing.subscription_changed": { label: "Subscription changed", category: "billing" },
  "billing.payment_failed": { label: "Payment failed", category: "billing", problem: true },
  "billing.payment_action_required": { label: "Payment needs confirming", category: "billing", problem: true },
  "billing.admin_change": { label: "Plan changed by SellSail", category: "billing" },
  "billing.free_access_ended": { label: "Free access ended", category: "billing" },

  "error.shown": { label: "Error shown to the seller", category: "errors", problem: true },
} as const satisfies Record<string, TypeInfo>;

export type ActivityType = keyof typeof ACTIVITY_TYPES;

export const ACTIVITY_TYPE_LIST = Object.keys(ACTIVITY_TYPES) as ActivityType[];

export function isActivityType(t: unknown): t is ActivityType {
  return typeof t === "string" && Object.hasOwn(ACTIVITY_TYPES, t);
}

/** Types shown as problems (red) in the timeline and in "recent errors". */
export const PROBLEM_TYPES = ACTIVITY_TYPE_LIST.filter((t) => (ACTIVITY_TYPES[t] as TypeInfo).problem);

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  account: "Account",
  onbuy: "OnBuy and proxy",
  listings: "Listings",
  repricer: "Repricer",
  stock: "OnBuy sync",
  billing: "Billing",
  errors: "Problems only",
};

/** The types a timeline filter value stands for: a category, one type, or everything (null). */
export function typesForFilter(filter: string | null | undefined): ActivityType[] | null {
  if (!filter) return null;
  // "Problems only" is every problem type, whatever its category.
  if (filter === "errors") return PROBLEM_TYPES;
  if (isActivityType(filter)) return [filter];
  const inCategory = ACTIVITY_TYPE_LIST.filter((t) => ACTIVITY_TYPES[t].category === filter);
  return inCategory.length ? inCategory : null;
}

/** Names of the fields whose value differs, for "settings changed" events: which setting, never its value. */
export function changedKeys(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)).sort();
}

// ---- detail cleaning ---------------------------------------------------------------

export type DetailValue = string | number | boolean | null | DetailValue[] | { [k: string]: DetailValue };
export type ActivityDetail = Record<string, DetailValue>;

export const DETAIL_MAX_CHARS = 1000;
const STRING_MAX = 200;
const KEYS_MAX = 20;
const ITEMS_MAX = 20;

/** Keys that are never stored, whatever their value. */
const SECRET_KEY = /pass(word|wd|phrase)?|secret|token|api_?key|consumer_?key|private_?key|credential|card|cvc|cvv|iban|sort_?code|account_?number|cookie|session|authori[sz]ation|bearer|refresh|signature|^(code|otp|pin|key|keys)$/i;
const KEY_SHAPE = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

/** Masks anything in a string that looks like a credential or personal identifier. */
export function scrubText(s: string): string {
  return (
    s
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s/@:]+:[^\s/@]+@/gi, "[redacted]@") // user:pass@ in a URL
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
      .replace(/amzn1\.[A-Za-z0-9._-]+/g, "[redacted]")
      .replace(/Atzr\|[^\s"',;]+/gi, "[redacted]")
      .replace(/\b(?:sk|rk|pk|whsec)_(?:live|test)_[A-Za-z0-9]+/g, "[redacted]")
      .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
      .replace(/\b(?:\d[ -]?){12,18}\d\b/g, "[redacted]") // card-length digit runs
      .replace(/[A-Za-z0-9+/=_-]{32,}/g, "[redacted]") // long opaque tokens
      .trim()
  );
}

function cleanValue(v: unknown, depth: number): DetailValue | undefined {
  if (v === null) return null;
  switch (typeof v) {
    case "string":
      return scrubText(v).slice(0, STRING_MAX);
    case "number":
      return Number.isFinite(v) ? Math.round(v * 10_000) / 10_000 : null;
    case "bigint":
      return Number(v);
    case "boolean":
      return v;
    case "object": {
      if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();
      if (depth >= 2) return undefined;
      if (Array.isArray(v)) {
        return v
          .slice(0, ITEMS_MAX)
          .map((x) => cleanValue(x, depth + 1))
          .filter((x): x is DetailValue => x !== undefined);
      }
      return cleanObject(v as Record<string, unknown>, depth + 1);
    }
    default:
      return undefined; // functions, symbols, undefined
  }
}

function cleanObject(o: Record<string, unknown>, depth: number): ActivityDetail {
  const out: ActivityDetail = {};
  let n = 0;
  for (const [k, v] of Object.entries(o)) {
    if (n >= KEYS_MAX) break;
    if (!KEY_SHAPE.test(k) || SECRET_KEY.test(k)) continue;
    const c = cleanValue(v, depth);
    if (c === undefined) continue;
    out[k] = c;
    n++;
  }
  return out;
}

/**
 * A detail object safe to store: plain values only, secret-sounding keys
 * dropped, secret-looking text masked, at most DETAIL_MAX_CHARS as JSON.
 */
export function cleanDetail(input: unknown): ActivityDetail {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out = cleanObject(input as Record<string, unknown>, 0);
  if (JSON.stringify(out).length <= DETAIL_MAX_CHARS) return out;
  // Too big: keep the numbers and flags, which is what the admin pages read.
  const small: ActivityDetail = { truncated: true };
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "number" || typeof v === "boolean") small[k] = v;
  }
  return small;
}

/** Reads a stored detail back; anything unreadable becomes {}. */
export function parseDetail(raw: unknown): ActivityDetail {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as ActivityDetail) : {};
  } catch {
    return {};
  }
}
