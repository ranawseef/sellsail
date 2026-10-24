// Outbound HTTP to marketplace and supplier APIs. The only way any OnBuy or
// Amazon request leaves this app.
//
// Every request goes through the tenant's own proxy. There is no "off" and no
// fallback: when the proxy is missing or invalid the request is never sent and
// the caller gets an EgressBlockedError. Several sellers run on this one server,
// so a request sent from the server's own IP would link their marketplace
// accounts together. A failed call is recoverable; a leaked IP is not.
//
// scripts/check-egress.mjs fails the build if fetch(), undici, node:http(s) or a
// marketplace hostname shows up anywhere else.

import { fetch as undiciFetch, ProxyAgent, type Dispatcher } from "undici";
import { socksDispatcher } from "fetch-socks";

// A host-wide NO_PROXY could exempt marketplace hosts from a proxy in some
// clients. Ours never reads it (every request names its dispatcher), but clear
// it anyway so nothing else in the process can be tempted by it.
delete process.env.NO_PROXY;
delete process.env.no_proxy;

export const PROXY_TYPES = ["http", "https", "socks5", "socks5h"] as const;
export type ProxyType = (typeof PROXY_TYPES)[number];

export type ProxyConfig = {
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
};

export class EgressBlockedError extends Error {
  constructor(reason: string) {
    super(`Blocked, not sent: ${reason}`);
    this.name = "EgressBlockedError";
  }
}

/** The proxy itself failed (refused, auth rejected, timed out connecting). */
export class ProxyFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProxyFailureError";
  }
}

const HOST_RE = /^[a-z0-9.-]{1,253}$|^\[?[0-9a-f:.]+\]?$/i;

/** Why this proxy can't be used, or "" when it can. */
export function proxyProblem(p: ProxyConfig | null | undefined): string {
  if (!p) return "no proxy configured for this workspace";
  if (!PROXY_TYPES.includes(p.type)) return "unknown proxy type";
  const host = (p.host ?? "").trim();
  if (!host) return "proxy host is empty";
  if (!HOST_RE.test(host)) return "proxy host is not a valid hostname or IP";
  if (!Number.isInteger(p.port) || p.port < 1 || p.port > 65535) return "proxy port must be 1-65535";
  return "";
}

// One dispatcher per distinct proxy, reused across requests so connections
// are pooled. Bounded so a busy server can't grow it forever.
const dispatchers = new Map<string, Dispatcher>();
const MAX_DISPATCHERS = 300;

function dispatcherFor(p: ProxyConfig): Dispatcher {
  const key = JSON.stringify([p.type, p.host.trim().toLowerCase(), p.port, p.username ?? "", p.password ?? ""]);
  const hit = dispatchers.get(key);
  if (hit) {
    dispatchers.delete(key);
    dispatchers.set(key, hit); // most recently used last
    return hit;
  }

  let d: Dispatcher;
  if (p.type === "socks5" || p.type === "socks5h") {
    d = socksDispatcher(
      { type: 5, host: p.host.trim(), port: p.port, userId: p.username || undefined, password: p.password || undefined },
      { connect: { timeout: 15_000 } },
    ) as unknown as Dispatcher;
  } else {
    const scheme = p.type === "https" ? "https" : "http";
    const auth =
      p.username || p.password
        ? `Basic ${Buffer.from(`${p.username ?? ""}:${p.password ?? ""}`).toString("base64")}`
        : undefined;
    d = new ProxyAgent({
      uri: `${scheme}://${p.host.trim()}:${p.port}`,
      token: auth,
      proxyTls: { timeout: 15_000 },
      requestTls: { timeout: 15_000 },
    });
  }

  dispatchers.set(key, d);
  if (dispatchers.size > MAX_DISPATCHERS) {
    const [oldKey, oldD] = dispatchers.entries().next().value as [string, Dispatcher];
    dispatchers.delete(oldKey);
    void oldD.close().catch(() => {});
  }
  return d;
}

export type EgressRequest = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
};

export type EgressResponse = {
  status: number;
  headers: Headers;
  text: string;
  /** Parsed JSON body, or null when the body is not JSON. */
  json: unknown;
};

// Errors that mean the proxy (not the API) failed. undici reports these with
// these codes or messages when the CONNECT/SOCKS handshake fails.
const PROXY_ERROR = /proxy|socks|ECONNREFUSED|EHOSTUNREACH|ENOTFOUND|ECONNRESET|407|UND_ERR_CONNECT_TIMEOUT/i;

/**
 * Send one request through the tenant's proxy, or not at all.
 * Throws EgressBlockedError without sending when the proxy is unusable, and
 * ProxyFailureError when the proxy refused or could not be reached.
 */
export async function egressFetch(
  proxy: ProxyConfig | null | undefined,
  url: string,
  req: EgressRequest = {},
): Promise<EgressResponse> {
  const problem = proxyProblem(proxy);
  if (problem) throw new EgressBlockedError(problem);

  const target = new URL(url);
  if (target.protocol !== "https:") throw new EgressBlockedError("only https URLs may be called");

  const dispatcher = dispatcherFor(proxy as ProxyConfig);

  let res;
  try {
    res = await undiciFetch(target, {
      method: req.method ?? "GET",
      headers: req.headers,
      body: req.body,
      dispatcher, // the proxy, applied to this request and nothing else
      signal: AbortSignal.timeout(req.timeoutMs ?? 60_000),
      redirect: "manual",
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string; message?: string } }).cause;
    const message = cause?.message ?? (err as Error).message;
    const detail = cause?.code && !message.includes(cause.code) ? `${cause.code} ${message}` : message;
    if (PROXY_ERROR.test(detail)) throw new ProxyFailureError(`Proxy failed: ${detail}`);
    throw new Error(`Request failed: ${detail}`);
  }

  if (res.status === 407) throw new ProxyFailureError("Proxy rejected the username or password (HTTP 407)");

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  return { status: res.status, headers: res.headers as unknown as Headers, text, json };
}

/** The IP address the marketplace APIs see for this proxy. */
export async function egressIp(proxy: ProxyConfig | null | undefined): Promise<string> {
  const res = await egressFetch(proxy, "https://api.ipify.org?format=json", { timeoutMs: 20_000 });
  const ip = (res.json as { ip?: string } | null)?.ip ?? res.text.trim();
  if (res.status !== 200 || !ip || ip.length > 45) throw new Error(`IP check answered HTTP ${res.status}`);
  return ip;
}
