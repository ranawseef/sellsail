"use server";

// Admin actions for SellSail's Amazon key sets (the card on /admin/system):
// add, replace, pause/resume, delete and test. Each one checks the admin
// session itself (actions are public POST endpoints, whatever the layout
// does), validates its fields on the server, and writes to admin_audit.
//
// No key value is ever returned, logged or audited: messages name the slot
// and the set's name, and at most the client id's last four characters.

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requestInfo } from "../auth/context.ts";
import { hit, limitKey, LIMITS } from "../auth/rate-limit.ts";
import { encryptionConfigured } from "../crypto/secrets.ts";
import { amazonRoute, envApps, invalidateAmazonApps, keyTestFailure, MAX_APPS, testKeySet, type AmazonApp } from "../connections/amazon.ts";
import {
  addKeySet,
  clientIdHint,
  deleteKeySet,
  duplicateSlot,
  maskedClientId,
  parseKeySetInput,
  readStoredKeySet,
  readStoredKeySets,
  replaceKeySet,
  setKeySetEnabled,
  type KeySetValues,
} from "../connections/amazon-keys.ts";
import type { ActionState } from "../actions/app.ts";
import { AdminForbiddenError, adminAudit, adminForAction } from "./auth.ts";

type Admin = { email: string; ip: string };

async function asAdmin(what: string, fn: (admin: Admin) => Promise<ActionState>): Promise<ActionState> {
  try {
    const { email } = await adminForAction();
    const { ip } = await requestInfo();
    return await fn({ email, ip });
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof AdminForbiddenError) return { error: err.message };
    // Name and message only, never the error object: a driver error can carry the query.
    const e = err as Error;
    console.error(`[admin] Amazon key ${what} failed: ${e?.name ?? "Error"}: ${String(e?.message ?? err).slice(0, 200)}`);
    return { error: "Something went wrong. Check the server log." };
  }
}

const text = (form: FormData, k: string) => {
  const v = form.get(k);
  return typeof v === "string" ? v : "";
};

const slotSchema = z.coerce.number().int().min(1).max(MAX_APPS);
const slotOf = (form: FormData): number | null => {
  const p = slotSchema.safeParse(text(form, "slot"));
  return p.success ? p.data : null;
};

const keyFields = (form: FormData) => ({
  label: text(form, "label"),
  clientId: text(form, "clientId"),
  clientSecret: text(form, "clientSecret"),
  refreshToken: text(form, "refreshToken"),
});

const valuesOf = (a: AmazonApp): KeySetValues => ({ clientId: a.client.clientId, clientSecret: a.client.clientSecret, refreshToken: a.refreshToken });

/** Every set already known, env and stored, for the duplicate check. */
async function knownSets(): Promise<{ slot: number; values: KeySetValues | null }[]> {
  return [...envApps().map((a) => ({ slot: a.slot, values: valuesOf(a) })), ...(await readStoredKeySets())];
}

function changed(): void {
  invalidateAmazonApps();
  revalidatePath("/admin/system");
  revalidatePath("/admin");
}

const NO_KEY = { error: "APP_ENCRYPTION_KEY is not set, so keys can't be stored safely." };
const NOT_FOUND = { error: "That key set no longer exists. Reload the page." };

export async function addAmazonKeySetAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return asAdmin("add", async ({ email, ip }) => {
    if (!encryptionConfigured()) return NO_KEY;
    const p = parseKeySetInput(keyFields(form));
    if (!p.ok) return { error: "Check the fields marked below.", fieldErrors: p.errors };
    const dup = duplicateSlot(p.data, await knownSets());
    if (dup !== null) return { error: `These keys are already set ${dup}. One app in two slots would share one Amazon rate budget.` };
    const slot = await addKeySet(p.data, email, envApps().map((a) => a.slot));
    if (slot === null) return { error: `All ${MAX_APPS} slots are in use. Delete a set first.` };
    await adminAudit(email, "amazon_keys.add", null, `set ${slot} "${p.data.label}", client id ${maskedClientId(clientIdHint(p.data.clientId))}`, ip);
    changed();
    return { ok: true, message: `Saved as set ${slot}. Use Test to check it with Amazon.` };
  });
}

