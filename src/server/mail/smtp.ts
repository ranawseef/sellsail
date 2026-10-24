// A small SMTP client over implicit TLS (port 465), for SellSail's own email:
// sign-up codes and password resets. Built on node:tls so nothing has to be
// installed on Hostinger.
//
// This is not marketplace traffic, so it does not use the seller's proxy. It
// talks only to the mail server named in SMTP_HOST.

import { connect, type TLSSocket } from "node:tls";
import { randomBytes } from "node:crypto";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
};

export type OutgoingMail = {
  from: string; // "SellSail <hello@sellsail.io>"
  to: string;
  subject: string;
  text: string;
  html: string;
};

const TIMEOUT_MS = 20_000;

/** Reads one SMTP reply (which may span several "250-" lines). */
class ReplyReader {
  private buf = "";
  private waiters: ((line: { code: number; text: string }) => void)[] = [];
  private failed: Error | null = null;
  private failWaiters: ((e: Error) => void)[] = [];

  constructor(sock: TLSSocket) {
    sock.setEncoding("utf8");
    sock.on("data", (chunk: string) => {
      this.buf += chunk;
      this.drain();
    });
    const fail = (e: Error) => {
      this.failed = e;
      for (const f of this.failWaiters.splice(0)) f(e);
    };
    sock.on("error", fail);
    sock.on("close", () => fail(new Error("Mail server closed the connection")));
  }

  private drain() {
    // A reply is complete when a line has a space (not "-") after the code.
    for (;;) {
      const lines = this.buf.split("\r\n");
      let end = -1;
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i]) || /^\d{3}$/.test(lines[i])) {
          end = i;
          break;
        }
      }
      if (end < 0 || this.waiters.length === 0) return;
      const replyLines = lines.slice(0, end + 1);
      this.buf = lines.slice(end + 1).join("\r\n");
      const code = Number(replyLines[end].slice(0, 3));
      const text = replyLines.map((l) => l.slice(4)).join(" ");
      this.waiters.shift()!({ code, text });
    }
  }

  next(): Promise<{ code: number; text: string }> {
    if (this.failed) return Promise.reject(this.failed);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Mail server did not answer in time")), TIMEOUT_MS);
      this.waiters.push((r) => {
        clearTimeout(timer);
        resolve(r);
      });
      this.failWaiters.push((e) => {
        clearTimeout(timer);
        reject(e);
      });
      this.drain();
    });
  }
}

function b64Lines(s: string): string {
  return (Buffer.from(s, "utf8").toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");
}

/** Only an address, never anything that could add a header or command. */
function bareAddress(addr: string): string {
  const m = /<([^<>\s]+)>\s*$/.exec(addr);
  const a = (m ? m[1] : addr).trim();
  if (!/^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(a)) throw new Error("Invalid email address");
  return a;
}

function headerText(s: string): string {
  // Non-ASCII subjects are encoded; line breaks are never allowed in headers.
  const clean = s.replace(/[\r\n]+/g, " ");
  return /^[\x20-\x7e]*$/.test(clean) ? clean : `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

export function buildMessage(mail: OutgoingMail, domain: string): string {
  const boundary = `ss_${randomBytes(12).toString("hex")}`;
  const lines = [
    `From: ${headerText(mail.from)}`,
    `To: <${bareAddress(mail.to)}>`,
    `Subject: ${headerText(mail.subject)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${randomBytes(16).toString("hex")}@${domain}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64Lines(mail.text),
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64Lines(mail.html),
    `--${boundary}--`,
    "",
  ];
  // Base64 bodies never start a line with ".", but stuff dots anyway so the
  // terminator can't appear inside the message.
  return lines.join("\r\n").replace(/\r\n\./g, "\r\n..");
}

export async function sendSmtp(cfg: SmtpConfig, mail: OutgoingMail): Promise<void> {
  const fromAddr = bareAddress(mail.from);
  const toAddr = bareAddress(mail.to);
  const domain = fromAddr.split("@")[1];

  const sock = connect({ host: cfg.host, port: cfg.port, servername: cfg.host, timeout: TIMEOUT_MS });
  const reader = new ReplyReader(sock);
  sock.on("timeout", () => sock.destroy(new Error("Mail server connection timed out")));

  const expect = async (want: number[], what: string) => {
    const r = await reader.next();
    if (!want.includes(r.code)) throw new Error(`Mail server refused ${what}: ${r.code} ${r.text}`.slice(0, 240));
    return r;
  };
  const send = (line: string) => sock.write(line + "\r\n");

  try {
    await expect([220], "the connection");
    send(`EHLO ${domain}`);
    await expect([250], "EHLO");
    send(`AUTH PLAIN ${Buffer.from(`\0${cfg.user}\0${cfg.password}`, "utf8").toString("base64")}`);
    await expect([235], "the login (check SMTP_USER and SMTP_PASSWORD)");
    send(`MAIL FROM:<${fromAddr}>`);
    await expect([250], "the sender");
    send(`RCPT TO:<${toAddr}>`);
    await expect([250, 251], "the recipient");
    send("DATA");
    await expect([354], "DATA");
    sock.write(buildMessage(mail, domain) + "\r\n.\r\n");
    await expect([250], "the message");
    send("QUIT");
  } finally {
    sock.end();
  }
}
