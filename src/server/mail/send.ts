// SellSail's automated emails: sign-up verification codes, password-reset
// codes and admin sign-in codes. They go out from the no-reply mailbox;
// replies are pointed at hello@.
//
// Settings come from env (set in hPanel):
//   SMTP_HOST      smtp.hostinger.com
//   SMTP_PORT      465
//   SMTP_USER      no-reply@sellsail.io
//   SMTP_PASSWORD  that mailbox's password
//   MAIL_FROM      optional, defaults to "SellSail <SMTP_USER>". Hostinger only
//                  sends as the signed-in mailbox or one of its aliases.
//   MAIL_REPLY_TO  optional, defaults to "SellSail <hello@sellsail.io>"

import { sendSmtp, type SmtpConfig } from "./smtp.ts";

export function mailConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD ?? "";
  if (!host || !user || !password) return null;
  return { host, port: Number(process.env.SMTP_PORT ?? 465) || 465, user, password };
}

export function mailConfigured(): boolean {
  return mailConfig() !== null;
}

function fromAddress(cfg: SmtpConfig): string {
  return process.env.MAIL_FROM?.trim() || `SellSail <${cfg.user}>`;
}

function replyTo(from: string): string | undefined {
  const r = process.env.MAIL_REPLY_TO?.trim() || "SellSail <hello@sellsail.io>";
  // No Reply-To when it would just repeat the sender.
  return from.toLowerCase().includes(r.replace(/^.*</, "").replace(/>.*$/, "").toLowerCase()) ? undefined : r;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function codeEmailHtml(heading: string, intro: string, code: string, outro: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fbfaf6;font-family:Arial,Helvetica,sans-serif;color:#10231c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #ece8dc;border-radius:16px;padding:32px">
<tr><td style="font-size:22px;font-weight:800;color:#0e7c66">SellSail</td></tr>
<tr><td style="padding-top:20px;font-size:20px;font-weight:700">${escapeHtml(heading)}</td></tr>
<tr><td style="padding-top:10px;font-size:15px;line-height:1.6;color:#33493f">${escapeHtml(intro)}</td></tr>
<tr><td style="padding:22px 0"><div style="font-size:34px;letter-spacing:10px;font-weight:800;background:#e8f5f0;border-radius:12px;padding:16px;text-align:center;font-family:Courier New,monospace">${escapeHtml(code)}</div></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#4d6159">${escapeHtml(outro)}</td></tr>
</table>
<p style="font-size:12px;color:#4d6159;max-width:480px">SellSail, sellsail.io. You got this email because someone used this address on SellSail.</p>
</td></tr></table></body></html>`;
}

/**
 * Sends a 6-digit code. Returns false (and logs why) when email isn't set up
 * or the mail server refused, so the caller can tell the user to try again.
 * The code itself is never logged.
 */
export async function sendCodeEmail(to: string, purpose: "verify" | "reset" | "admin", code: string): Promise<boolean> {
  const cfg = mailConfig();
  if (!cfg) {
    console.error("[mail] not sent: SMTP_HOST, SMTP_USER and SMTP_PASSWORD must be set");
    return false;
  }
  const copy =
    purpose === "verify"
      ? {
          subject: `${code} is your SellSail verification code`,
          heading: "Confirm your email",
          intro: "Enter this code on SellSail to finish setting up your account.",
          outro: "The code works for 15 minutes. If you didn't sign up for SellSail, you can ignore this email.",
        }
      : purpose === "admin"
        ? {
            subject: `${code} is your SellSail admin sign-in code`,
            heading: "Admin sign-in",
            intro: "Enter this code to open the SellSail admin panel.",
            outro: "The code works for 10 minutes. If you didn't try to sign in, someone has this address: nothing happens unless the code is used.",
          }
        : {
          subject: `${code} is your SellSail password reset code`,
          heading: "Reset your password",
          intro: "Enter this code on SellSail to choose a new password.",
          outro:
            "The code works for 15 minutes. If you didn't ask to reset your password, ignore this email: your password stays as it is.",
        };
  try {
    const from = fromAddress(cfg);
    await sendSmtp(cfg, {
      from,
      replyTo: replyTo(from),
      to,
      subject: copy.subject,
      text: `${copy.heading}\n\n${copy.intro}\n\n    ${code}\n\n${copy.outro}\n\nSellSail, sellsail.io`,
      html: codeEmailHtml(copy.heading, copy.intro, code, copy.outro),
    });
    return true;
  } catch (err) {
    console.error(`[mail] ${purpose} email failed: ${(err as Error).message}`);
    return false;
  }
}
