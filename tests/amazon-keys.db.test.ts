// Amazon key sets stored in a real database: sealed at rest, merged with env
// sets (env wins), cached briefly, and each admin change resetting the slot's
// runtime state. Every value here is fake.

import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { resetDatabase, skipDb } from "./helpers/db.ts";
import { closePool, exec, one, q } from "../src/server/db/pool.ts";
import {
  addKeySet,
  deleteKeySet,
  MAX_APPS,
  readStoredKeySets,
  replaceKeySet,
  setKeySetEnabled,
} from "../src/server/connections/amazon-keys.ts";
import { amazonKeyAdminData, amazonPoolStatus, configuredApps, invalidateAmazonApps, reserveAmazonApp } from "../src/server/connections/amazon.ts";

process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const set = (n: number, label = `Set ${n}`) => ({
  label,
  clientId: `amzn1.application-oa2-client.FAKEDBID${n}000000000000000000${String(n).padStart(4, "0")}`,
  clientSecret: `amzn1.oa2-cs.v1.FAKEDBSECRET${n}0000000000000000000000000000000`,
  refreshToken: `Atzr|IwEB-FAKE-DB-REFRESH-${n}-00000000000000000000000000000000000000`,
});

const ENV_KEYS = ["SPAPI_1_CLIENT_ID", "SPAPI_1_CLIENT_SECRET", "SPAPI_1_REFRESH_TOKEN"];
function setEnvSet1(on: boolean) {
  const v = set(91);
  const values = [v.clientId, v.clientSecret, v.refreshToken];
  ENV_KEYS.forEach((k, i) => {
    if (on) process.env[k] = values[i];
    else delete process.env[k];
  });
}

before(async () => {
  if (skipDb) return;
  await resetDatabase();
});
after(async () => {
  if (!skipDb) await closePool();
});
beforeEach(async () => {
  if (skipDb) return;
  setEnvSet1(false);
  await exec("DELETE FROM amazon_app_keys");
  await exec("DELETE FROM amazon_apps");
  invalidateAmazonApps();
});

test("a stored set is sealed at rest: no value in the clear, only the client id's last four", { skip: skipDb }, async () => {
  const v = set(1);
  const slot = await addKeySet(v, "admin@example.com", []);
  assert.equal(slot, 1);
  const raw = await one<Record<string, unknown>>("SELECT * FROM amazon_app_keys WHERE slot = 1");
  const dump = JSON.stringify(raw);
  for (const plain of [v.clientId, v.clientSecret, v.refreshToken, "FAKEDB"]) assert.ok(!dump.includes(plain), plain);
  assert.equal(raw?.client_id_hint, v.clientId.slice(-4));
  assert.equal(raw?.created_by, "admin@example.com");
  assert.equal(Number(raw?.enabled), 1);

  const [read] = await readStoredKeySets();
  assert.deepEqual(read.values, { clientId: v.clientId, clientSecret: v.clientSecret, refreshToken: v.refreshToken });
  assert.equal(read.label, "Set 1");
});

test("new sets take the lowest slot free of env and stored sets, up to MAX_APPS", { skip: skipDb }, async () => {
  assert.equal(await addKeySet(set(1), "a@example.com", [1, 3]), 2);
  assert.equal(await addKeySet(set(2), "a@example.com", [1, 3]), 4);
  for (let n = 3; n <= MAX_APPS - 2; n++) assert.ok(await addKeySet(set(n), "a@example.com", [1, 3]));
  assert.equal(await addKeySet(set(99), "a@example.com", [1, 3]), null);
  const count = await one<{ n: number }>("SELECT COUNT(*) AS n FROM amazon_app_keys");
  assert.equal(Number(count?.n), MAX_APPS - 2);
});

test("the pool merges env and enabled stored sets, env winning a clash", { skip: skipDb }, async () => {
  await addKeySet(set(1, "Stored one"), "a@example.com", []); // slot 1
  await addKeySet(set(2, "Stored two"), "a@example.com", []); // slot 2
  await addKeySet(set(3, "Stored three"), "a@example.com", []); // slot 3
  await setKeySetEnabled(3, false, "a@example.com");
  setEnvSet1(true);
  invalidateAmazonApps();

  const apps = await configuredApps();
  assert.deepEqual(
    apps.map((a) => [a.slot, a.source]),
    [
      [1, "env"],
      [2, "db"],
    ],
  );
  assert.equal(apps[0].client.clientId, set(91).clientId);
  assert.equal(apps[1].refreshToken, set(2).refreshToken);

  const status = await amazonPoolStatus();
  assert.equal(status.configured, 2);

  // The admin card sees all four, says which one the env set shadows, and holds no key.
  const data = await amazonKeyAdminData();
  assert.deepEqual(
    data.sets.map((s) => [s.slot, s.source, s.idle]),
    [
      [1, "env", null],
      [1, "db", "env_slot"],
      [2, "db", null],
      [3, "db", "paused"],
    ],
  );
  assert.equal(data.inUse, 2);
  assert.equal(data.freeSlots, MAX_APPS - 3);
  const out = JSON.stringify(data);
  for (const n of [1, 2, 3, 91]) {
    const v = set(n);
    for (const plain of [v.clientId, v.clientSecret, v.refreshToken]) assert.ok(!out.includes(plain), `set ${n}`);
  }
});

