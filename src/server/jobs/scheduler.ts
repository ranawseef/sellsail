// Runs due jobs. No Redis, no queue server: the jobs table is the queue and a
// lease (lease_owner + lease_until) is the lock.
//
// - A worker claims a job with one conditional UPDATE; only one claim can win,
//   even with several Passenger processes polling the same table.
// - A crashed worker's lease simply expires and the job becomes due again.
// - Fairness: oldest-due first, at most one running job per workspace, and a
//   run is capped in time (a reprice run is ~10 Amazon calls), so a big
//   catalogue can't starve a small one.
// - Paused workspaces and lapsed subscriptions are never claimed (kill switch).
//
// Started in-process from src/instrumentation.ts. Passenger idles the app when
// there is no traffic, so a Hostinger cron hits /api/cron/tick every minute;
// that request wakes the process and makes sure this loop is running.

import { hostname } from "node:os";
import { randomBytes } from "node:crypto";
import { exec, one, q, withConnection } from "../db/pool.ts";
import { logEvent } from "../audit.ts";
import { planFor } from "../../config/plans.ts";
import { runReprice } from "./reprice.ts";
import { runPush } from "./push.ts";
import { runImport } from "./import.ts";
import { runCompete } from "./compete.ts";
import { sendLifecycleEmails } from "../mail/lifecycle.ts";
import type { JobKind } from "./registry.ts";
import type { JobCtx, RunResult } from "./types.ts";

export const RUN_BUDGET_MS = 110_000;
const LEASE_S = Math.ceil(RUN_BUDGET_MS / 1000) + 60;
const POLL_MS = 3_000;
export const MAX_CONCURRENT = Math.max(1, Math.min(8, Number(process.env.JOB_CONCURRENCY ?? 3)));

// Next bundles the cron route and instrumentation.ts separately, so this
// module can be loaded twice in one process. Keep its state on globalThis so
// both copies share one worker identity, one pool and one loop.
type PoolState = {
  owner: string;
  started: boolean;
  timer: NodeJS.Timeout | null;
  polling: boolean;
  running: Map<number, number>;
  lastMaintenance: number;
};
const g = globalThis as unknown as { __ssJobs?: PoolState };
const pool: PoolState = (g.__ssJobs ??= {
  owner: `${hostname().slice(0, 30)}:${process.pid}:${randomBytes(4).toString("hex")}`,
  started: false,
  timer: null,
  polling: false,
  running: new Map(),
  lastMaintenance: 0,
});
const OWNER = pool.owner;


type DueJob = { id: number; tenant_id: number; kind: JobKind; target_id: number; interval_s: number; state_json: string | null; plan: string };

const RUNNERS: Record<JobKind, (ctx: JobCtx) => Promise<RunResult>> = {
  reprice: runReprice,
  push: runPush,
  import: runImport,
  compete: runCompete,
};

const JOB_LABEL: Record<JobKind, string> = { reprice: "Repricing", push: "OnBuy sync", import: "Import", compete: "Competition" };

// The SQL form of canRunJobs() in config/plans.ts.
const TENANT_MAY_RUN = `t.paused = 0 AND (t.comp_until IS NULL OR t.comp_until > NOW(3)) AND (t.plan_status IN ('active', 'past_due') OR (t.plan_status = 'trialing' AND t.trial_ends_at > NOW(3)))`;

export async function dueJobs(limit = 20): Promise<DueJob[]> {
  return q<DueJob>(
    `SELECT j.id, j.tenant_id, j.kind, j.target_id, j.interval_s, j.state_json, t.plan
       FROM jobs j JOIN tenants t ON t.id = j.tenant_id
      WHERE j.enabled = 1
        AND (j.next_run_at <= NOW(3) OR j.run_now = 1)
        AND (j.lease_until IS NULL OR j.lease_until < NOW(3))
        AND ${TENANT_MAY_RUN}
      ORDER BY j.run_now DESC, j.next_run_at
      LIMIT ?`,
    [limit],
  );
}

