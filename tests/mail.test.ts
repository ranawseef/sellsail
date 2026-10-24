import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMessage } from "../src/server/mail/smtp.ts";

const mail = {
  from: "SellSail <hello@sellsail.io>",
  to: "seller@example.com",
  subject: "123456 is your SellSail verification code",
  text: "Code: 123456\n.\nend",
  html: "<p>£5 – 123456</p>",
};

test("builds a multipart message with base64 bodies and safe headers", () => {
  const msg = buildMessage(mail, "sellsail.io");
  assert.match(msg, /^From: SellSail <hello@sellsail\.io>\r\n/);
  assert.match(msg, /\r\nTo: <seller@example\.com>\r\n/);
  assert.match(msg, /\r\nSubject: 123456 is your SellSail verification code\r\n/);
  assert.match(msg, /Content-Type: multipart\/alternative; boundary="ss_[0-9a-f]{24}"/);
  assert.ok(msg.includes(Buffer.from(mail.text).toString("base64").slice(0, 20)));
  // No bare "." line that would end the SMTP DATA early.
  assert.ok(!/\r\n\.\r\n/.test(msg));
});

test("refuses header injection through the recipient", () => {
  assert.throws(() => buildMessage({ ...mail, to: "a@b.com\r\nBcc: x@y.com" }, "sellsail.io"));
});

test("encodes non-ASCII subjects and strips line breaks", () => {
  const msg = buildMessage({ ...mail, subject: "Prix £5\r\nBcc: x@y.com" }, "sellsail.io");
  assert.match(msg, /\r\nSubject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=\r\n/);
  assert.ok(!/\r\nBcc:/.test(msg));
});
