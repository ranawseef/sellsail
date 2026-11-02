// SellSail's Amazon SP-API key sets kept in the database and managed by admins
// on /admin/system. SPAPI_n_* vars saved in Hostinger's hPanel never reached
// the running app, so key sets live here instead. Env sets still work and win
// a slot both use (see configuredApps in amazon.ts).
//
// One row per slot in amazon_app_keys. The client id, client secret and
// refresh token are sealed together as JSON with APP_ENCRYPTION_KEY, bound to
// the slot (secretContext.amazonAppKeys), the same way seller OnBuy keys are
// stored. Only the client id's last four characters are kept in the clear, for
// the admin list.
//
// Nothing here returns a value to a page, a log or the audit trail:
// validation messages name the field, never its content.

import { z } from "zod";
import { decryptJson, encryptJson, secretContext } from "../crypto/secrets.ts";
import { exec, one, q } from "../db/pool.ts";

export const MAX_APPS = 20;

/** The three values that make one key set, and what a real value starts with. */
export const SPAPI_FIELDS = {
  CLIENT_ID: "amzn1.application-oa2-client.",
  CLIENT_SECRET: "amzn1.oa2-cs.",
  REFRESH_TOKEN: "Atzr|",
} as const;
export type SpapiField = keyof typeof SPAPI_FIELDS;

/**
 * A key value as SellSail uses it: trimmed, with one pair of matching quotes
 * taken off. Hostinger's .env stores every value in single quotes, and a value
 * copied from a .env file into the admin form often brings its quotes along.
 */
export function cleanEnvValue(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (v.length >= 2 && (v[0] === "'" || v[0] === '"') && v[v.length - 1] === v[0]) return v.slice(1, -1).trim();
  return v;
}

export type KeySetValues = { clientId: string; clientSecret: string; refreshToken: string };
export type KeySetInput = KeySetValues & { label: string };
export type KeySetField = keyof KeySetInput;

// ---- validation -----------------------------------------------------------------

export const LABEL_MAX = 60;

/** Sane lengths after cleaning. Real values are about 61, 80 and 300-600 characters. */
export const KEY_LENGTH: Record<SpapiField, { min: number; max: number }> = {
  CLIENT_ID: { min: SPAPI_FIELDS.CLIENT_ID.length + 8, max: 128 },
  CLIENT_SECRET: { min: SPAPI_FIELDS.CLIENT_SECRET.length + 8, max: 256 },
  REFRESH_TOKEN: { min: SPAPI_FIELDS.REFRESH_TOKEN.length + 8, max: 2048 },
};

const FIELD_NAME: Record<SpapiField, string> = { CLIENT_ID: "Client ID", CLIENT_SECRET: "Client secret", REFRESH_TOKEN: "Refresh token" };

/** One key value: cleaned, then checked. Messages never contain the value. */
function keyValue(field: SpapiField) {
  const name = FIELD_NAME[field];
  const prefix = SPAPI_FIELDS[field];
  const { min, max } = KEY_LENGTH[field];
  return z
    .string()
    .transform(cleanEnvValue)
    .superRefine((v, ctx) => {
      const fail = (message: string) => ctx.addIssue({ code: "custom", message });
      if (!v) return fail(`${name} is required.`);
      if (v.length > max) return fail(`${name} is too long (over ${max} characters). Paste only the ${name.toLowerCase()}.`);
      if (!/^[\x21-\x7e]+$/.test(v)) return fail(`${name} contains spaces or unusual characters. Copy it again from Seller Central.`);
      if (!v.startsWith(prefix)) return fail(`${name} must start with ${prefix}`);
      if (v.length < min) return fail(`${name} looks cut short (under ${min} characters).`);
    });
}

const keySetSchema = z.object({
  label: z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .superRefine((v, ctx) => {
      const fail = (message: string) => ctx.addIssue({ code: "custom", message });
      if (!v) return fail("Give the set a name, e.g. Main app.");
      if (v.length > LABEL_MAX) return fail(`Keep the name to ${LABEL_MAX} characters.`);
      if (/[\x00-\x1f\x7f]/.test(v)) return fail("The name contains unusual characters.");
      // A key pasted into the wrong box would otherwise be shown and audited.
      if (/amzn1\.|atzr\|/i.test(v)) return fail("That looks like a key. Use a plain name, e.g. Main app.");
    }),
  clientId: keyValue("CLIENT_ID"),
  clientSecret: keyValue("CLIENT_SECRET"),
  refreshToken: keyValue("REFRESH_TOKEN"),
});

export type KeySetParse = { ok: true; data: KeySetInput } | { ok: false; errors: Partial<Record<KeySetField, string>> };

