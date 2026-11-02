// SellSail's Amazon key sets from env: quote stripping in envApps and
// the shape-only diagnostic shown on /admin/system. Every value here is fake.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanEnvValue, describeSpapiEnv, envApps } from "../src/server/connections/amazon.ts";

const ID = "amzn1.application-oa2-client.FAKEID0000";
const SECRET = "amzn1.oa2-cs.v1.FAKESECRET0000";
const TOKEN = "Atzr|FAKE-REFRESH-TOKEN-0000";

const env = (vars: Record<string, string>) => vars as NodeJS.ProcessEnv;

test("cleanEnvValue trims and strips one pair of matching quotes", () => {
  assert.equal(cleanEnvValue(undefined), "");
  assert.equal(cleanEnvValue("  abc \n"), "abc");
  assert.equal(cleanEnvValue("'abc'"), "abc");
  assert.equal(cleanEnvValue('"abc"'), "abc");
  assert.equal(cleanEnvValue("  ' abc '  "), "abc");
  assert.equal(cleanEnvValue("'Atzr|x'"), "Atzr|x");
  // Only one layer, and only a matching pair.
  assert.equal(cleanEnvValue(`"'abc'"`), "'abc'");
  assert.equal(cleanEnvValue(`'abc"`), `'abc"`);
  assert.equal(cleanEnvValue("'abc"), "'abc");
  assert.equal(cleanEnvValue("abc'"), "abc'");
  assert.equal(cleanEnvValue("'"), "'");
  assert.equal(cleanEnvValue("''"), "");
});

test("envApps strips Hostinger-style quotes from each value", () => {
  const apps = envApps(
    env({
      SPAPI_1_CLIENT_ID: `'${ID}'`,
      SPAPI_1_CLIENT_SECRET: `"${SECRET}"`,
      SPAPI_1_REFRESH_TOKEN: ` '${TOKEN}'\n`,
    }),
  );
  assert.deepEqual(apps, [{ slot: 1, client: { clientId: ID, clientSecret: SECRET }, refreshToken: TOKEN, source: "env", label: "SPAPI_1_*" }]);
});

test("envApps still skips incomplete sets and keeps slot numbers", () => {
  const apps = envApps(
    env({
      SPAPI_1_CLIENT_ID: ID,
      SPAPI_1_CLIENT_SECRET: SECRET,
      SPAPI_1_REFRESH_TOKEN: "''", // quotes around nothing: empty
      SPAPI_3_CLIENT_ID: ID,
      SPAPI_3_CLIENT_SECRET: SECRET,
      SPAPI_3_REFRESH_TOKEN: TOKEN,
      SPAPI_4_CLIENT_ID: ID,
      SPAPI_4_CLIENT_SECRET: SECRET,
    }),
  );
  assert.deepEqual(
    apps.map((a) => a.slot),
    [3],
  );
});

test("describeSpapiEnv reports shape facts for each slot with any var", () => {
  const report = describeSpapiEnv(
    env({
      SPAPI_1_CLIENT_ID: `'${ID}'`,
      SPAPI_1_CLIENT_SECRET: `'${SECRET}'`,
      SPAPI_1_REFRESH_TOKEN: `'${TOKEN}'`,
      SPAPI_2_CLIENT_ID: "amzn1.application-oa2-client.FAKE ID",
      SPAPI_2_CLIENT_SECRET: "   ",
      SPAPI_5_REFRESH_TOKEN: "Atzr|FAKE\nREST",
      OTHER: "x",
    }),
  );
  assert.deepEqual(
    report.slots.map((s) => [s.slot, s.used]),
    [
      [1, true],
      [2, false],
      [5, false],
    ],
  );

  const [one, two, five] = report.slots;
  assert.deepEqual(one.fields.REFRESH_TOKEN, {
    present: true,
    length: TOKEN.length + 2,
    emptyAfterTrim: false,
    startsWithQuote: true,
    endsWithQuote: true,
    hasPipe: true,
    whitespace: "none",
    hasNewline: false,
    oddChars: false,
    prefixOk: true, // checked after the quotes come off
  });
  assert.equal(one.fields.CLIENT_ID.prefixOk, true);
  assert.equal(one.fields.CLIENT_SECRET.prefixOk, true);
  assert.equal(one.fields.CLIENT_ID.hasPipe, false);

  assert.equal(two.fields.CLIENT_ID.whitespace, "inside");
  assert.equal(two.fields.CLIENT_SECRET.present, true);
  assert.equal(two.fields.CLIENT_SECRET.emptyAfterTrim, true);
  assert.equal(two.fields.CLIENT_SECRET.whitespace, "edges");
  assert.equal(two.fields.CLIENT_SECRET.prefixOk, false);
  assert.equal(two.fields.REFRESH_TOKEN.present, false);
  assert.equal(two.fields.REFRESH_TOKEN.length, 0);

  assert.equal(five.fields.REFRESH_TOKEN.hasNewline, true);
  assert.equal(five.fields.REFRESH_TOKEN.whitespace, "inside");
  assert.equal(five.fields.CLIENT_ID.present, false);
});

