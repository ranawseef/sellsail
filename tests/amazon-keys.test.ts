// SellSail's Amazon key sets stored in the database: form validation, sealing
// at rest, how env and database sets merge, and that nothing built for the
// admin page carries a key. Every value here is fake.

import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  duplicateSlot,
  firstFreeSlot,
  KEY_LENGTH,
  MAX_APPS,
  openKeySet,
  parseKeySetInput,
  sealKeySet,
  type StoredKeySet,
} from "../src/server/connections/amazon-keys.ts";
import { buildKeySetViews, dbApps, describeDbKeySets, envApps, keyTestFailure, mergeApps, type AmazonApp } from "../src/server/connections/amazon.ts";
import { AmazonError } from "../src/server/integrations/amazon/spapi.ts";
import { EgressBlockedError } from "../src/server/net/egress.ts";
import { secretContext, encryptJson } from "../src/server/crypto/secrets.ts";

process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const ID = "amzn1.application-oa2-client.FAKEID00000000000000000000wxyz";
const SECRET = "amzn1.oa2-cs.v1.FAKESECRET000000000000000000000000000000000000000000";
const TOKEN = "Atzr|IwEB-FAKE-REFRESH-TOKEN-000000000000000000000000000000000000000000000000";
const ID2 = "amzn1.application-oa2-client.FAKEID22222222222222222222abcd";
const SECRET2 = "amzn1.oa2-cs.v1.FAKESECRET222222222222222222222222222222222222222222";
const TOKEN2 = "Atzr|IwEB-FAKE-REFRESH-TOKEN-222222222222222222222222222222222222222222222222";

const form = (over: Partial<Record<"label" | "clientId" | "clientSecret" | "refreshToken", string>> = {}) => ({
  label: "Main app",
  clientId: ID,
  clientSecret: SECRET,
  refreshToken: TOKEN,
  ...over,
});

// ---- validation ---------------------------------------------------------------------

test("parseKeySetInput trims, strips one pair of matching quotes and squashes label spaces", () => {
  const p = parseKeySetInput(form({ label: "  Main \n app ", clientId: ` '${ID}' `, clientSecret: `"${SECRET}"\n`, refreshToken: `\t${TOKEN}  ` }));
  assert.ok(p.ok);
  assert.deepEqual(p.data, { label: "Main app", clientId: ID, clientSecret: SECRET, refreshToken: TOKEN });
});

test("parseKeySetInput requires every field and each prefix", () => {
  const empty = parseKeySetInput({ label: "", clientId: "", clientSecret: "''", refreshToken: undefined });
  assert.ok(!empty.ok);
  assert.deepEqual(Object.keys(empty.errors).sort(), ["clientId", "clientSecret", "label", "refreshToken"]);
  assert.match(empty.errors.clientSecret ?? "", /required/);

  // Each box with another box's value: the prefix check catches the mix-up.
  const swapped = parseKeySetInput(form({ clientId: SECRET, clientSecret: TOKEN, refreshToken: ID }));
  assert.ok(!swapped.ok);
  assert.match(swapped.errors.clientId ?? "", /must start with amzn1\.application-oa2-client\./);
  assert.match(swapped.errors.clientSecret ?? "", /must start with amzn1\.oa2-cs\./);
  assert.match(swapped.errors.refreshToken ?? "", /must start with Atzr\|/);
});

test("parseKeySetInput rejects inner spaces, odd characters, and values too short or too long", () => {
  const spaced = parseKeySetInput(form({ refreshToken: "Atzr|IwEB-FAKE TOKEN-0000000000000" }));
  assert.ok(!spaced.ok);
  assert.match(spaced.errors.refreshToken ?? "", /spaces or unusual characters/);

  const curly = parseKeySetInput(form({ clientSecret: "amzn1.oa2-cs.v1.FAKE​SECRET0000" }));
  assert.ok(!curly.ok);
  assert.match(curly.errors.clientSecret ?? "", /unusual characters/);

  const short = parseKeySetInput(form({ clientId: "amzn1.application-oa2-client.x" }));
  assert.ok(!short.ok);
  assert.match(short.errors.clientId ?? "", /cut short/);

  const long = parseKeySetInput(form({ refreshToken: "Atzr|" + "a".repeat(KEY_LENGTH.REFRESH_TOKEN.max) }));
  assert.ok(!long.ok);
  assert.match(long.errors.refreshToken ?? "", /too long/);
});

