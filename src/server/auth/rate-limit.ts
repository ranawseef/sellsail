// Fixed-window rate limits kept in MySQL (no Redis on Hostinger).
//
// One statement both counts and reads: LAST_INSERT_ID(expr) hands the new
// count back in the OK packet, so two requests racing on the same key can't
// both read a stale count.

import { createHash } from "node:crypto";
import { exec } from "../db/pool.ts";

export type Limit = { max: number; windowSec: number };

export const LIMITS = {
  loginPerIp: { max: 30, windowSec: 15 * 60 },
  loginPerEmail: { max: 8, windowSec: 15 * 60 },
  signupPerIp: { max: 6, windowSec: 60 * 60 },
  connectionTestPerTenant: { max: 30, windowSec: 60 * 60 },
  // Emails sent per address, and reset requests / code checks per network.
  codeEmailPerUser: { max: 5, windowSec: 60 * 60 },
  resetPerIp: { max: 10, windowSec: 60 * 60 },
  codeCheckPerIp: { max: 30, windowSec: 15 * 60 },
  adminCodePerIp: { max: 10, windowSec: 15 * 60 },
  adminRevealPerAdmin: { max: 30, windowSec: 15 * 60 },
} satisfies Record<string, Limit>;

/** Keys that carry personal data (emails) are hashed before storing. */
export function limitKey(scope: string, value: string): string {
  const v = value.trim().toLowerCase();
  const digest = createHash("sha256").update(v).digest("hex").slice(0, 40);
  return `${scope}:${digest}`;
}

/** Counts one hit; returns true while the key is within its limit. */
export async function hit(key: string, limit: Limit): Promise<boolean> {
  const res = await exec(
    `INSERT INTO rate_limits (k, hits, window_start) VALUES (?, 1, NOW(3))
     ON DUPLICATE KEY UPDATE
       hits = LAST_INSERT_ID(IF(window_start < NOW(3) - INTERVAL ? SECOND, 1, hits + 1)),
       window_start = IF(window_start < NOW(3) - INTERVAL ? SECOND, NOW(3), window_start)`,
    [key, limit.windowSec, limit.windowSec],
  );
  const count = Number(res.insertId) || 1; // 0 on a fresh insert
  return count <= limit.max;
}

export async function resetLimit(key: string): Promise<void> {
  await exec("DELETE FROM rate_limits WHERE k = ?", [key]);
}
