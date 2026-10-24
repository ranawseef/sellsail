// The workspace's Amazon SP-API accounts. Each one is a shard with its own
// rate budget. Two ways to connect:
//   oauth  the seller approves SellSail's app in Seller Central; we keep the
//          refresh token, SellSail's LWA client id/secret come from env vars.
//   self   the seller brings their own private app (client id, secret and a
//          self-authorised refresh token).

import { createHash, randomBytes } from "node:crypto";
import {
  accessToken,
  amazonErrorText,
  AmazonError,
  batchResponses,
  consentUrl,
  exchangeAuthCode,
  itemOffersBatch,
  type LwaClient,
} from "../integrations/amazon/spapi.ts";
import type { ProxyConfig } from "../net/egress.ts";
import { decryptJson, decryptString, encryptJson, encryptString, maskSecret, secretContext } from "../crypto/secrets.ts";
import { exec, one, q, tx } from "../db/pool.ts";
import { ensureJob, rebalanceShards } from "../jobs/registry.ts";
import { planFor } from "../../config/plans.ts";

export type SourceAccount = {
  id: number;
  label: string;
  mode: "oauth" | "self";
  sellingPartnerId: string | null;
  keyHint: string;
  status: "untested" | "connected" | "error";
  lastError: string | null;
  lastOkAt: Date | null;
  nextAllowedAt: Date;
  rateIntervalMs: number;
};

type StoredCreds = { refreshToken: string; clientId?: string; clientSecret?: string };

const COLS = `id, label, mode, selling_partner_id AS sellingPartnerId, key_hint AS keyHint, status,
  last_error AS lastError, last_ok_at AS lastOkAt, next_allowed_at AS nextAllowedAt, rate_interval_ms AS rateIntervalMs`;

export async function listAmazonAccounts(tenantId: number): Promise<SourceAccount[]> {
  return q<SourceAccount>(`SELECT ${COLS} FROM source_accounts WHERE tenant_id = ? AND source = 'amazon' ORDER BY id`, [tenantId]);
}

/** SellSail's own SP-API app, for the OAuth route. Null when not configured. */
export function appClient(): (LwaClient & { appId: string; draft: boolean }) | null {
  const clientId = process.env.SPAPI_LWA_CLIENT_ID;
  const clientSecret = process.env.SPAPI_LWA_CLIENT_SECRET;
  const appId = process.env.SPAPI_APP_ID;
  if (!clientId || !clientSecret || !appId) return null;
  return { clientId, clientSecret, appId, draft: process.env.SPAPI_DRAFT_APP === "1" };
}

function clientFor(creds: StoredCreds): LwaClient {
  if (creds.clientId && creds.clientSecret) return { clientId: creds.clientId, clientSecret: creds.clientSecret };
  const app = appClient();
  if (!app) throw new Error("SellSail's Amazon app is not configured (SPAPI_LWA_CLIENT_ID / SPAPI_LWA_CLIENT_SECRET)");
  return app;
}

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitError";
  }
}

async function assertAccountRoom(tenantId: number): Promise<void> {
  const t = await one<{ plan: string; n: number }>(
    "SELECT t.plan, (SELECT COUNT(*) FROM source_accounts s WHERE s.tenant_id = t.id AND s.source = 'amazon') AS n FROM tenants t WHERE t.id = ?",
    [tenantId],
  );
  const plan = planFor(t?.plan);
  if (Number(t?.n ?? 0) >= plan.maxAmazonAccounts) {
    throw new PlanLimitError(`Your ${plan.name} plan allows ${plan.maxAmazonAccounts} Amazon account${plan.maxAmazonAccounts === 1 ? "" : "s"}. Upgrade to add more.`);
  }
}

/**
 * A token plus one priced-offers call for a dummy ASIN. The batch answers 200
 * with an item-level error, which proves the token works and the app has the
 * Pricing role, at the cost of one call of the account's rate budget.
 */
async function verifyAccess(proxy: ProxyConfig, client: LwaClient, refreshToken: string): Promise<string> {
  const token = await accessToken(proxy, client, refreshToken);
  const res = await itemOffersBatch(proxy, token.accessToken, ["B000000000"]);
  if (res.status === 403) {
    throw new AmazonError("Amazon accepted the login but refused the pricing call. The app needs the Pricing role.", 403);
  }
  if (res.status !== 200 || !batchResponses(res)) throw new AmazonError(amazonErrorText(res), res.status);
  return token.accessToken;
}

