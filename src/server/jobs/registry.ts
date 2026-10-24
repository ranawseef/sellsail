// Creating and nudging scheduled jobs. One row per (workspace, kind, target):
//   reprice  target = source_accounts.id       (one per Amazon account/shard)
//   push     target = marketplace_accounts.id  (one per OnBuy account)
//   import   target = marketplace_accounts.id  (runs once when asked)

import { exec, one, type Tx } from "../db/pool.ts";

export type JobKind = "reprice" | "push" | "import";

export const DEFAULT_INTERVALS: Record<JobKind, number> = {
  reprice: 60, // a run reprices 200 ASINs and takes ~100 s at Amazon's pace
  push: 300,
  import: 3600,
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

/**
 * Spread the workspace's Amazon-sourced products over its connected Amazon
 * accounts so each account's rate budget reprices its own share. Products are
 * split by id, so the same product stays on the same account between runs.
 */
export async function rebalanceShards(tenantId: number): Promise<void> {
  const accounts = await one<{ ids: string | null }>(
    `SELECT GROUP_CONCAT(id ORDER BY id) AS ids FROM source_accounts
      WHERE tenant_id = ? AND source = 'amazon' AND status = 'connected'`,
    [tenantId],
  );
  const ids = (accounts?.ids ?? "").split(",").filter(Boolean).map(Number);
  if (ids.length === 0) {
    await exec("UPDATE products SET source_account_id = NULL WHERE tenant_id = ? AND source = 'amazon'", [tenantId]);
    return;
  }
  // ELT(1 + id mod n, a, b, c) picks the n-th account id; ids are integers we
  // read from the database, passed as placeholders.
  const placeholders = ids.map(() => "?").join(", ");
  await exec(
    `UPDATE products SET source_account_id = ELT(1 + MOD(id, ?), ${placeholders})
      WHERE tenant_id = ? AND source = 'amazon'`,
    [ids.length, ...ids, tenantId],
  );
}