export async function claim(jobId: number, owner = OWNER): Promise<boolean> {
  const res = await exec(
    `UPDATE jobs SET lease_owner = ?, lease_until = NOW(3) + INTERVAL ? SECOND, last_started_at = NOW(3), run_now = 0
      WHERE id = ? AND enabled = 1 AND (lease_until IS NULL OR lease_until < NOW(3))`,
    [owner, LEASE_S, jobId],
  );
  return res.affectedRows === 1;
}

function parseState(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Runs one claimed job to completion and releases it. Never throws. */
export async function execute(job: DueJob, via: string, owner = OWNER, budgetMs = RUN_BUDGET_MS): Promise<RunResult> {
  const started = new Date();
  const ctx: JobCtx = {
    jobId: job.id,
    tenantId: job.tenant_id,
    targetId: job.target_id,
    state: parseState(job.state_json),
    deadline: Date.now() + budgetMs,
    async heartbeat() {
      const r = await exec("UPDATE jobs SET lease_until = NOW(3) + INTERVAL ? SECOND WHERE id = ? AND lease_owner = ?", [LEASE_S, job.id, owner]);
      return r.affectedRows === 1;
    },
    async shouldStop() {
      const r = await one<{ stop: number }>(
        `SELECT (j.enabled = 0 OR NOT (${TENANT_MAY_RUN})) AS stop FROM jobs j JOIN tenants t ON t.id = j.tenant_id WHERE j.id = ?`,
        [job.id],
      );
      return !r || Boolean(Number(r.stop));
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };

  let result: RunResult;
  try {
    result = await RUNNERS[job.kind](ctx);
  } catch (err) {
    console.error(`[jobs] ${job.kind} #${job.id} (tenant ${job.tenant_id}) crashed:`, err);
    result = { ok: false, msg: `Unexpected error: ${(err as Error).message}`.slice(0, 250), nextInS: Math.max(job.interval_s, 120) };
  }

  const interval = job.kind === "push" ? planFor(job.plan).pushIntervalS : job.interval_s;
  const nextIn = Math.max(1, Math.round(result.nextInS ?? interval));
  const state = result.state ?? (Object.keys(ctx.state).length ? ctx.state : null);
  try {
    const prev = await one<{ last_ok: number | null }>("SELECT last_ok FROM jobs WHERE id = ?", [job.id]);
    await exec(
      `UPDATE jobs SET lease_owner = NULL, lease_until = NULL, last_finished_at = NOW(3), last_ok = ?, last_msg = ?,
         next_run_at = NOW(3) + INTERVAL ? SECOND, runs = runs + 1, state_json = ?,
         prog_done = ?, prog_total = ?, prog_note = ?, enabled = IF(?, 0, enabled)
       WHERE id = ? AND lease_owner = ?`,
      [
        result.ok ? 1 : 0,
        result.msg.slice(0, 255),
        nextIn,
        state ? JSON.stringify(state) : null,
        result.progress?.done ?? 0,
        result.progress?.total ?? 0,
        (result.progress?.note ?? "").slice(0, 255),
        result.disable ? 1 : 0,
        job.id,
        owner,
      ],
    );
    if (result.quiet) return result;
    await exec("INSERT INTO job_runs (job_id, tenant_id, started_at, finished_at, ok, msg, via) VALUES (?, ?, ?, NOW(3), ?, ?, ?)", [
      job.id,
      job.tenant_id,
      started,
      result.ok ? 1 : 0,
      result.msg.slice(0, 255),
      via.slice(0, 12),
    ]);
    // Tell the seller when a job starts failing, not on every failed run.
    if (!result.ok && prev?.last_ok !== 0 && !result.disable) {
      await logEvent(job.tenant_id, "error", job.kind, `${JOB_LABEL[job.kind]} problem: ${result.msg}`);
    }
  } catch (err) {
    console.error(`[jobs] could not record ${job.kind} #${job.id}:`, err);
  }
  return result;
}

// ---- in-process worker pool ----------------------------------------------


/** One look at the queue: claims what fits in the free slots and starts it. */
export async function pollOnce(via = "worker"): Promise<number> {
  if (pool.polling) return 0;
  pool.polling = true;
  let startedCount = 0;
  try {
    if (pool.running.size >= MAX_CONCURRENT) return 0;
    const busyTenants = new Set(pool.running.values());
    for (const job of await dueJobs(30)) {
      if (pool.running.size >= MAX_CONCURRENT) break;
      if (busyTenants.has(job.tenant_id)) continue;
      if (!(await claim(job.id))) continue;
      busyTenants.add(job.tenant_id);
      pool.running.set(job.id, job.tenant_id);
      startedCount++;
      void execute(job, via).finally(() => pool.running.delete(job.id));
    }
    if (Date.now() - pool.lastMaintenance > 3600_000) {
      pool.lastMaintenance = Date.now();
      void maintenance().catch((err) => console.error("[jobs] maintenance failed:", err));
      void sendLifecycleEmails().catch((err) => console.error("[mail] lifecycle emails failed:", err));
    }
  } catch (err) {
    console.error("[jobs] poll failed:", (err as Error).message);
  } finally {
    pool.polling = false;
  }
  return startedCount;
}

function schedule() {
  pool.timer = setTimeout(async () => {
    await pollOnce();
    if (pool.started) schedule();
  }, POLL_MS);
  pool.timer.unref?.();
}

/** Starts the loop once per process. Safe to call on every request. */
export function ensureSchedulerStarted(): boolean {
  if (process.env.SCHEDULER === "off") return false;
  if (pool.started) return true;
  pool.started = true;
  console.log(`[jobs] scheduler started as ${OWNER} (up to ${MAX_CONCURRENT} jobs at once)`);
  schedule();
  return true;
}

export function schedulerStatus() {
  return { owner: OWNER, started: pool.started, running: pool.running.size, max: MAX_CONCURRENT };
}

// ---- housekeeping -----------------------------------------------------------

/** Deletes old rows in small chunks, once an hour, by one process at a time. */
export async function maintenance(): Promise<void> {
  const sweeps = [
    // Free access granted in the admin panel ends on its date.
    "UPDATE tenants SET plan_status = 'expired', comp_until = NULL, comp_note = NULL WHERE comp_until IS NOT NULL AND comp_until < NOW(3) LIMIT 5000",
    "DELETE FROM sessions WHERE expires_at < NOW(3) LIMIT 5000",
    "DELETE FROM rate_limits WHERE window_start < NOW(3) - INTERVAL 1 DAY LIMIT 5000",
    "DELETE FROM oauth_states WHERE expires_at < NOW(3) LIMIT 5000",
    "DELETE FROM email_codes WHERE created_at < NOW(3) - INTERVAL 1 DAY LIMIT 5000",
    "DELETE FROM admin_codes WHERE created_at < NOW(3) - INTERVAL 1 DAY LIMIT 5000",
    "DELETE FROM admin_sessions WHERE expires_at < NOW(3) LIMIT 5000",
    "DELETE FROM admin_audit WHERE created_at < NOW(3) - INTERVAL 365 DAY LIMIT 5000",
    "DELETE FROM job_runs WHERE started_at < NOW(3) - INTERVAL 14 DAY LIMIT 5000",
    "DELETE FROM price_history WHERE created_at < NOW(3) - INTERVAL 30 DAY LIMIT 5000",
    "DELETE FROM events WHERE created_at < NOW(3) - INTERVAL 30 DAY LIMIT 5000",
  ];
  // GET_LOCK belongs to a connection, so take and release it on the same one.
  await withConnection(async (c) => {
    const [lock] = await c.q<{ got: number }>("SELECT GET_LOCK('sellsail_maintenance', 0) AS got");
    if (lock?.got !== 1) return;
    try {
      for (const sql of sweeps) {
        for (let i = 0; i < 20; i++) {
          const res = await c.exec(sql);
          if (res.affectedRows < 5000) break;
        }
      }
    } finally {
      await c.q("SELECT RELEASE_LOCK('sellsail_maintenance')");
    }
  });
}
