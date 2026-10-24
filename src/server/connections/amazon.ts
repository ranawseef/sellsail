// SellSail's own Amazon SP-API keys. Sellers don't connect Amazon: product
// prices are public, so SellSail reads them for every workspace with its own
// app credentials, set as numbered env vars (1..MAX_APPS):
//
//   SPAPI_1_CLIENT_ID, SPAPI_1_CLIENT_SECRET, SPAPI_1_REFRESH_TOKEN
//   SPAPI_2_CLIENT_ID, ...
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
// one row per slot. The keys themselves never touch the database.

import { accessToken, type LwaClient } from "../integrations/amazon/spapi.ts";
import { DIRECT, parseProxyUrl, viaProxy, type Route } from "../net/egress.ts";
import { decryptString, encryptString, secretContext } from "../crypto/secrets.ts";
import { exec, one, q } from "../db/pool.ts";

export const MAX_APPS = 20;
/** How long an app that failed to log in sits out before it is tried again. */
export const APP_ERROR_BACKOFF_S = 15 * 60;

export type AmazonApp = { slot: number; client: LwaClient; refreshToken: string };

/** The key sets configured in env, in slot order. */
export function configuredApps(env: NodeJS.ProcessEnv = process.env): AmazonApp[] {
  const apps: AmazonApp[] = [];
  for (let slot = 1; slot <= MAX_APPS; slot++) {
    const clientId = env[`SPAPI_${slot}_CLIENT_ID`]?.trim();
    const clientSecret = env[`SPAPI_${slot}_CLIENT_SECRET`]?.trim();
    const refreshToken = env[`SPAPI_${slot}_REFRESH_TOKEN`]?.trim();
    if (clientId && clientSecret && refreshToken) apps.push({ slot, client: { clientId, clientSecret }, refreshToken });
  }
  return apps;
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
  const apps = configuredApps();
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

export type AmazonPoolStatus = {
  /** Key sets configured in env. */
  configured: number;
  /** Of those, how many are currently working (or not yet tried). */
  healthy: number;
  lastOkAt: Date | null;
};

/** For the dashboard: is SellSail's Amazon pricing available right now? */
export async function amazonPoolStatus(): Promise<AmazonPoolStatus> {
  const apps = configuredApps();
  if (apps.length === 0) return { configured: 0, healthy: 0, lastOkAt: null };
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
  return { configured: apps.length, healthy, lastOkAt };
}
