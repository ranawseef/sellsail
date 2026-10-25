// Outbound HTTP to marketplace and supplier APIs. The only way any OnBuy or
// Amazon request leaves this app.
//
// Every request names its route explicitly:
//   { kind: "proxy" }   through a proxy (a seller's own, or SellSail's for Amazon)
//   { kind: "direct" }  from the server's own IP
// A proxy is optional for sellers, but once one is chosen it is never bypassed:
// a proxy that is invalid or failing blocks the request (EgressBlockedError)
// instead of quietly falling back to the server's IP. That decision is made
// in connections/proxy.ts; this file only carries it out.
//
// scripts/check-egress.mjs fails the build if fetch(), undici, node:http(s) or a
// marketplace hostname shows up anywhere else.

import { Agent, fetch as undiciFetch, ProxyAgent, request as undiciRequest, type Dispatcher } from "undici";
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

/** How a request leaves the server. There is deliberately no default. */
export type Route = { kind: "proxy"; proxy: ProxyConfig } | { kind: "direct" };
export const DIRECT: Route = { kind: "direct" };
export const viaProxy = (proxy: ProxyConfig): Route => ({ kind: "proxy", proxy });

/**
 * Parses a proxy URL such as "http://user:pass@1.2.3.4:8080" or
 * "socks5://1.2.3.4:1080". Returns null for an empty value; throws on a bad one.
 */
export function parseProxyUrl(raw: string | undefined): ProxyConfig | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const u = new URL(v);
  const type = u.protocol.replace(/:$/, "") as ProxyType;
  const config: ProxyConfig = {
    type,
    host: u.hostname,
    port: Number(u.port),
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
  };
  const problem = proxyProblem(config);
  if (problem) throw new Error(`Invalid proxy URL: ${problem}`);
  return config;
}

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
  if (!p) return "no proxy details";
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

// Direct requests share one pooled agent.
let directAgent: Agent | null = null;
function directDispatcher(): Dispatcher {
  directAgent ??= new Agent({ connect: { timeout: 15_000 } });
  return directAgent;
}

/**
 * Send one request on the given route.
 * Throws EgressBlockedError without sending when a proxy route has unusable
 * details, and ProxyFailureError when the proxy refused or could not be reached.
 */
export async function egressFetch(route: Route, url: string, req: EgressRequest = {}): Promise<EgressResponse> {
  if (route.kind === "proxy") {
    const problem = proxyProblem(route.proxy);
    if (problem) throw new EgressBlockedError(problem);
  } else if (route.kind !== "direct") {
    throw new EgressBlockedError("no route chosen");
  }

  const target = new URL(url);
  if (target.protocol !== "https:") throw new EgressBlockedError("only https URLs may be called");

  const viaProxyRoute = route.kind === "proxy";
  const dispatcher = viaProxyRoute ? dispatcherFor(route.proxy) : directDispatcher();

  // fetch() refuses a GET with a body, but OnBuy's check-winning takes its
  // SKUs that way, so those go through undici's lower-level request().
  if ((req.method ?? "GET") === "GET" && req.body !== undefined) {
    let r;
    try {
      r = await undiciRequest(target, {
        method: "GET",
        headers: req.headers,
        body: req.body,
        dispatcher,
        signal: AbortSignal.timeout(req.timeoutMs ?? 60_000),
      });
    } catch (err) {
      const cause = (err as { cause?: { code?: string; message?: string }; code?: string }).cause;
      const message = cause?.message ?? (err as Error).message;
      const code = cause?.code ?? (err as { code?: string }).code;
      const detail = code && !message.includes(code) ? `${code} ${message}` : message;
      if (viaProxyRoute && PROXY_ERROR.test(detail)) throw new ProxyFailureError(`Proxy failed: ${detail}`);
      throw new Error(`Request failed: ${detail}`);
    }
    if (viaProxyRoute && r.statusCode === 407) throw new ProxyFailureError("Proxy rejected the username or password (HTTP 407)");
    const text = await r.body.text();
    const headers = new Headers();
    for (const [k, v] of Object.entries(r.headers)) {
      if (typeof v === "string") headers.set(k, v);
      else if (Array.isArray(v)) headers.set(k, v.join(", "));
    }
    return { status: r.statusCode, headers, text, json: parseJson(text) };
  }

  let res;
  try {
    res = await undiciFetch(target, {
      method: req.method ?? "GET",
      headers: req.headers,
      body: req.body,
      dispatcher, // the chosen route, applied to this request and nothing else
      signal: AbortSignal.timeout(req.timeoutMs ?? 60_000),
      redirect: "manual",
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string; message?: string } }).cause;
    const message = cause?.message ?? (err as Error).message;
    const detail = cause?.code && !message.includes(cause.code) ? `${cause.code} ${message}` : message;
    if (viaProxyRoute && PROXY_ERROR.test(detail)) throw new ProxyFailureError(`Proxy failed: ${detail}`);
    throw new Error(`Request failed: ${detail}`);
  }

  if (viaProxyRoute && res.status === 407) throw new ProxyFailureError("Proxy rejected the username or password (HTTP 407)");

  const text = await res.text();
  return { status: res.status, headers: res.headers as unknown as Headers, text, json: parseJson(text) };
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The IP address the marketplace APIs see on this route. */
export async function egressIp(route: Route): Promise<string> {
  const res = await egressFetch(route, "https://api.ipify.org?format=json", { timeoutMs: 20_000 });
  const ip = (res.json as { ip?: string } | null)?.ip ?? res.text.trim();
  if (res.status !== 200 || !ip || ip.length > 45) throw new Error(`IP check answered HTTP ${res.status}`);
  return ip;
}
