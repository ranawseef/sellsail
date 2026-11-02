// Customer activity without a database: the detail cleaner keeps secrets out,
// and the recorder never throws, even with no database at all. Every value
// here is fake.

import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTIVITY_TYPE_LIST, ACTIVITY_TYPES, changedKeys, cleanDetail, DETAIL_MAX_CHARS, parseDetail, PROBLEM_TYPES, scrubText, typesForFilter } from "../src/lib/activity.ts";

// No database for this file, whatever the shell has set.
delete process.env.DATABASE_URL;
delete process.env.DB_NAME;
const { recordActivity } = await import("../src/server/activity.ts");

const FAKE = {
  onbuySecret: "sk-onbuy-FAKE-0000000000000000000000000000000000",
  amazonClientId: "amzn1.application-oa2-client.FAKE000000000000000000000000",
  refreshToken: "Atzr|IwEB-FAKE-REFRESH-000000000000000000000000",
  stripeKey: "sk_live_FAKE0000000000000000000000",
  card: "4242 4242 4242 4242",
  email: "seller@example.com",
  proxyUrl: "http://proxyuser:proxypass@1.2.3.4:8080",
};

test("secret-sounding keys are dropped, whatever their value", () => {
  const out = cleanDetail({
    password: "hunter2",
    newPassword: "x",
    secretKey: "x",
    consumerKey: "x",
    api_key: "x",
    accessToken: "x",
    refresh_token: "x",
    cardNumber: "x",
    cvc: "123",
    sessionId: "x",
    code: "123456",
    otp: "123456",
    authorization: "x",
    credentials: { a: 1 },
    imported: 12,
    changed: ["marketplaceFeePct"],
  });
  assert.deepEqual(out, { imported: 12, changed: ["marketplaceFeePct"] });
});

test("values that look like keys, tokens, cards or emails are masked", () => {
  const out = cleanDetail({
    message: `OnBuy said ${FAKE.onbuySecret}; app ${FAKE.amazonClientId}; token ${FAKE.refreshToken}; stripe ${FAKE.stripeKey}; card ${FAKE.card}; mail ${FAKE.email}; via ${FAKE.proxyUrl}; Bearer abc.def`,
  });
  const text = String(out.message);
  for (const v of [FAKE.onbuySecret, FAKE.amazonClientId, FAKE.refreshToken, FAKE.stripeKey, "4242", FAKE.email, "proxypass", "proxyuser", "abc.def"]) {
    assert.ok(!text.includes(v), `${v} leaked: ${text}`);
  }
  assert.match(text, /\[email\]/);
  assert.match(text, /\[redacted\]/);
  // Ordinary words and counts survive.
  assert.equal(scrubText("Read 1,200 listings: 85 changed, 3 out of stock"), "Read 1,200 listings: 85 changed, 3 out of stock");
});

test("no secret survives anywhere in a nested detail", () => {
  const nested = cleanDetail({ outer: { inner: { deeper: FAKE.refreshToken }, list: [FAKE.email, { token: "x" }], note: FAKE.amazonClientId } });
  const json = JSON.stringify(nested);
  for (const v of [FAKE.refreshToken, FAKE.email, FAKE.amazonClientId]) assert.ok(!json.includes(v), v);
  assert.ok(!json.includes('"token"'));
});

test("details are plain, small JSON", () => {
  const circular: Record<string, unknown> = { a: 1 };
  circular.self = circular;
  const out = cleanDetail({
    n: 3.14159265,
    inf: Infinity,
    big: BigInt(10),
    when: new Date("2026-11-02T10:00:00Z"),
    fn: () => 1,
    sym: Symbol("x"),
    undef: undefined,
    "bad key": 1,
    circular,
  });
  assert.equal(out.n, 3.1416);
  assert.equal(out.inf, null);
  assert.equal(out.big, 10);
  assert.equal(out.when, "2026-11-02T10:00:00.000Z");
  assert.ok(!("fn" in out) && !("sym" in out) && !("undef" in out) && !("bad key" in out));
  JSON.stringify(out); // the circular reference was cut off

  const huge = cleanDetail({ count: 5, ok: true, ...Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`k${i}`, "some words ".repeat(15)])) });
  assert.ok(JSON.stringify(huge).length <= DETAIL_MAX_CHARS);
  assert.deepEqual(huge, { truncated: true, count: 5, ok: true });

  assert.deepEqual(cleanDetail(null), {});
  assert.deepEqual(cleanDetail("text"), {});
  assert.deepEqual(cleanDetail([1, 2]), {});
  assert.equal(String(cleanDetail({ s: "a long message ".repeat(40) }).s).length, 200);
  assert.deepEqual(parseDetail("not json"), {});
  assert.deepEqual(parseDetail('{"a":1}'), { a: 1 });
});

test("recordActivity never throws: no database, unknown type, bad ids, hostile detail", async () => {
  const hostile = {
    get boom() {
      throw new Error("getter blew up");
    },
  };
  const errors = console.error;
  console.error = () => {}; // expected failures are logged; keep the test output clean
  try {
    assert.equal(await recordActivity({ type: "auth.signed_in", userId: 1, tenantId: 1, ip: "1.2.3.4" }), false);
    assert.equal(await recordActivity({ type: "no.such_type" as never, userId: 1 }), false);
    assert.equal(await recordActivity({ type: "auth.signed_in" }), false);
    assert.equal(await recordActivity({ type: "auth.signed_in", userId: -4, tenantId: 1.5 }), false);
    assert.equal(await recordActivity({ type: "auth.signed_in", userId: 1, detail: hostile }), false);
    assert.equal(await recordActivity(undefined as never), false);
  } finally {
    console.error = errors;
  }
});

test("the type catalogue and its filters", () => {
  assert.ok(ACTIVITY_TYPE_LIST.length > 30);
  for (const t of ACTIVITY_TYPE_LIST) assert.ok(t.length <= 40 && /^[a-z_]+\.[a-z_]+$/.test(t), t);
  assert.ok(PROBLEM_TYPES.includes("error.shown") && PROBLEM_TYPES.includes("reprice.failing"));
  assert.ok(!PROBLEM_TYPES.includes("auth.signed_in"));
  assert.deepEqual(typesForFilter("auth.signed_in"), ["auth.signed_in"]);
  assert.ok(typesForFilter("billing")!.every((t) => ACTIVITY_TYPES[t].category === "billing"));
  assert.deepEqual(typesForFilter("errors"), PROBLEM_TYPES);
  assert.equal(typesForFilter(""), null);
  assert.equal(typesForFilter("nonsense"), null);
});

test("changedKeys names the settings that changed, not their values", () => {
  assert.deepEqual(changedKeys({ fee: 18, boost: null, prefixes: "AB" }, { fee: 15, boost: null, prefixes: "AB" }), ["fee"]);
  assert.deepEqual(changedKeys({ a: 1 }, { a: 1, b: 2 }), ["b"]);
  assert.deepEqual(changedKeys({ a: [1, 2] }, { a: [1, 2] }), []);
});