test("describeSpapiEnv flags odd characters, lone quotes and wrong prefixes", () => {
  const report = describeSpapiEnv(
    env({
      SPAPI_1_CLIENT_ID: "‘amzn1.application-oa2-client.FAKE’", // curly quotes
      SPAPI_1_CLIENT_SECRET: "'amzn1.oa2-cs.v1.FAKE",
      SPAPI_1_REFRESH_TOKEN: "Atzr%7CFAKE", // URL-encoded pipe
    }),
  );
  const f = report.slots[0].fields;
  assert.equal(f.CLIENT_ID.oddChars, true);
  assert.equal(f.CLIENT_ID.startsWithQuote, false);
  assert.equal(f.CLIENT_ID.prefixOk, false);
  assert.equal(f.CLIENT_SECRET.startsWithQuote, true);
  assert.equal(f.CLIENT_SECRET.endsWithQuote, false);
  assert.equal(f.CLIENT_SECRET.prefixOk, false); // an unmatched quote is not stripped
  assert.equal(f.REFRESH_TOKEN.hasPipe, false);
  assert.equal(f.REFRESH_TOKEN.prefixOk, false);
});

test("describeSpapiEnv lists Amazon-looking names so typos show up", () => {
  const report = describeSpapiEnv(
    env({
      SPAPI_1_CLIENT_ID: ID,
      "SPAPI_1_CLIENT_SECRET ": SECRET, // trailing space in the name
      spapi_1_refresh_token: TOKEN,
      SP_API_2_CLIENT_ID: ID,
      SPAPI_01_CLIENT_ID: ID,
      SPAPI_21_CLIENT_ID: ID,
      SPAPI_PROXY: "http://proxy.example:8080",
      AMAZON_SELLER_ID: "FAKE",
      STRIPE_SECRET_KEY: "sk_test_FAKE",
    }),
  );
  assert.deepEqual(report.names, [
    { name: "AMAZON_SELLER_ID", hidden: false, recognised: false },
    { name: "SPAPI_01_CLIENT_ID", hidden: false, recognised: false },
    { name: "SPAPI_1_CLIENT_ID", hidden: false, recognised: true },
    { name: "SPAPI_1_CLIENT_SECRET ", hidden: false, recognised: false },
    { name: "SPAPI_21_CLIENT_ID", hidden: false, recognised: false },
    { name: "SPAPI_PROXY", hidden: false, recognised: true },
    { name: "SP_API_2_CLIENT_ID", hidden: false, recognised: false },
    { name: "spapi_1_refresh_token", hidden: false, recognised: false },
  ]);
  // Slot 1 has only the correctly named CLIENT_ID, so it is listed but not used.
  assert.deepEqual(
    report.slots.map((s) => [s.slot, s.used, s.fields.CLIENT_SECRET.present]),
    [[1, false, false]],
  );
});

test("describeSpapiEnv never returns a value, even one pasted into a name", () => {
  const report = describeSpapiEnv(
    env({
      SPAPI_1_CLIENT_ID: "amzn1.application-oa2-client.MARKERID",
      SPAPI_1_CLIENT_SECRET: "amzn1.oa2-cs.v1.MARKERSECRET",
      SPAPI_1_REFRESH_TOKEN: "Atzr|MARKERTOKEN",
      "SPAPI_2_REFRESH_TOKEN Atzr|MARKERINNAME": "x",
    }),
  );
  const out = JSON.stringify(report);
  for (const marker of ["MARKERID", "MARKERSECRET", "MARKERTOKEN", "MARKERINNAME"]) {
    assert.ok(!out.includes(marker), `${marker} leaked`);
  }
  assert.deepEqual(report.names.at(-1), { name: "SPAPI_2_REFRESH_TOKEN …", hidden: true, recognised: false });
});

test("describeSpapiEnv is empty when no Amazon vars exist", () => {
  assert.deepEqual(describeSpapiEnv(env({ APP_ENCRYPTION_KEY: "x" })), { slots: [], names: [] });
});
