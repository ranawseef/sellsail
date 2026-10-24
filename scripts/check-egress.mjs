#!/usr/bin/env node
// Build guard: every OnBuy / Amazon request must go through the tenant's proxy.
//
// src/server/net/egress.ts is the only file allowed to open outbound HTTP
// connections to marketplace APIs. This script fails (exit 1) when any other
// source file:
//   - calls fetch(), or imports undici, node:http(s), axios, got or node-fetch
//   - builds a proxy agent of its own
//   - names a marketplace / supplier API host outside src/server/integrations
//
// It runs before `next build`, so a direct call can never be deployed.
// A line can opt out only with an explicit marker naming why, e.g. a browser
// component posting to our own /api route:   // egress-guard: allow (same-origin)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.argv[2] ?? process.cwd();
const srcDir = join(root, "src");

const EGRESS_FILE = ["src", "server", "net", "egress.ts"].join("/");
const INTEGRATIONS_DIR = ["src", "server", "integrations"].join("/") + "/";

// Files that may talk to non-marketplace services through their own SDK.
// Stripe is billing for SellSail itself, not a seller's marketplace account.
const SDK_ALLOWED = new Set([["src", "server", "billing", "stripe.ts"].join("/")]);

const NETWORK_PATTERNS = [
  { re: /(^|[^.\w])fetch\s*\(/, what: "fetch()" },
  { re: /from\s+["']undici["']|require\(\s*["']undici["']\s*\)/, what: "undici import" },
  { re: /from\s+["'](node:)?https?["']|require\(\s*["'](node:)?https?["']\s*\)/, what: "node http/https import" },
  { re: /from\s+["'](axios|got|node-fetch|cross-fetch|superagent|needle|request)["']/, what: "HTTP client import" },
  { re: /\b(ProxyAgent|socksDispatcher|HttpsProxyAgent|SocksProxyAgent|setGlobalDispatcher)\b/, what: "own proxy agent" },
  { re: /\bXMLHttpRequest\b|\bWebSocket\s*\(/, what: "raw browser network API" },
];

const HOST_PATTERN = /api\.onbuy\.com|sellingpartnerapi|amazon\.co\.uk\/auth|api\.amazon\.com|sellercentral\.amazon|api\.ipify\.org/i;

const ALLOW_MARKER = /egress-guard:\s*allow\s*\([^)]+\)/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) out.push(full);
  }
  return out;
}

const problems = [];
for (const file of walk(srcDir)) {
  const rel = relative(root, file).split(sep).join("/");
  if (rel === EGRESS_FILE) continue;
  const isTest = /\.test\.(ts|tsx|mjs)$/.test(rel);
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (ALLOW_MARKER.test(line)) return;
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // whole-line comments
    const code = line;

    if (!SDK_ALLOWED.has(rel) && !isTest) {
      for (const p of NETWORK_PATTERNS) {
        if (p.re.test(code)) problems.push(`${rel}:${i + 1}  ${p.what} outside ${EGRESS_FILE}`);
      }
    }
    if (!rel.startsWith(INTEGRATIONS_DIR) && !isTest && HOST_PATTERN.test(code)) {
      problems.push(`${rel}:${i + 1}  marketplace API host outside ${INTEGRATIONS_DIR}`);
    }
  });
}

if (problems.length) {
  console.error("Egress guard failed. Marketplace requests must go through egressFetch() (tenant proxy):\n");
  for (const p of problems) console.error("  " + p);
  console.error(`\n${problems.length} problem(s). See src/server/net/egress.ts.`);
  process.exit(1);
}
console.log("Egress guard: OK (all outbound API calls go through src/server/net/egress.ts)");