test("parseKeySetInput keeps labels short, plain and free of keys", () => {
  assert.ok(!parseKeySetInput(form({ label: "x".repeat(61) })).ok);
  assert.ok(parseKeySetInput(form({ label: "x".repeat(60) })).ok);
  const keyAsLabel = parseKeySetInput(form({ label: TOKEN.slice(0, 40) }));
  assert.ok(!keyAsLabel.ok);
  assert.match(keyAsLabel.errors.label ?? "", /looks like a key/);
});

test("validation messages never contain the value that was typed", () => {
  const bad = { label: "Atzr|LABEL-LEAK-1", clientId: "CLIENT-LEAK-2", clientSecret: "amzn1.oa2-cs.SECRET LEAK 3", refreshToken: "Atzr|" + "TOKENLEAK4".repeat(300) };
  const p = parseKeySetInput(bad);
  assert.ok(!p.ok);
  const out = JSON.stringify(p.errors);
  for (const leak of ["LABEL-LEAK", "CLIENT-LEAK", "SECRET LEAK", "TOKENLEAK"]) assert.ok(!out.includes(leak), leak);
});

// ---- at rest -----------------------------------------------------------------------

test("a key set is sealed at rest and opens only in its own slot", () => {
  const sealed = sealKeySet(3, { clientId: ID, clientSecret: SECRET, refreshToken: TOKEN });
  assert.ok(sealed.startsWith("v1:"));
  for (const plain of [ID, SECRET, TOKEN, "FAKEID", "FAKESECRET", "REFRESH"]) assert.ok(!sealed.includes(plain), plain);
  assert.deepEqual(openKeySet(3, sealed), { clientId: ID, clientSecret: SECRET, refreshToken: TOKEN });
  // Copied into another slot's row, or read with another key: unreadable, not an exception.
  assert.equal(openKeySet(4, sealed), null);
  const saved = process.env.APP_ENCRYPTION_KEY;
  process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  try {
    assert.equal(openKeySet(3, sealed), null);
  } finally {
    process.env.APP_ENCRYPTION_KEY = saved;
  }
  // Something that decrypts but isn't a key set.
  assert.equal(openKeySet(3, encryptJson({ clientId: ID }, secretContext.amazonAppKeys(3))), null);
});

// ---- slots and merging ----------------------------------------------------------------

test("firstFreeSlot takes the lowest unused slot and stops at MAX_APPS", () => {
  assert.equal(firstFreeSlot([]), 1);
  assert.equal(firstFreeSlot([1, 2, 4]), 3);
  assert.equal(firstFreeSlot(Array.from({ length: MAX_APPS }, (_, i) => i + 1)), null);
});

test("duplicateSlot finds the same app and refresh token in another slot", () => {
  const sets = [
    { slot: 1, values: { clientId: ID, clientSecret: SECRET, refreshToken: TOKEN } },
    { slot: 2, values: null },
  ];
  assert.equal(duplicateSlot({ clientId: ID, clientSecret: "other", refreshToken: TOKEN }, sets), 1);
  assert.equal(duplicateSlot({ clientId: ID, clientSecret: SECRET, refreshToken: TOKEN2 }, sets), null); // another seller authorisation
  assert.equal(duplicateSlot({ clientId: ID, clientSecret: SECRET, refreshToken: TOKEN }, sets, 1), null); // replacing set 1 itself
});

const stored = (slot: number, over: Partial<StoredKeySet> = {}): StoredKeySet => ({
  slot,
  label: `Stored ${slot}`,
  enabled: true,
  clientIdHint: ID2.slice(-4),
  createdBy: "admin@example.com",
  updatedBy: "admin@example.com",
  createdAt: new Date("2026-11-01T10:00:00Z"),
  updatedAt: new Date("2026-11-01T10:00:00Z"),
  values: { clientId: ID2, clientSecret: SECRET2, refreshToken: TOKEN2 },
  ...over,
});

const ENV = { SPAPI_2_CLIENT_ID: ID, SPAPI_2_CLIENT_SECRET: SECRET, SPAPI_2_REFRESH_TOKEN: TOKEN } as Record<string, string> as NodeJS.ProcessEnv;

