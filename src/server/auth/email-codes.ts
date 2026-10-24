// One-time 6-digit codes sent by email: confirming a new account's address
// and resetting a forgotten password.
//
// Only an HMAC of the code is stored (keyed with the app's encryption key and
// the user id, so a leaked table can't be brute-forced offline in seconds).
// A code expires after 15 minutes, dies after 5 wrong tries, and works once.
// Issuing a new code retires the old ones for that purpose.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { exec, one } from "../db/pool.ts";

export type CodePurpose = "verify" | "reset";

export const CODE_TTL_MIN = 15;
export const CODE_MAX_ATTEMPTS = 5;

function codeHash(userId: number, purpose: CodePurpose, code: string): string {
  const key = process.env.APP_ENCRYPTION_KEY || "sellsail-dev-only";
  return createHmac("sha256", key).update(`${userId}:${purpose}:${code}`).digest("hex");
}

/** Creates a fresh code (and retires older ones). Returns it for the email only. */
export async function issueCode(userId: number, purpose: CodePurpose): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await exec("UPDATE email_codes SET used_at = NOW(3) WHERE user_id = ? AND purpose = ? AND used_at IS NULL", [
    userId,
    purpose,
  ]);
  await exec(
    "INSERT INTO email_codes (user_id, purpose, code_hash, expires_at) VALUES (?, ?, ?, NOW(3) + INTERVAL ? MINUTE)",
    [userId, purpose, codeHash(userId, purpose, code), CODE_TTL_MIN],
  );
  return code;
}

export type CodeCheck = "ok" | "wrong" | "expired";

/** Checks a code and, when right, uses it up so it can't be replayed. */
export async function consumeCode(userId: number, purpose: CodePurpose, code: string): Promise<CodeCheck> {
  const clean = code.replace(/\s+/g, "");
  const row = await one<{ id: number; code_hash: string; attempts: number; expired: number }>(
    `SELECT id, code_hash, attempts, expires_at <= NOW(3) AS expired
       FROM email_codes
      WHERE user_id = ? AND purpose = ? AND used_at IS NULL
      ORDER BY id DESC LIMIT 1`,
    [userId, purpose],
  );
  if (!row || row.expired || row.attempts >= CODE_MAX_ATTEMPTS) return "expired";
  if (!/^\d{6}$/.test(clean)) {
    await exec("UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return "wrong";
  }

  const want = Buffer.from(row.code_hash, "hex");
  const got = Buffer.from(codeHash(userId, purpose, clean), "hex");
  if (want.length !== got.length || !timingSafeEqual(want, got)) {
    await exec("UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return "wrong";
  }

  // Mark used only if nobody else used it first (two tabs submitting at once).
  const res = await exec("UPDATE email_codes SET used_at = NOW(3) WHERE id = ? AND used_at IS NULL", [row.id]);
  return res.affectedRows === 1 ? "ok" : "expired";
}
// Old rows are deleted by the scheduler's hourly maintenance().
