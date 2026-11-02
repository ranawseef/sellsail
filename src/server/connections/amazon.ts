// SellSail's own Amazon SP-API keys. Sellers don't connect Amazon: product
// prices are public, so SellSail reads them for every workspace with its own
// app credentials. A key set comes from one of two places, by slot (1..MAX_APPS):
//
//   - the database (amazon_app_keys), added by an admin on /admin/system and
//     stored encrypted (see amazon-keys.ts). The normal way: SPAPI_n_* vars
//     saved in Hostinger's hPanel never reached the running app.
//   - numbered env vars, still read if present, and they win a slot clash:
//       SPAPI_1_CLIENT_ID, SPAPI_1_CLIENT_SECRET, SPAPI_1_REFRESH_TOKEN
//       SPAPI_2_CLIENT_ID, ...
//
// Each set is one "app" with its own rate budget (getItemOffersBatch: one
// call every 10 s). The apps form a pool shared by all workspaces: a reprice
// run reserves whichever app is free next, so more key sets means more
// listings repriced per hour for everyone.
//
// Optional SPAPI_PROXY (e.g. "http://user:pass@1.2.3.4:8080") sends Amazon
// calls through one proxy; without it they go direct from the server.
//
// Runtime state (cached token, next free slot, health) lives in amazon_apps,
// one row per slot, whichever source the set comes from.

import { accessToken, AmazonError, type LwaClient } from "../integrations/amazon/spapi.ts";
import { DIRECT, EgressBlockedError, parseProxyUrl, ProxyFailureError, viaProxy, type Route } from "../net/egress.ts";
import { decryptString, encryptString, secretContext } from "../crypto/secrets.ts";
import { exec, one, q } from "../db/pool.ts";
import { cleanEnvValue, MAX_APPS, maskedClientId, clientIdHint, readStoredKeySets, SPAPI_FIELDS, type SpapiField, type StoredKeySet } from "./amazon-keys.ts";

export { cleanEnvValue, MAX_APPS, SPAPI_FIELDS, type SpapiField };

/** How long an app that failed to log in sits out before it is tried again. */
export const APP_ERROR_BACKOFF_S = 15 * 60;

export type KeySource = "env" | "db";
export type AmazonApp = { slot: number; client: LwaClient; refreshToken: string; source: KeySource; label: string };

const FIELD_NAMES = Object.keys(SPAPI_FIELDS) as SpapiField[];

/** The key sets configured in env, in slot order. */
export function envApps(env: NodeJS.ProcessEnv = process.env): AmazonApp[] {
  const apps: AmazonApp[] = [];
  for (let slot = 1; slot <= MAX_APPS; slot++) {
    const clientId = cleanEnvValue(env[`SPAPI_${slot}_CLIENT_ID`]);
    const clientSecret = cleanEnvValue(env[`SPAPI_${slot}_CLIENT_SECRET`]);
    const refreshToken = cleanEnvValue(env[`SPAPI_${slot}_REFRESH_TOKEN`]);
    if (clientId && clientSecret && refreshToken) {
      apps.push({ slot, client: { clientId, clientSecret }, refreshToken, source: "env", label: `SPAPI_${slot}_*` });
    }
  }
  return apps;
}

/** Stored sets the pool may use: enabled, and readable. A set that can't be decrypted is skipped, not fatal. */
export function dbApps(stored: StoredKeySet[]): AmazonApp[] {
  const apps: AmazonApp[] = [];
  for (const s of stored) {
    if (!s.enabled || !s.values) continue;
    apps.push({ slot: s.slot, client: { clientId: s.values.clientId, clientSecret: s.values.clientSecret }, refreshToken: s.values.refreshToken, source: "db", label: s.label });
  }
  return apps;
}

/** Env and database sets as one pool, in slot order. Env wins a slot both use. */
export function mergeApps(env: AmazonApp[], db: AmazonApp[]): AmazonApp[] {
  const bySlot = new Map<number, AmazonApp>();
  for (const a of db) if (a.slot >= 1 && a.slot <= MAX_APPS) bySlot.set(a.slot, a);
  for (const a of env) bySlot.set(a.slot, a);
  return [...bySlot.values()].sort((a, b) => a.slot - b.slot);
}

