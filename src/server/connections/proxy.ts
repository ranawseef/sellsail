// The workspace's proxy: every OnBuy and Amazon request leaves through it.
//
// Health: a proxy error marks it failing, and while it is failing jobs send
// nothing to OnBuy or Amazon. The scheduler re-tests it (an IP lookup, not a
// marketplace call) every few minutes and resumes when it answers again.

import { egressIp, ProxyFailureError, proxyProblem, type ProxyConfig, PROXY_TYPES, type ProxyType } from "../net/egress.ts";
import { decryptJson, encryptJson, maskHost, secretContext } from "../crypto/secrets.ts";
import { exec, one } from "../db/pool.ts";
import { logEvent } from "../audit.ts";

export const PROXY_RETEST_MS = 5 * 60_000;

export type ProxyRow = {
  config: ProxyConfig | null;
  hostHint: string;
  status: "untested" | "ok" | "failing";
  egressIp: string | null;
  lastCheckedAt: Date | null;
  lastError: string | null;
  failStreak: number;
};

export async function loadProxy(tenantId: number): Promise<ProxyRow | null> {
  const r = await one<{
    config_enc: string;
    host_hint: string;
    status: ProxyRow["status"];
    egress_ip: string | null;
    last_checked_at: Date | null;
    last_error: string | null;
    fail_streak: number;
  }>("SELECT config_enc, host_hint, status, egress_ip, last_checked_at, last_error, fail_streak FROM proxies WHERE tenant_id = ?", [tenantId]);
  if (!r) return null;
  let config: ProxyConfig | null = null;
  try {
    config = decryptJson<ProxyConfig>(r.config_enc, secretContext.proxy(tenantId));
  } catch {
    config = null; // unreadable (key changed): treated as no proxy, so nothing is sent
  }
  return {
    config,
    hostHint: r.host_hint,
    status: r.status,
    egressIp: r.egress_ip,
    lastCheckedAt: r.last_checked_at,
    lastError: r.last_error,
    failStreak: r.fail_streak,
  };
}

/** Parses the form fields of the proxy step. Returns the config or the reason it is unusable. */
export function parseProxyInput(input: { type: string; host: string; port: string | number; username?: string; password?: string }):
  | { ok: true; config: ProxyConfig }
  | { ok: false; error: string } {
  const type = input.type as ProxyType;
  if (!PROXY_TYPES.includes(type)) return { ok: false, error: "Choose a proxy type." };
  const config: ProxyConfig = {
    type,
    host: String(input.host ?? "").trim(),
    port: Number(input.port),
    username: input.username?.trim() || undefined,
    password: input.password || undefined,
  };
  if ((config.username?.length ?? 0) > 200 || (config.password?.length ?? 0) > 200) return { ok: false, error: "Username or password is too long." };
  const problem = proxyProblem(config);
  return problem ? { ok: false, error: problem.charAt(0).toUpperCase() + problem.slice(1) + "." } : { ok: true, config };
}

/** Saves a proxy (encrypted). A changed proxy starts untested and drops cached marketplace tokens. */
export async function saveProxy(tenantId: number, config: ProxyConfig): Promise<void> {
  const enc = encryptJson(config, secretContext.proxy(tenantId));
  const hint = `${config.type}://${maskHost(config.host)}:${config.port}`;
  await exec(
    `INSERT INTO proxies (tenant_id, config_enc, host_hint, status, egress_ip, last_error, fail_streak)
     VALUES (?, ?, ?, 'untested', NULL, NULL, 0)
     ON DUPLICATE KEY UPDATE config_enc = VALUES(config_enc), host_hint = VALUES(host_hint),
       status = 'untested', egress_ip = NULL, last_error = NULL, fail_streak = 0, last_checked_at = NULL`,
    [tenantId, enc, hint],
  );
  await dropMarketplaceTokens(tenantId);
}

// OnBuy tokens only work from the IP that requested them, and Amazon tokens
// are cheap to renew, so a new proxy or a new exit IP means new tokens.
async function dropMarketplaceTokens(tenantId: number): Promise<void> {
  await exec("UPDATE marketplace_accounts SET token_enc = NULL, token_expires_at = NULL WHERE tenant_id = ?", [tenantId]);
  await exec("UPDATE source_accounts SET token_enc = NULL, token_expires_at = NULL WHERE tenant_id = ?", [tenantId]);
}

/** Looks up the exit IP through the proxy and records the result. Throws on failure. */
export async function testProxy(tenantId: number): Promise<string> {
  const row = await loadProxy(tenantId);
  try {
    const ip = await egressIp(row?.config ?? null);
    await markProxyOk(tenantId, ip, row);
    return ip;
  } catch (err) {
    await markProxyFailing(tenantId, (err as Error).message);
    throw err;
  }
}

async function markProxyOk(tenantId: number, ip: string, before: ProxyRow | null): Promise<void> {
  await exec(
    "UPDATE proxies SET status = 'ok', egress_ip = ?, last_checked_at = NOW(3), last_error = NULL, fail_streak = 0 WHERE tenant_id = ?",
    [ip, tenantId],
  );
  if (before?.status === "failing") await logEvent(tenantId, "info", "proxy", "Proxy is working again. Syncing has resumed.");
  if (before?.egressIp && before.egressIp !== ip) {
    await dropMarketplaceTokens(tenantId);
    await logEvent(tenantId, "warn", "proxy", `Proxy exit IP changed from ${before.egressIp} to ${ip}. Use a static IP proxy so OnBuy sees one address.`);
  }
}

export async function markProxyFailing(tenantId: number, message: string): Promise<void> {
  const res = await exec(
    `UPDATE proxies SET status = 'failing', last_checked_at = NOW(3), last_error = ?, fail_streak = fail_streak + 1
      WHERE tenant_id = ?`,
    [message.slice(0, 255), tenantId],
  );
  const row = await one<{ fail_streak: number }>("SELECT fail_streak FROM proxies WHERE tenant_id = ?", [tenantId]);
  if (res.affectedRows && row?.fail_streak === 1) {
    await logEvent(tenantId, "error", "proxy", `Proxy failed, so nothing is being sent to OnBuy or Amazon: ${message.slice(0, 200)}`);
  }
}

/**
 * The proxy to use for a job, or null when traffic must not flow (none set,
 * unreadable, or failing and not yet recovered). Re-tests a failing or
 * untested proxy at most every few minutes.
 */
export async function proxyForJob(tenantId: number): Promise<{ proxy: ProxyConfig | null; reason: string }> {
  const row = await loadProxy(tenantId);
  if (!row) return { proxy: null, reason: "No proxy set up" };
  if (!row.config) return { proxy: null, reason: "Proxy details can't be read; enter them again" };
  if (row.status === "ok") return { proxy: row.config, reason: "" };

  const lastCheck = row.lastCheckedAt ? new Date(row.lastCheckedAt).getTime() : 0;
  if (row.status === "failing" && Date.now() - lastCheck < PROXY_RETEST_MS) {
    return { proxy: null, reason: `Proxy failing: ${row.lastError ?? "unknown error"}` };
  }
  try {
    await testProxy(tenantId);
    return { proxy: row.config, reason: "" };
  } catch (err) {
    return { proxy: null, reason: `Proxy failing: ${(err as Error).message}` };
  }
}

/** Call after any marketplace request that failed because of the proxy. */
export async function reportProxyError(tenantId: number, err: unknown): Promise<boolean> {
  if (err instanceof ProxyFailureError) {
    await markProxyFailing(tenantId, err.message);
    return true;
  }
  return false;
}