async function insertAccount(
  tenantId: number,
  a: { label: string; mode: "oauth" | "self"; sellingPartnerId: string | null; creds: StoredCreds; keyHint: string; token?: string },
): Promise<number> {
  const id = await tx(async (t) => {
    const res = await t.exec(
      `INSERT INTO source_accounts (tenant_id, source, label, mode, selling_partner_id, credentials_enc, key_hint, status, last_ok_at, next_allowed_at)
       VALUES (?, 'amazon', ?, ?, ?, '', ?, 'connected', NOW(3), NOW(3) + INTERVAL 10 SECOND)`,
      [tenantId, a.label, a.mode, a.sellingPartnerId, a.keyHint],
    );
    const accountId = res.insertId;
    await t.exec(
      "UPDATE source_accounts SET credentials_enc = ?, token_enc = ?, token_expires_at = NOW(3) + INTERVAL 50 MINUTE WHERE id = ? AND tenant_id = ?",
      [
        encryptJson(a.creds, secretContext.sourceCredentials(tenantId, accountId)),
        a.token ? encryptString(a.token, secretContext.sourceToken(tenantId, accountId)) : null,
        accountId,
        tenantId,
      ],
    );
    await ensureJob(tenantId, "reprice", accountId, {}, t);
    return accountId;
  });
  await rebalanceShards(tenantId);
  return id;
}

export function cleanLabel(label: string, fallback: string): string {
  return label.trim().replace(/\s+/g, " ").slice(0, 80) || fallback;
}

export async function addSelfAuthorised(
  tenantId: number,
  proxy: ProxyConfig,
  input: { label: string; clientId: string; clientSecret: string; refreshToken: string },
): Promise<number> {
  await assertAccountRoom(tenantId);
  const creds: StoredCreds = {
    clientId: input.clientId.trim(),
    clientSecret: input.clientSecret.trim(),
    refreshToken: input.refreshToken.trim(),
  };
  const token = await verifyAccess(proxy, clientFor(creds), creds.refreshToken);
  const n = (await listAmazonAccounts(tenantId)).length;
  return insertAccount(tenantId, {
    label: cleanLabel(input.label, `Amazon account ${n + 1}`),
    mode: "self",
    sellingPartnerId: null,
    creds,
    keyHint: maskSecret(creds.clientId),
    token,
  });
}

const STATE_TTL_MIN = 15;

/** Starts the Seller Central approval: a single-use state tied to this user and workspace. */
export async function startOAuth(tenantId: number, userId: number, label: string): Promise<string> {
  const app = appClient();
  if (!app) throw new Error("Connecting through Seller Central isn't set up on this server yet. Use your own app keys instead.");
  await assertAccountRoom(tenantId);
  const state = randomBytes(32).toString("base64url");
  await exec("DELETE FROM oauth_states WHERE expires_at < NOW(3)");
  await exec(
    "INSERT INTO oauth_states (state_hash, tenant_id, user_id, purpose, label, expires_at) VALUES (?, ?, ?, 'amazon', ?, NOW(3) + INTERVAL ? MINUTE)",
    [createHash("sha256").update(state).digest("hex"), tenantId, userId, label.slice(0, 80), STATE_TTL_MIN],
  );
  return consentUrl(app.appId, state, app.draft);
}

/**
 * The redirect back from Seller Central. The state must belong to the same
 * user and workspace that started it, and is deleted on first use.
 */
