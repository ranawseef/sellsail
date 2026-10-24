// Secrets at rest and password hashing.

import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  decryptJson,
  decryptString,
  encryptJson,
  encryptString,
  maskHost,
  maskSecret,
  secretContext,
} from "../src/server/crypto/secrets.ts";
import { hashPassword, passwordProblem, verifyPassword } from "../src/server/auth/password.ts";

const KEY = randomBytes(32).toString("base64");
process.env.APP_ENCRYPTION_KEY = KEY;

test("round-trips a value and never stores it in the clear", () => {
  const sealed = encryptString("super-secret-key", "tenant:1:proxy");
  assert.ok(sealed.startsWith("v1:"));
  assert.ok(!sealed.includes("super-secret"));
  assert.equal(decryptString(sealed, "tenant:1:proxy"), "super-secret-key");
  // Same input twice gives different ciphertexts (random IV).
  assert.notEqual(encryptString("x", "c"), encryptString("x", "c"));
});

test("a ciphertext moved to another tenant or column does not open", () => {
  const sealed = encryptJson({ host: "p.example", password: "pw" }, secretContext.proxy(1));
  assert.deepEqual(decryptJson(sealed, secretContext.proxy(1)), { host: "p.example", password: "pw" });
  assert.throws(() => decryptJson(sealed, secretContext.proxy(2)));
  assert.throws(() => decryptJson(sealed, secretContext.sourceCredentials(1, 1)));
});

test("tampering is detected", () => {
  const sealed = encryptString("value", "ctx");
  const raw = Buffer.from(sealed.slice(3), "base64");
  raw[raw.length - 1] ^= 1;
  assert.throws(() => decryptString("v1:" + raw.toString("base64"), "ctx"));
});

test("the previous key still decrypts after rotation; new writes use the new key", () => {
  const old = encryptString("rotate-me", "ctx");
  process.env.APP_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  process.env.APP_ENCRYPTION_KEY_PREVIOUS = KEY;
  try {
    assert.equal(decryptString(old, "ctx"), "rotate-me");
    const fresh = encryptString("new", "ctx");
    delete process.env.APP_ENCRYPTION_KEY_PREVIOUS;
    assert.equal(decryptString(fresh, "ctx"), "new");
    assert.throws(() => decryptString(old, "ctx"));
  } finally {
    process.env.APP_ENCRYPTION_KEY = KEY;
    delete process.env.APP_ENCRYPTION_KEY_PREVIOUS;
  }
});

test("a missing or short key is refused with a clear message", () => {
  process.env.APP_ENCRYPTION_KEY = "";
  assert.throws(() => encryptString("x", "c"), /APP_ENCRYPTION_KEY is not set/);
  process.env.APP_ENCRYPTION_KEY = Buffer.alloc(16).toString("base64");
  assert.throws(() => encryptString("x", "c"), /32 bytes/);
  process.env.APP_ENCRYPTION_KEY = KEY;
});

test("masking shows only the tail", () => {
  assert.equal(maskSecret("ABCDEFGHIJKL"), "••••IJKL");
  assert.equal(maskSecret("short"), "••••");
  assert.equal(maskSecret(null), "••••");
  assert.equal(maskHost("proxy.example.com"), "pro•••.com");
});

test("passwords: hash verifies, wrong password and junk do not", async () => {
  const h = await hashPassword("correct horse battery");
  assert.ok(h.startsWith("scrypt$16384$8$1$"));
  assert.equal(await verifyPassword("correct horse battery", h), true);
  assert.equal(await verifyPassword("correct horse batterY", h), false);
  assert.equal(await verifyPassword("anything", "not-a-hash"), false);
  assert.equal(passwordProblem("short"), "Use at least 10 characters.");
  assert.equal(passwordProblem("long enough pw"), "");
});
