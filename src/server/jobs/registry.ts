// Creating and nudging scheduled jobs. One row per (workspace, kind, target):
//   reprice  target = 0                        (one per workspace; SellSail's Amazon keys)
//   push     target = marketplace_accounts.id  (one per OnBuy account)
//   import   target = marketplace_accounts.id  (runs once when asked)
//   compete  target = marketplace_accounts.id  (OnBuy competition checks)

import { exec, type Tx } from "../db/pool.ts";

/** The reprice job's target id: it isn't tied to any seller account. */
export const REPRICE_TARGET = 0;

/**
 * Makes sure the workspace has its reprice job, without touching it if it
 * exists (so a seller who switched repricing off keeps it off).
 */
export async function ensureRepriceJob(tenantId: number, t?: Tx): Promise<void> {
  const run = t ? t.exec.bind(t) : exec;
  await run(
    `INSERT IGNORE INTO jobs (tenant_id, kind, target_id, enabled, interval_s, next_run_at)
     VALUES (?, 'reprice', ?, 1, ?, NOW(3))`,
    [tenantId, REPRICE_TARGET, DEFAULT_INTERVALS.reprice],
  );
}

export type JobKind = "reprice" | "push" | "import" | "compete";

export const DEFAULT_INTERVALS: Record<JobKind, number> = {
  reprice: 60, // a run reprices 200 ASINs and takes ~100 s at Amazon's pace
  push: 300,
  import: 3600,
  compete: 120, // each run checks the listings that are due (plan sets how often)
};

export async function ensureJob(
  tenantId: number,
  kind: JobKind,
  targetId: number,
  opts: { intervalS?: number; enabled?: boolean; runNow?: boolean; state?: unknown } = {},
  t?: Tx,
): Promise<void> {
  const run = t ? t.exec.bind(t) : exec;
  await run(
    `INSERT INTO jobs (tenant_id, kind, target_id, enabled, interval_s, run_now, state_json, next_run_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3))
     ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), interval_s = VALUES(interval_s),
       run_now = GREATEST(run_now, VALUES(run_now)),
       state_json = IF(VALUES(state_json) IS NULL, state_json, VALUES(state_json))`,
    [
      tenantId,
      kind,
      targetId,
      opts.enabled === false ? 0 : 1,
      opts.intervalS ?? DEFAULT_INTERVALS[kind],
      opts.runNow ? 1 : 0,
      opts.state === undefined ? null : JSON.stringify(opts.state),
    ],
  );
}

/** Ask for a job to run as soon as a worker is free. Tenant-scoped. */
export async function runJobNow(tenantId: number, jobId: number): Promise<boolean> {
  const res = await exec("UPDATE jobs SET run_now = 1 WHERE id = ? AND tenant_id = ? AND enabled = 1", [jobId, tenantId]);
  return res.affectedRows > 0;
}

export async function setJobsEnabled(tenantId: number, kind: JobKind, enabled: boolean): Promise<void> {
  await exec("UPDATE jobs SET enabled = ? WHERE tenant_id = ? AND kind = ?", [enabled ? 1 : 0, tenantId, kind]);
}

export async function deleteJobs(tenantId: number, kind: JobKind, targetId: number): Promise<void> {
  await exec("DELETE FROM jobs WHERE tenant_id = ? AND kind = ? AND target_id = ?", [tenantId, kind, targetId]);
}
