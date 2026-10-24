// Encryption for seller secrets at rest: OnBuy keys and tokens, SP-API refresh
// tokens, proxy passwords. AES-256-GCM with APP_ENCRYPTION_KEY (32 random
// bytes, base64).
//
// Every value is sealed with a context string (for example "tenant:7:proxy")
// as GCM additional data. A ciphertext copied into another tenant's row, or
// into another column, then fails to open instead of quietly working there.
//
// Format: "v1:" + base64(iv[12] | tag[16] | ciphertext).
// APP_ENCRYPTION_KEY_PREVIOUS, when set, is tried for decryption only, so the
// key can be rotated without breaking rows written with the old one.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1:";

export class SecretsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretsConfigError";
  }
}

function parseKey(raw: string | undefined, name: string): Buffer | null {
  if (!raw) return null;
  const key = Buffer.from(raw.trim(), "base64");
  if (key.length !== 32) {
    throw new SecretsConfigError(`${name} must be 32 bytes, base64 encoded (got ${key.length} bytes).`);
  }
  return key;
}

function keys(): { current: Buffer; all: Buffer[] } {
  const current = parseKey(process.env.APP_ENCRYPTION_KEY, "APP_ENCRYPTION_KEY");
  if (!current) {
    throw new SecretsConfigError(
      "APP_ENCRYPTION_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  const previous = parseKey(process.env.APP_ENCRYPTION_KEY_PREVIOUS, "APP_ENCRYPTION_KEY_PREVIOUS");
  return { current, all: previous ? [current, previous] : [current] };
}

/** True when a key is configured, so pages can say so instead of crashing. */
export function encryptionConfigured(): boolean {
  try {
    keys();
    return true;
  } catch {
    return false;
  }
}

export function encryptString(plain: string, context: string): string {
  const { current } = keys();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", current, iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return VERSION + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

export function decryptString(sealed: string, context: string): string {
  if (!sealed.startsWith(VERSION)) throw new Error("Unknown secret format");
  const raw = Buffer.from(sealed.slice(VERSION.length), "base64");
  if (raw.length < 29) throw new Error("Secret is truncated");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const body = raw.subarray(28);
  for (const key of keys().all) {
    try {
      const decipher = createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAAD(Buffer.from(context, "utf8"));
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    } catch {
      // wrong key or wrong context: try the next key
    }
  }
  // Deliberately vague: never echo the value or the context back.
  throw new Error("Secret could not be decrypted (wrong key, or stored for another account)");
}

export function encryptJson(value: unknown, context: string): string {
  return encryptString(JSON.stringify(value), context);
}

export function decryptJson<T>(sealed: string, context: string): T {
  return JSON.parse(decryptString(sealed, context)) as T;
}

/** Context strings, in one place so writers and readers can't drift apart. */
export const secretContext = {
  proxy: (tenantId: number) => `tenant:${tenantId}:proxy`,
  // One account per marketplace per workspace, so the name identifies it.
  marketplaceCredentials: (tenantId: number, marketplace: string) => `tenant:${tenantId}:market:${marketplace}:creds`,
  marketplaceToken: (tenantId: number, marketplace: string) => `tenant:${tenantId}:market:${marketplace}:token`,
  // SellSail's own Amazon app keys, shared by every workspace.
  amazonAppToken: (slot: number) => `platform:amazon:${slot}:token`,
};

/** "abcd1234wxyz" -> "••••wxyz". Short values are fully hidden. */
export function maskSecret(value: string | null | undefined, visible = 4): string {
  const v = String(value ?? "");
  if (v.length <= visible * 2) return "••••";
  return "••••" + v.slice(-visible);
}

/** "proxy.example.com" -> "pro•••.com": enough to recognise, not enough to reuse. */
export function maskHost(host: string): string {
  const h = host.trim();
  if (h.length <= 6) return "•••";
  return h.slice(0, 3) + "•••" + h.slice(-4);
}