test("env and database sets merge by slot; env wins a clash; paused and unreadable sets stay out", () => {
  const db = dbApps([stored(1), stored(2), stored(3, { enabled: false }), stored(4, { values: null }), stored(5)]);
  assert.deepEqual(
    db.map((a) => a.slot),
    [1, 2, 5],
  );
  const apps = mergeApps(envApps(ENV), db);
  assert.deepEqual(
    apps.map((a) => [a.slot, a.source]),
    [
      [1, "db"],
      [2, "env"],
      [5, "db"],
    ],
  );
  assert.equal(apps[1].client.clientId, ID); // slot 2 uses the env keys, not the stored ones
  assert.equal(apps[0].refreshToken, TOKEN2);
  assert.equal(apps[0].label, "Stored 1");
});

test("mergeApps ignores slots outside 1..MAX_APPS", () => {
  const odd: AmazonApp = { slot: MAX_APPS + 1, client: { clientId: ID2, clientSecret: SECRET2 }, refreshToken: TOKEN2, source: "db", label: "x" };
  assert.deepEqual(mergeApps([], [odd]), []);
});

// ---- what the admin page gets -----------------------------------------------------------

const SECRET_BITS = [SECRET, TOKEN, SECRET2, TOKEN2, ID, ID2, "FAKESECRET", "REFRESH-TOKEN", "FAKEID"];

test("key set views say where each set is from and why an idle one is idle", () => {
  const sets = [stored(1), stored(2), stored(3, { enabled: false }), stored(4, { values: null })];
  const state = [
    { slot: 1, status: "ok", last_error: null, last_ok_at: new Date("2026-11-02T09:00:00Z") },
    { slot: 2, status: "error", last_error: "Amazon answered HTTP 401", last_ok_at: null },
  ];
  const views = buildKeySetViews(envApps(ENV), sets, state);
  assert.deepEqual(
    views.map((v) => [v.slot, v.source, v.inUse, v.idle]),
    [
      [1, "db", true, null],
      [2, "env", true, null],
      [2, "db", false, "env_slot"],
      [3, "db", false, "paused"],
      [4, "db", false, "undecryptable"],
    ],
  );
  assert.equal(views[0].status, "ok");
  assert.equal(views[0].clientId, "••••abcd");
  assert.equal(views[1].clientId, "••••wxyz");
  assert.equal(views[1].status, "error"); // slot 2's state is the env set's
  assert.equal(views[1].lastError, "Amazon answered HTTP 401");
  assert.equal(views[2].status, null);
  assert.equal(views[3].status, "untested");
});

test("nothing built for the admin page contains a key value", () => {
  const sets = [stored(1), stored(2), stored(3, { enabled: false })];
  const env = envApps(ENV);
  const views = buildKeySetViews(env, sets, []);
  const shapes = describeDbKeySets(sets, env);
  const out = JSON.stringify({ views, shapes });
  for (const bit of SECRET_BITS) assert.ok(!out.includes(bit), bit);
  // The only part of a client id that is shown: its last four characters.
  assert.ok(out.includes("••••abcd"));
  assert.equal(shapes[0].fields?.CLIENT_SECRET.prefixOk, true);
  assert.equal(shapes[1].idle, "env_slot");
});

test("a failed Test says what went wrong in SellSail's words, never Amazon's", () => {
  const leaky = (code: string, status = 401) => new AmazonError(`Amazon answered HTTP ${status}: client ${ID} secret ${SECRET}`, status, code);
  const cases: [unknown, RegExp][] = [
    [leaky("invalid_client"), /client ID or client secret/],
    [leaky("invalid_grant", 400), /refresh token/],
    [leaky("unauthorized_client", 400), /may not use/],
    [leaky("server_error", 500), /HTTP 500, server_error/],
    [leaky("<script>", 400), /^Amazon refused the login \(HTTP 400\)\.$/],
    [new EgressBlockedError("proxy down"), /SPAPI_PROXY/],
    [new Error(`connect ECONNREFUSED ${TOKEN}`), /Couldn't reach Amazon/],
  ];
  for (const [err, want] of cases) {
    const msg = keyTestFailure(err);
    assert.match(msg, want);
    for (const bit of SECRET_BITS) assert.ok(!msg.includes(bit), bit);
  }
});