/** Validates and normalises the add / replace form. */
export function parseKeySetInput(raw: Record<KeySetField, unknown>): KeySetParse {
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const p = keySetSchema.safeParse({
    label: text(raw.label),
    clientId: text(raw.clientId),
    clientSecret: text(raw.clientSecret),
    refreshToken: text(raw.refreshToken),
  });
  if (p.success) return { ok: true, data: p.data };
  const errors: Partial<Record<KeySetField, string>> = {};
  for (const issue of p.error.issues) {
    const field = issue.path[0] as KeySetField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

/** "amzn1...abcd" -> "abcd": all of a client id that is ever stored or shown in the clear. */
export const clientIdHint = (clientId: string) => clientId.slice(-4);
export const maskedClientId = (hint: string) => `••••${hint}`;

/** The slot another set already uses these exact keys in, if any (it would share Amazon's rate budget). */
export function duplicateSlot(values: KeySetValues, sets: { slot: number; values: KeySetValues | null }[], exceptSlot?: number): number | null {
  const same = sets.find((s) => s.slot !== exceptSlot && s.values?.clientId === values.clientId && s.values.refreshToken === values.refreshToken);
  return same ? same.slot : null;
}

/** The lowest slot no set uses, or null when all MAX_APPS are taken. */
export function firstFreeSlot(used: Iterable<number>): number | null {
  const taken = new Set(used);
  for (let slot = 1; slot <= MAX_APPS; slot++) if (!taken.has(slot)) return slot;
  return null;
}

// ---- encryption -----------------------------------------------------------------

export function sealKeySet(slot: number, v: KeySetValues): string {
  return encryptJson({ clientId: v.clientId, clientSecret: v.clientSecret, refreshToken: v.refreshToken }, secretContext.amazonAppKeys(slot));
}

/** The stored values, or null when they can't be decrypted (key changed, row copied to another slot). */
export function openKeySet(slot: number, sealed: string): KeySetValues | null {
  try {
    const v = decryptJson<Partial<KeySetValues>>(sealed, secretContext.amazonAppKeys(slot));
    if (typeof v?.clientId !== "string" || typeof v.clientSecret !== "string" || typeof v.refreshToken !== "string") return null;
    return { clientId: v.clientId, clientSecret: v.clientSecret, refreshToken: v.refreshToken };
  } catch {
    return null;
  }
}

// ---- storage --------------------------------------------------------------------

/** A key set row. `values` stays on the server: never pass a StoredKeySet to a page. */
export type StoredKeySet = {
  slot: number;
  label: string;
  enabled: boolean;
  clientIdHint: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** null when the row can't be decrypted. */
  values: KeySetValues | null;
};

type KeyRow = {
  slot: number;
  label: string;
  enabled: number;
  credentials_enc: string;
  client_id_hint: string;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
};

const COLUMNS = "slot, label, enabled, credentials_enc, client_id_hint, created_by, updated_by, created_at, updated_at";

function fromRow(r: KeyRow): StoredKeySet {
  return {
    slot: r.slot,
    label: r.label,
    enabled: Boolean(r.enabled),
    clientIdHint: r.client_id_hint,
    createdBy: r.created_by,
    updatedBy: r.updated_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    values: openKeySet(r.slot, r.credentials_enc),
  };
}

/** Every stored set, paused ones included, in slot order. */
export async function readStoredKeySets(): Promise<StoredKeySet[]> {
  const rows = await q<KeyRow>(`SELECT ${COLUMNS} FROM amazon_app_keys ORDER BY slot`);
  return rows.map(fromRow);
}

export async function readStoredKeySet(slot: number): Promise<StoredKeySet | null> {
  const row = await one<KeyRow>(`SELECT ${COLUMNS} FROM amazon_app_keys WHERE slot = ?`, [slot]);
  return row ? fromRow(row) : null;
}

/**
 * New keys in a slot start from a clean runtime state: no token cached for the
 * old keys, no old error or backoff, "untested".
 */
async function resetAppState(slot: number): Promise<void> {
  await exec(
    `INSERT INTO amazon_apps (slot) VALUES (?)
     ON DUPLICATE KEY UPDATE token_enc = NULL, token_expires_at = NULL, status = 'untested', last_error = NULL,
       last_ok_at = NULL, next_allowed_at = NOW(3)`,
    [slot],
  );
}

/**
 * Stores a new set in the lowest free slot (not used by env or another stored
 * set). Returns the slot, or null when every slot is taken.
 */
export async function addKeySet(input: KeySetInput, by: string, envSlots: readonly number[]): Promise<number | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const stored = await q<{ slot: number }>("SELECT slot FROM amazon_app_keys");
    const slot = firstFreeSlot([...envSlots, ...stored.map((r) => r.slot)]);
    if (slot === null) return null;
    try {
      await exec(
        `INSERT INTO amazon_app_keys (slot, label, enabled, credentials_enc, client_id_hint, created_by, updated_by)
         VALUES (?, ?, 1, ?, ?, ?, ?)`,
        [slot, input.label, sealKeySet(slot, input), clientIdHint(input.clientId), by, by],
      );
    } catch (err) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") continue; // another admin took it first
      throw err;
    }
    await resetAppState(slot);
    return slot;
  }
  throw new Error("Could not find a free Amazon key slot after 3 tries");
}

/** New credentials (and name) for a stored set. False when there is no such set. */
export async function replaceKeySet(slot: number, input: KeySetInput, by: string): Promise<boolean> {
  const res = await exec(
    `UPDATE amazon_app_keys SET label = ?, credentials_enc = ?, client_id_hint = ?, updated_by = ?, updated_at = NOW(3)
      WHERE slot = ?`,
    [input.label, sealKeySet(slot, input), clientIdHint(input.clientId), by, slot],
  );
  if (res.affectedRows === 0) return false;
  await resetAppState(slot);
  return true;
}

export async function setKeySetEnabled(slot: number, enabled: boolean, by: string): Promise<boolean> {
  const res = await exec("UPDATE amazon_app_keys SET enabled = ?, updated_by = ?, updated_at = NOW(3) WHERE slot = ?", [enabled ? 1 : 0, by, slot]);
  return res.affectedRows > 0;
}

/**
 * Erases a stored set. Its runtime state goes too, unless an env set uses the
 * same slot (that state is the env set's).
 */
export async function deleteKeySet(slot: number, envSlots: readonly number[]): Promise<boolean> {
  const res = await exec("DELETE FROM amazon_app_keys WHERE slot = ?", [slot]);
  if (res.affectedRows === 0) return false;
  if (!envSlots.includes(slot)) await exec("DELETE FROM amazon_apps WHERE slot = ?", [slot]);
  return true;
}