// Decrypted sets are kept in memory briefly so each reservation doesn't read
// and decrypt every row. Admin changes clear it at once in this process; any
// other process picks them up within CACHE_MS. On globalThis because the
// scheduler and the admin actions can load this module in different bundles.
export const APPS_CACHE_MS = 60_000;
type AppsCache = { at: number; apps: Promise<AmazonApp[]> };
const g = globalThis as unknown as { __ssAmazonApps?: AppsCache };

export function invalidateAmazonApps(): void {
  g.__ssAmazonApps = undefined;
}

async function loadApps(): Promise<AmazonApp[]> {
  const stored = await readStoredKeySets();
  for (const s of stored) {
    if (s.enabled && !s.values) console.error(`[amazon] key set ${s.slot} can't be decrypted (was APP_ENCRYPTION_KEY changed?); skipped`);
  }
  return mergeApps(envApps(), dbApps(stored));
}

/** Every key set the pool uses now: env sets plus enabled database sets, in slot order. */
export async function configuredApps(): Promise<AmazonApp[]> {
  const cached = g.__ssAmazonApps;
  if (cached && Date.now() - cached.at < APPS_CACHE_MS) return cached.apps;
  const entry: AppsCache = { at: Date.now(), apps: loadApps() };
  g.__ssAmazonApps = entry;
  entry.apps.catch(() => {
    if (g.__ssAmazonApps === entry) g.__ssAmazonApps = undefined; // don't cache a failure
  });
  return entry.apps;
}

// --- Key diagnostic for /admin/system ----------------------------------------
// Explains why a key set isn't picked up without ever showing a key: only
// facts about each value's shape, and the names of Amazon-looking env vars
// (plus the same shape facts for database sets, below).

/** Facts about one env value. Never the value itself. */
export type SpapiValueShape = {
  /** The variable exists in the process environment (even if empty). */
  present: boolean;
  /** Raw length, before trimming or quote stripping. */
  length: number;
  emptyAfterTrim: boolean;
  /** The trimmed value starts / ends with ' or ". */
  startsWithQuote: boolean;
  endsWithQuote: boolean;
  hasPipe: boolean;
  /** "edges" is harmless (trimmed off); "inside" breaks the key. */
  whitespace: "none" | "edges" | "inside";
  hasNewline: boolean;
  /** Characters outside printable ASCII: curly quotes, zero-width spaces, etc. */
  oddChars: boolean;
  /** The value SellSail would use (trimmed, quotes stripped) starts as Amazon's do. */
  prefixOk: boolean;
};

export type SpapiSlotShape = {
  slot: number;
  /** The env set is complete, so the pool picks it up. */
  used: boolean;
  fields: Record<SpapiField, SpapiValueShape>;
};

export type SpapiEnvName = {
  /** The name, cut short if it looks like a key was pasted into it. */
  name: string;
  /** SellSail reads this exact name (SPAPI_<1..MAX_APPS>_<FIELD> or SPAPI_PROXY). */
  recognised: boolean;
  /** Part of the name was hidden because it looked like a key. */
  hidden: boolean;
};

export type SpapiEnvReport = { slots: SpapiSlotShape[]; names: SpapiEnvName[] };

const AMAZON_NAME = /sp[\s_-]?api|amazon/i;
const KEY_IN_NAME = /amzn1\.|atzr\|/i;

