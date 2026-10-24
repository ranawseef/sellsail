// Hostinger cron hits this every minute. Passenger stops idle Node processes,
// so the request wakes the app, makes sure the in-process scheduler is
// running, and starts any due jobs straight away.
//
// Protected by CRON_SECRET in an Authorization header (never in the URL, where
// it would end up in access logs).

import { createHash, timingSafeEqual } from "node:crypto";
import { ensureSchedulerStarted, pollOnce, schedulerStatus } from "@/server/jobs/scheduler";

function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < 24 || !header) return false;
  const given = header.replace(/^Bearer\s+/i, "");
  // Compare digests so the comparison takes the same time whatever the length.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

async function tick(req: Request) {
  if (!authorised(req.headers.get("authorization"))) {
    return Response.json({ ok: false, error: "unauthorised" }, { status: 401 });
  }
  ensureSchedulerStarted();
  const startedJobs = await pollOnce("cron");
  return Response.json({ ok: true, startedJobs, ...schedulerStatus(), at: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}

export const GET = tick;
export const POST = tick;
