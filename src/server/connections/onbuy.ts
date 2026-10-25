// The workspace's OnBuy account: encrypted keys, a cached access token, and
// a TokenSource the jobs use.

import { OnBuyError, requestToken, type OnBuyCreds, type TokenSource } from "../integrations/onbuy/client.ts";
import type { Route } from "../net/egress.ts";
import { decryptJson, decryptString, encryptJson, encryptString, maskSecret, secretContext } from "../crypto/secrets.ts";
import { exec, one, tx } from "../db/pool.ts";
import { ensureJob } from "../jobs/registry.ts";

export type MarketplaceAccount = {
  id: number;
  tenantId: number;
  siteId: number;
  keyHint: string;
  status: "untested" | "connected" | "error";
  lastError: string | null;
  lastOkAt: Date | null;
};

const COLS = "id, tenant_id AS tenantId, site_id AS siteId, key_hint AS keyHint, status, last_error AS lastError, last_ok_at AS lastOkAt";

export async function getOnBuyAccount(tenantId: number): Promise<MarketplaceAccount | null> {
  return one<MarketplaceAccount>(`SELECT ${COLS} FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'`, [tenantId]);
}

export function parseOnBuyKeys(consumerKey: string, secretKey: string): OnBuyCreds | string {
  const c = consumerKey.trim();
  const s = secretKey.trim();
  if (!c || !s) return "Enter both the consumer key and the secret key.";
  if (c.length > 200 || s.length > 200 || /\s/.test(c + s)) return "Those keys don't look right. Copy them again from OnBuy's API settings page.";
  return { consumerKey: c, secretKey: s };
}

/**
 * Proves the keys work by requesting a token on the workspace's route, then stores
 * them (and the token) encrypted. Nothing is saved when the test fails.
 */
export async function connectOnBuy(tenantId: number, route: Route, creds: OnBuyCreds): Promise<MarketplaceAccount> {
  const token = await requestToken(route, creds);
  const credsEnc = encryptJson(creds, secretContext.marketplaceCredentials(tenantId, "onbuy"));
  const tokenEnc = encryptString(token.accessToken, secretContext.marketplaceToken(tenantId, "onbuy"));
  await tx(async (t) => {
    await t.exec(
      `INSERT INTO marketplace_accounts (tenant_id, marketplace, site_id, credentials_enc, key_hint, token_enc, token_expires_at, status, last_error, last_ok_at)
       VALUES (?, 'onbuy', 2000, ?, ?, ?, ?, 'connected', NULL, NOW(3))
       ON DUPLICATE KEY UPDATE credentials_enc = VALUES(credentials_enc), key_hint = VALUES(key_hint),
         token_enc = VALUES(token_enc), token_expires_at = VALUES(token_expires_at),
         status = 'connected', last_error = NULL, last_ok_at = NOW(3)`,
      [tenantId, credsEnc, maskSecret(creds.consumerKey), tokenEnc, token.expiresAt],
    );
    const acc = await t.q<{ id: number }>("SELECT id FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'", [tenantId]);
    await ensureJob(tenantId, "push", acc[0].id, {}, t);
    await ensureJob(tenantId, "compete", acc[0].id, {}, t);
  });
  const acc = await getOnBuyAccount(tenantId);
  if (!acc) throw new Error("OnBuy account vanished after saving");
  return acc;
}

export async function markOnBuyStatus(tenantId: number, ok: boolean, error?: string): Promise<void> {
  if (ok) {
    await exec(
      "UPDATE marketplace_accounts SET status = 'connected', last_error = NULL, last_ok_at = NOW(3) WHERE tenant_id = ? AND marketplace = 'onbuy'",
      [tenantId],
    );
  } else {
    await exec("UPDATE marketplace_accounts SET status = 'error', last_error = ? WHERE tenant_id = ? AND marketplace = 'onbuy'", [
      (error ?? "").slice(0, 255),
      tenantId,
    ]);
  }
}

/** Tokens for jobs: the cached one while valid, a new one (stored) on renew. */
export function onbuyTokens(tenantId: number, route: Route): TokenSource {
  const renew = async () => {
    const row = await one<{ credentials_enc: string }>(
      "SELECT credentials_enc FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'",
      [tenantId],
    );
    if (!row) throw new Error("OnBuy is not connected");
    let creds: OnBuyCreds;
    try {
      creds = decryptJson<OnBuyCreds>(row.credentials_enc, secretContext.marketplaceCredentials(tenantId, "onbuy"));
    } catch {
      throw new OnBuyError("The saved OnBuy keys can't be read (was the encryption key changed?). Enter them again under Connections.", 401);
    }
    const token = await requestToken(route, creds);
    await exec("UPDATE marketplace_accounts SET token_enc = ?, token_expires_at = ? WHERE tenant_id = ? AND marketplace = 'onbuy'", [
      encryptString(token.accessToken, secretContext.marketplaceToken(tenantId, "onbuy")),
      token.expiresAt,
      tenantId,
    ]);
    return token.accessToken;
  };
  return {
    async get() {
      const row = await one<{ token_enc: string | null; token_expires_at: Date | null }>(
        "SELECT token_enc, token_expires_at FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'",
        [tenantId],
      );
      if (row?.token_enc && row.token_expires_at && new Date(row.token_expires_at).getTime() > Date.now()) {
        try {
          return decryptString(row.token_enc, secretContext.marketplaceToken(tenantId, "onbuy"));
        } catch {
          // fall through and fetch a new one
        }
      }
      return renew();
    },
    renew,
  };
}

export async function disconnectOnBuy(tenantId: number): Promise<void> {
  await tx(async (t) => {
    const acc = await t.q<{ id: number }>("SELECT id FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'", [tenantId]);
    if (!acc[0]) return;
    await t.exec("DELETE FROM jobs WHERE tenant_id = ? AND kind IN ('push','import','compete') AND target_id = ?", [tenantId, acc[0].id]);
    await t.exec("DELETE FROM marketplace_accounts WHERE id = ? AND tenant_id = ?", [acc[0].id, tenantId]);
  });
}