function shapeOf(raw: string | undefined, prefix: string): SpapiValueShape {
  const value = raw ?? "";
  const trimmed = value.trim();
  const clean = cleanEnvValue(raw);
  return {
    present: raw !== undefined,
    length: value.length,
    emptyAfterTrim: trimmed === "",
    startsWithQuote: /^['"]/.test(trimmed),
    endsWithQuote: /['"]$/.test(trimmed),
    hasPipe: value.includes("|"),
    whitespace: /\s/.test(clean) ? "inside" : /\s/.test(value) ? "edges" : "none",
    hasNewline: /[\r\n]/.test(value),
    oddChars: /[^\x20-\x7e]/.test(clean),
    prefixOk: clean.startsWith(prefix),
  };
}

function isRecognisedName(name: string): boolean {
  if (name === "SPAPI_PROXY") return true;
  const m = /^SPAPI_([1-9]\d*)_(CLIENT_ID|CLIENT_SECRET|REFRESH_TOKEN)$/.exec(name);
  return Boolean(m && Number(m[1]) <= MAX_APPS);
}

function safeName(name: string): { name: string; hidden: boolean } {
  const key = KEY_IN_NAME.exec(name);
  let shown = key ? name.slice(0, key.index) : name;
  if (shown.length > 64) shown = shown.slice(0, 64);
  return { name: shown === name ? name : `${shown}…`, hidden: Boolean(key) };
}

/** Shape facts for every key set with at least one var, plus Amazon-looking env names. */
export function describeSpapiEnv(env: NodeJS.ProcessEnv = process.env): SpapiEnvReport {
  const slots: SpapiSlotShape[] = [];
  for (let slot = 1; slot <= MAX_APPS; slot++) {
    const raw = (f: SpapiField) => env[`SPAPI_${slot}_${f}`];
    if (FIELD_NAMES.every((f) => raw(f) === undefined)) continue;
    const fields = Object.fromEntries(FIELD_NAMES.map((f) => [f, shapeOf(raw(f), SPAPI_FIELDS[f])])) as Record<SpapiField, SpapiValueShape>;
    slots.push({ slot, used: FIELD_NAMES.every((f) => cleanEnvValue(raw(f)) !== ""), fields });
  }
  const names = Object.keys(env)
    .filter((n) => AMAZON_NAME.test(n))
    .sort()
    .map((n) => ({ ...safeName(n), recognised: isRecognisedName(n) }));
  return { slots, names };
}

/**
 * How Amazon calls leave the server: through SPAPI_PROXY when set, otherwise
 * direct. A proxy that is set but can't be parsed blocks the calls rather
 * than quietly going direct.
 */
export function amazonRoute(env: NodeJS.ProcessEnv = process.env): { route: Route | null; reason: string } {
  try {
    const proxy = parseProxyUrl(env.SPAPI_PROXY);
    return { route: proxy ? viaProxy(proxy) : DIRECT, reason: "" };
  } catch (err) {
    return { route: null, reason: `SPAPI_PROXY is set but unusable: ${(err as Error).message}` };
  }
}

/** Makes sure every configured slot has a state row. Cheap; safe to call often. */
async function ensureRows(apps: AmazonApp[]): Promise<void> {
  if (apps.length === 0) return;
  const values = apps.map(() => "(?)").join(", ");
  await exec(`INSERT IGNORE INTO amazon_apps (slot) VALUES ${values}`, apps.map((a) => a.slot));
}

/**
 * Waits for, and reserves, the next free app's call slot. Returns the app, or
 * null when none frees up before `canWait(ms)` says to stop. A slot is taken
 * with one conditional UPDATE, so two workers can never share one call.
 */
export async function reserveAmazonApp(
  canWait: (waitMs: number) => boolean,
  sleep: (ms: number) => Promise<void>,
): Promise<AmazonApp | null> {
  const apps = await configuredApps();
  if (apps.length === 0) return null;
  await ensureRows(apps);
  const slots = apps.map((a) => a.slot);

  for (;;) {
    const ready = await one<{ slot: number }>(
      "SELECT slot FROM amazon_apps WHERE slot IN (?) AND next_allowed_at <= NOW(3) ORDER BY next_allowed_at LIMIT 1",
      [slots],
    );
    if (ready) {
      const res = await exec(
        `UPDATE amazon_apps SET next_allowed_at = NOW(3) + INTERVAL (rate_interval_ms * 1000) MICROSECOND
          WHERE slot = ? AND next_allowed_at <= NOW(3)`,
        [ready.slot],
      );
      if (res.affectedRows === 1) return apps.find((a) => a.slot === ready.slot) ?? null;
      continue; // another worker took it first; look again
    }
    const next = await one<{ wait_ms: number }>(
      "SELECT GREATEST(0, MIN(TIMESTAMPDIFF(MICROSECOND, NOW(3), next_allowed_at)) / 1000) AS wait_ms FROM amazon_apps WHERE slot IN (?)",
      [slots],
    );
    const wait = Math.min(Number(next?.wait_ms ?? 1000) + 50, 15_000);
    if (!canWait(wait)) return null;
    await sleep(wait);
  }
}

/** Holds an app back, e.g. after Amazon answered 429. */
export async function backOffAmazonApp(slot: number, seconds: number): Promise<void> {
  await exec("UPDATE amazon_apps SET next_allowed_at = GREATEST(next_allowed_at, NOW(3) + INTERVAL ? SECOND) WHERE slot = ?", [seconds, slot]);
}

/** An access token for an app, cached (encrypted) until shortly before expiry. */
export async function amazonAppToken(app: AmazonApp, route: Route, forceNew = false): Promise<string> {
  const row = await one<{ token_enc: string | null; token_expires_at: Date | null }>(
    "SELECT token_enc, token_expires_at FROM amazon_apps WHERE slot = ?",
    [app.slot],
  );
  if (!forceNew && row?.token_enc && row.token_expires_at && new Date(row.token_expires_at).getTime() > Date.now()) {
    try {
      return decryptString(row.token_enc, secretContext.amazonAppToken(app.slot));
    } catch {
      // fetch a new one
    }
  }
  const token = await accessToken(route, app.client, app.refreshToken);
  await exec("UPDATE amazon_apps SET token_enc = ?, token_expires_at = ? WHERE slot = ?", [
    encryptString(token.accessToken, secretContext.amazonAppToken(app.slot)),
    token.expiresAt,
    app.slot,
  ]);
  return token.accessToken;
}

/** Records whether an app's last call worked. A failing app sits out for a while. */
export async function markAmazonApp(slot: number, ok: boolean, error?: string): Promise<void> {
  if (ok) {
    await exec("UPDATE amazon_apps SET status = 'ok', last_error = NULL, last_ok_at = NOW(3) WHERE slot = ?", [slot]);
    return;
  }
  console.error(`[amazon] app ${slot} failed: ${(error ?? "").slice(0, 200)}`);
  await exec(
    `UPDATE amazon_apps SET status = 'error', last_error = ?, token_enc = NULL,
       next_allowed_at = GREATEST(next_allowed_at, NOW(3) + INTERVAL ? SECOND)
     WHERE slot = ?`,
    [(error ?? "").slice(0, 255), APP_ERROR_BACKOFF_S, slot],
  );
}

/**
 * The result of an admin's Test on /admin/system, kept as the slot's health
 * so the card stops saying "untested". The message is keyTestFailure()'s own
 * words, never Amazon's text. A pass also ends an error backoff, so a set
 * whose keys were fixed is used again at once; a failure adds no backoff
 * (repricing backs off by itself if Amazon refuses it there too).
 */
export async function recordKeySetTest(slot: number, ok: boolean, failure?: string): Promise<void> {
  if (ok) {
    // next_allowed_at is assigned first so it still sees the old status.
    await exec(
      `INSERT INTO amazon_apps (slot, status, last_ok_at) VALUES (?, 'ok', NOW(3))
       ON DUPLICATE KEY UPDATE next_allowed_at = IF(status = 'error', LEAST(next_allowed_at, NOW(3)), next_allowed_at),
         status = 'ok', last_error = NULL, last_ok_at = NOW(3)`,
      [slot],
    );
    return;
  }
  await exec(
    `INSERT INTO amazon_apps (slot, status, last_error) VALUES (?, 'error', ?)
     ON DUPLICATE KEY UPDATE status = 'error', last_error = VALUES(last_error)`,
    [slot, (failure ?? "Test failed").slice(0, 255)],
  );
}

export type AmazonPoolStatus = {
  /** Key sets in the pool (env, plus enabled database sets). */
  configured: number;
  /** Of those, how many are currently working (or not yet tried). */
  healthy: number;
  lastOkAt: Date | null;
  /** Database sets that exist but aren't in the pool (paused, unreadable, or their slot is taken by env). */
  idle: number;
};

/** For the dashboard: is SellSail's Amazon pricing available right now? */
export async function amazonPoolStatus(): Promise<AmazonPoolStatus> {
  const apps = await configuredApps();
  const stored = await one<{ n: number }>("SELECT COUNT(*) AS n FROM amazon_app_keys");
  const inPoolFromDb = apps.filter((a) => a.source === "db").length;
  const idle = Math.max(0, Number(stored?.n ?? 0) - inPoolFromDb);
  if (apps.length === 0) return { configured: 0, healthy: 0, lastOkAt: null, idle };
  const rows = await q<{ slot: number; status: string; last_ok_at: Date | null }>(
    "SELECT slot, status, last_ok_at FROM amazon_apps WHERE slot IN (?)",
    [apps.map((a) => a.slot)],
  );
  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  let healthy = 0;
  let lastOkAt: Date | null = null;
  for (const a of apps) {
    const r = bySlot.get(a.slot);
    if (!r || r.status !== "error") healthy++;
    if (r?.last_ok_at && (!lastOkAt || r.last_ok_at > lastOkAt)) lastOkAt = r.last_ok_at;
  }
  return { configured: apps.length, healthy, lastOkAt, idle };
}

// --- Database sets on /admin/system --------------------------------------------
// Everything below is built for a page, so it carries no key value: a client
// id shows as its last four characters, and secrets not at all.

/** Why a set the admin can see isn't in the pool. */
export type KeySetIdle = "paused" | "undecryptable" | "env_slot";

export type AmazonKeySetView = {
  slot: number;
  label: string;
  source: KeySource;
  enabled: boolean;
  /** In the pool right now. */
  inUse: boolean;
  idle: KeySetIdle | null;
  /** "••••abcd" */
  clientId: string;
  /** Health of the slot's runtime state; null when the slot belongs to another set. */
  status: "untested" | "ok" | "error" | null;
  lastOkAt: Date | null;
  lastError: string | null;
  createdAt: Date | null;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
};

export type AppStateRow = { slot: number; status: string; last_error: string | null; last_ok_at: Date | null };

function health(state: AppStateRow | undefined): Pick<AmazonKeySetView, "status" | "lastOkAt" | "lastError"> {
  const status = state?.status === "ok" || state?.status === "error" ? state.status : "untested";
  return { status, lastOkAt: state?.last_ok_at ?? null, lastError: status === "error" ? (state?.last_error ?? null) : null };
}

/** One row per set the admin can see: env sets, then every stored set, by slot. */
export function buildKeySetViews(env: AmazonApp[], stored: StoredKeySet[], state: AppStateRow[]): AmazonKeySetView[] {
  const bySlot = new Map(state.map((r) => [r.slot, r]));
  const envSlots = new Set(env.map((a) => a.slot));
  const views: AmazonKeySetView[] = env.map((a) => ({
    slot: a.slot,
    label: a.label,
    source: "env",
    enabled: true,
    inUse: true,
    idle: null,
    clientId: maskedClientId(clientIdHint(a.client.clientId)),
    ...health(bySlot.get(a.slot)),
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
  }));
  for (const s of stored) {
    const idle: KeySetIdle | null = envSlots.has(s.slot) ? "env_slot" : !s.values ? "undecryptable" : !s.enabled ? "paused" : null;
    const own = idle !== "env_slot";
    views.push({
      slot: s.slot,
      label: s.label,
      source: "db",
      enabled: s.enabled,
      inUse: idle === null,
      idle,
      clientId: maskedClientId(s.clientIdHint),
      ...(own ? health(bySlot.get(s.slot)) : { status: null, lastOkAt: null, lastError: null }),
      createdAt: s.createdAt,
      createdBy: s.createdBy,
      updatedAt: s.updatedAt,
      updatedBy: s.updatedBy,
    });
  }
  return views.sort((a, b) => a.slot - b.slot || (a.source === b.source ? 0 : a.source === "env" ? -1 : 1));
}

export type DbKeyShape = {
  slot: number;
  label: string;
  /** In the pool right now. */
  used: boolean;
  idle: KeySetIdle | null;
  /** Shape facts for each stored value; null when the row can't be decrypted. */
  fields: Record<SpapiField, SpapiValueShape> | null;
};

/** The Key check's view of stored sets: the same shape facts as for env values. */
export function describeDbKeySets(stored: StoredKeySet[], env: AmazonApp[]): DbKeyShape[] {
  const envSlots = new Set(env.map((a) => a.slot));
  return stored.map((s) => {
    const idle: KeySetIdle | null = envSlots.has(s.slot) ? "env_slot" : !s.values ? "undecryptable" : !s.enabled ? "paused" : null;
    const v = s.values;
    const fields = v
      ? ({
          CLIENT_ID: shapeOf(v.clientId, SPAPI_FIELDS.CLIENT_ID),
          CLIENT_SECRET: shapeOf(v.clientSecret, SPAPI_FIELDS.CLIENT_SECRET),
          REFRESH_TOKEN: shapeOf(v.refreshToken, SPAPI_FIELDS.REFRESH_TOKEN),
        } satisfies Record<SpapiField, SpapiValueShape>)
      : null;
    return { slot: s.slot, label: s.label, used: idle === null, idle, fields };
  });
}

export type AmazonKeyAdminData = { sets: AmazonKeySetView[]; dbShapes: DbKeyShape[]; envReport: SpapiEnvReport; inUse: number; freeSlots: number };

/** Everything the Amazon key sets card on /admin/system shows. No key values. */
export async function amazonKeyAdminData(env: NodeJS.ProcessEnv = process.env): Promise<AmazonKeyAdminData> {
  const fromEnv = envApps(env);
  const stored = await readStoredKeySets();
  const slots = [...new Set([...fromEnv.map((a) => a.slot), ...stored.map((s) => s.slot)])];
  const state = slots.length
    ? await q<AppStateRow>("SELECT slot, status, last_error, last_ok_at FROM amazon_apps WHERE slot IN (?)", [slots])
    : [];
  const sets = buildKeySetViews(fromEnv, stored, state);
  return {
    sets,
    dbShapes: describeDbKeySets(stored, fromEnv),
    envReport: describeSpapiEnv(env),
    inUse: sets.filter((s) => s.inUse).length,
    freeSlots: MAX_APPS - slots.length,
  };
}

/**
 * What an admin is told when a key set's Test fails. Our own words only:
 * Amazon's error text is never passed on, in case it ever echoes a value.
 */
export function keyTestFailure(err: unknown): string {
  if (err instanceof AmazonError) {
    const code = /^[a-z_]{1,40}$/.test(err.code) ? err.code : "";
    if (code === "invalid_client") return "Amazon refused the client ID or client secret (invalid_client).";
    if (code === "invalid_grant") return "Amazon refused the refresh token (invalid_grant). Authorise the app again in Seller Central and paste the new token.";
    if (code === "unauthorized_client") return "Amazon says this app may not use that refresh token (unauthorized_client).";
    if (err.status === 200) return "Amazon answered but gave no access token.";
    return `Amazon refused the login (HTTP ${err.status}${code ? `, ${code}` : ""}).`;
  }
  if (err instanceof EgressBlockedError || err instanceof ProxyFailureError) return "Couldn't reach Amazon through SPAPI_PROXY. Check the proxy.";
  return "Couldn't reach Amazon. Try again in a minute.";
}

/** Asks Login with Amazon for an access token with one set. Resolves when it works; the token is thrown away. */
export async function testKeySet(app: Pick<AmazonApp, "client" | "refreshToken">, route: Route): Promise<void> {
  await accessToken(route, app.client, app.refreshToken);
}