test("decrypted sets are cached briefly, and an admin change clears the cache", { skip: skipDb }, async () => {
  await addKeySet(set(1), "a@example.com", []);
  assert.equal((await configuredApps()).length, 1);
  // A change that skipped invalidation (another process) shows within APPS_CACHE_MS, not at once.
  await addKeySet(set(2), "a@example.com", []);
  assert.equal((await configuredApps()).length, 1);
  invalidateAmazonApps();
  assert.equal((await configuredApps()).length, 2);
});

test("a stored set that can't be decrypted is skipped, not fatal", { skip: skipDb }, async () => {
  await addKeySet(set(1), "a@example.com", []);
  await addKeySet(set(2), "a@example.com", []);
  // A ciphertext moved to another slot's row no longer opens.
  const row = await one<{ credentials_enc: string }>("SELECT credentials_enc FROM amazon_app_keys WHERE slot = 1");
  await exec("UPDATE amazon_app_keys SET credentials_enc = ? WHERE slot = 2", [row!.credentials_enc]);
  invalidateAmazonApps();
  const apps = await configuredApps();
  assert.deepEqual(
    apps.map((a) => a.slot),
    [1],
  );
  const data = await amazonKeyAdminData();
  assert.equal(data.sets.find((s) => s.slot === 2)?.idle, "undecryptable");
});

test("replacing keys clears the slot's cached token and old error", { skip: skipDb }, async () => {
  await addKeySet(set(1), "a@example.com", []);
  await exec(
    `UPDATE amazon_apps SET token_enc = 'v1:old', token_expires_at = NOW(3) + INTERVAL 1 HOUR, status = 'error',
       last_error = 'Amazon answered HTTP 401', next_allowed_at = NOW(3) + INTERVAL 15 MINUTE WHERE slot = 1`,
  );
  assert.equal(await replaceKeySet(1, set(5, "Renamed"), "b@example.com"), true);
  const st = await one<{ token_enc: string | null; status: string; last_error: string | null; waiting: number }>(
    "SELECT token_enc, status, last_error, next_allowed_at > NOW(3) AS waiting FROM amazon_apps WHERE slot = 1",
  );
  assert.deepEqual({ ...st, waiting: Number(st?.waiting) }, { token_enc: null, status: "untested", last_error: null, waiting: 0 });
  const [read] = await readStoredKeySets();
  assert.equal(read.label, "Renamed");
  assert.equal(read.updatedBy, "b@example.com");
  assert.equal(read.values?.refreshToken, set(5).refreshToken);
  assert.equal(await replaceKeySet(7, set(6), "b@example.com"), false);
});

test("paused and deleted sets leave the pool; reservations only hand out live sets", { skip: skipDb }, async () => {
  await addKeySet(set(1), "a@example.com", []);
  await addKeySet(set(2), "a@example.com", []);
  await exec("UPDATE amazon_apps SET rate_interval_ms = 20");
  await setKeySetEnabled(1, false, "a@example.com");
  invalidateAmazonApps();
  const got = await reserveAmazonApp(() => false, async () => {});
  assert.equal(got?.slot, 2);
  assert.equal(got?.source, "db");

  assert.equal(await deleteKeySet(2, []), true);
  assert.equal(await deleteKeySet(2, []), false);
  // Its runtime state (and cached token) goes with it.
  assert.equal((await q("SELECT slot FROM amazon_apps WHERE slot = 2")).length, 0);
  invalidateAmazonApps();
  assert.equal(await reserveAmazonApp(() => false, async () => {}), null);

  // An env set in the same slot keeps its runtime state when the stored set goes.
  await addKeySet(set(3), "a@example.com", []); // slot 2 again
  assert.equal(await deleteKeySet(2, [2]), true);
  assert.equal((await q("SELECT slot FROM amazon_apps WHERE slot = 2")).length, 1);
});