export async function completeOAuth(
  tenantId: number,
  userId: number,
  proxy: ProxyConfig,
  input: { state: string; code: string; sellingPartnerId: string; redirectUri: string },
): Promise<number> {
  const hash = createHash("sha256").update(input.state).digest("hex");
  const row = await one<{ label: string }>(
    "SELECT label FROM oauth_states WHERE state_hash = ? AND tenant_id = ? AND user_id = ? AND purpose = 'amazon' AND expires_at > NOW(3)",
    [hash, tenantId, userId],
  );
  const del = await exec("DELETE FROM oauth_states WHERE state_hash = ? AND tenant_id = ? AND user_id = ?", [hash, tenantId, userId]);
  if (!row || del.affectedRows !== 1) throw new Error("This approval link has expired or was already used. Start again from Connections.");
  if (!/^[A-Z0-9]{8,40}$/.test(input.sellingPartnerId)) throw new Error("Amazon sent back an unexpected seller id.");

  const app = appClient();
  if (!app) throw new Error("SellSail's Amazon app is not configured");
  const refreshToken = await exchangeAuthCode(proxy, app, input.code, input.redirectUri);

  const existing = await one<{ id: number }>(
    "SELECT id FROM source_accounts WHERE tenant_id = ? AND source = 'amazon' AND selling_partner_id = ?",
    [tenantId, input.sellingPartnerId],
  );
  if (existing) {
    // Re-approval of an account we already have: replace its token.
    await exec(
      "UPDATE source_accounts SET credentials_enc = ?, token_enc = NULL, status = 'connected', last_error = NULL, mode = 'oauth' WHERE id = ? AND tenant_id = ?",
      [encryptJson({ refreshToken }, secretContext.sourceCredentials(tenantId, existing.id)), existing.id, tenantId],
    );
    await rebalanceShards(tenantId);
    return existing.id;
  }
  await assertAccountRoom(tenantId);
  const n = (await listAmazonAccounts(tenantId)).length;
  return insertAccount(tenantId, {
    label: cleanLabel(row.label, `Amazon account ${n + 1}`),
    mode: "oauth",
    sellingPartnerId: input.sellingPartnerId,
    creds: { refreshToken },
    keyHint: input.sellingPartnerId.slice(0, 4) + "••••",
  });
}

export async function removeAmazonAccount(tenantId: number, accountId: number): Promise<boolean> {
  const res = await tx(async (t) => {
    await t.exec("DELETE FROM jobs WHERE tenant_id = ? AND kind = 'reprice' AND target_id = ?", [tenantId, accountId]);
    return t.exec("DELETE FROM source_accounts WHERE id = ? AND tenant_id = ?", [accountId, tenantId]);
  });
  await rebalanceShards(tenantId);
  return res.affectedRows > 0;
}

/** An access token for jobs, cached (encrypted) until shortly before expiry. */
export async function amazonAccessToken(tenantId: number, accountId: number, proxy: ProxyConfig, forceNew = false): Promise<string> {
  const row = await one<{ credentials_enc: string; token_enc: string | null; token_expires_at: Date | null }>(
    "SELECT credentials_enc, token_enc, token_expires_at FROM source_accounts WHERE id = ? AND tenant_id = ?",
    [accountId, tenantId],
  );
  if (!row) throw new Error("Amazon account not found");
  if (!forceNew && row.token_enc && row.token_expires_at && new Date(row.token_expires_at).getTime() > Date.now()) {
    try {
      return decryptString(row.token_enc, secretContext.sourceToken(tenantId, accountId));
    } catch {
      // fetch a new one
    }
  }
  let creds: StoredCreds;
  try {
    creds = decryptJson<StoredCreds>(row.credentials_enc, secretContext.sourceCredentials(tenantId, accountId));
  } catch {
    // Treated as a login failure so the account is flagged instead of retried forever.
    throw new AmazonError("The saved Amazon keys can't be read (was the encryption key changed?). Reconnect this account.", 401);
  }
  const token = await accessToken(proxy, clientFor(creds), creds.refreshToken);
  await exec("UPDATE source_accounts SET token_enc = ?, token_expires_at = ? WHERE id = ? AND tenant_id = ?", [
    encryptString(token.accessToken, secretContext.sourceToken(tenantId, accountId)),
    token.expiresAt,
    accountId,
    tenantId,
  ]);
  return token.accessToken;
}

export async function markAmazonStatus(tenantId: number, accountId: number, ok: boolean, error?: string): Promise<void> {
  const before = await one<{ status: string }>("SELECT status FROM source_accounts WHERE id = ? AND tenant_id = ?", [accountId, tenantId]);
  if (ok) {
    await exec("UPDATE source_accounts SET status = 'connected', last_error = NULL, last_ok_at = NOW(3) WHERE id = ? AND tenant_id = ?", [
      accountId,
      tenantId,
    ]);
  } else {
    await exec("UPDATE source_accounts SET status = 'error', last_error = ? WHERE id = ? AND tenant_id = ?", [
      (error ?? "").slice(0, 255),
      accountId,
      tenantId,
    ]);
  }
  // A shard that stops or starts working changes who reprices what.
  if (before && (before.status === "connected") !== ok) await rebalanceShards(tenantId);
}