export async function replaceAmazonKeySetAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return asAdmin("replace", async ({ email, ip }) => {
    const slot = slotOf(form);
    if (slot === null) return NOT_FOUND;
    if (!encryptionConfigured()) return NO_KEY;
    const p = parseKeySetInput(keyFields(form));
    if (!p.ok) return { error: "Check the fields marked below.", fieldErrors: p.errors };
    const dup = duplicateSlot(p.data, await knownSets(), slot);
    if (dup !== null) return { error: `These keys are already set ${dup}. One app in two slots would share one Amazon rate budget.` };
    if (!(await replaceKeySet(slot, p.data, email))) return NOT_FOUND;
    await adminAudit(email, "amazon_keys.replace", null, `set ${slot} "${p.data.label}", client id ${maskedClientId(clientIdHint(p.data.clientId))}`, ip);
    changed();
    return { ok: true, message: `Set ${slot} has new keys. Use Test to check them with Amazon.` };
  });
}

export async function setAmazonKeySetEnabledAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return asAdmin("pause", async ({ email, ip }) => {
    const slot = slotOf(form);
    const enabled = text(form, "enabled") === "1";
    const set = slot === null ? null : await readStoredKeySet(slot);
    if (slot === null || !set) return NOT_FOUND;
    if (!(await setKeySetEnabled(slot, enabled, email))) return NOT_FOUND;
    await adminAudit(email, enabled ? "amazon_keys.resume" : "amazon_keys.pause", null, `set ${slot} "${set.label}"`, ip);
    changed();
    return { ok: true, message: enabled ? `Set ${slot} resumed.` : `Set ${slot} paused. Repricing stops using it within a minute.` };
  });
}

export async function deleteAmazonKeySetAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return asAdmin("delete", async ({ email, ip }) => {
    const slot = slotOf(form);
    const set = slot === null ? null : await readStoredKeySet(slot);
    if (slot === null || !set) return NOT_FOUND;
    if (!(await deleteKeySet(slot, envApps().map((a) => a.slot)))) return NOT_FOUND;
    await adminAudit(email, "amazon_keys.delete", null, `set ${slot} "${set.label}", client id ${maskedClientId(set.clientIdHint)}`, ip);
    changed();
    return { ok: true, message: `Set ${slot} deleted and its keys erased.` };
  });
}

/** Asks Login with Amazon for an access token with one set. Says whether it worked, nothing more. */
export async function testAmazonKeySetAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return asAdmin("test", async ({ email, ip }) => {
    const slot = slotOf(form);
    if (slot === null) return NOT_FOUND;
    const source = text(form, "source") === "env" ? "env" : "db";
    if (!(await hit(limitKey("admin-key-test", email), LIMITS.adminKeyTestPerAdmin))) return { error: "Too many tests. Wait a few minutes." };

    let values: KeySetValues | null = null;
    if (source === "env") {
      const a = envApps().find((x) => x.slot === slot);
      values = a ? valuesOf(a) : null;
    } else {
      const s = await readStoredKeySet(slot);
      if (s && !s.values) return { error: `Set ${slot} can't be decrypted (was APP_ENCRYPTION_KEY changed?). Replace its keys.` };
      values = s?.values ?? null;
    }
    if (!values) return NOT_FOUND;

    const { route } = amazonRoute();
    if (!route) return { error: "SPAPI_PROXY is set but can't be used, so nothing was sent." };
    let failure: string | null = null;
    try {
      await testKeySet({ client: { clientId: values.clientId, clientSecret: values.clientSecret }, refreshToken: values.refreshToken }, route);
    } catch (err) {
      failure = keyTestFailure(err);
      console.warn(`[admin] Amazon key set ${slot} (${source}) test failed: ${failure}`);
    }
    await adminAudit(email, "amazon_keys.test", null, `set ${slot} (${source}): ${failure ? `failed: ${failure}` : "ok"}`, ip);
    return failure ? { error: `Set ${slot}: ${failure}` } : { ok: true, message: `Set ${slot} works: Amazon issued an access token.` };
  });
}
