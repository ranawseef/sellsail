// Records customer activity (src/lib/activity.ts lists the types): product
// events from server actions, jobs and the Stripe webhook, so SellSail staff
// can see on /admin what a seller did, how their repricer is doing and where
// they are stuck. Server-side only: no browser tracking, page views,
// keystrokes, session replay or third-party analytics.
//
// recordActivity() never throws. An activity row is never worth failing the
// seller's request for, so a problem is logged (type and error name only) and
// the request carries on. Rows are only ever inserted; they leave with the
// 12-month retention sweep below or when their user or workspace is deleted.

import { exec, one, type Tx } from "./db/pool.ts";
import { cleanDetail, isActivityType, type ActivityType } from "../lib/activity.ts";

export const ACTIVITY_RETENTION_MONTHS = 12;
const WRITE_TIMEOUT_MS = 3000;

export type ActivityEvent = {
  type: ActivityType;
  tenantId?: number | null;
  /** The seller who did it; null for system events (jobs, Stripe). */
  userId?: number | null;
  /** Counts, ids, setting names, our own short messages. Never secrets: cleanDetail() also checks. */
  detail?: Record<string, unknown>;
  /** Kept only for sign-in events (auth.*), where it is already recorded for security. */
  ip?: string | null;
};

const id = (v: unknown): number | null => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null);

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
    timer.unref?.();
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/** One activity row. Resolves true when written, false when not; never rejects. */
export async function recordActivity(e: ActivityEvent): Promise<boolean> {
  let type = "?";
  try {
    type = String(e?.type).slice(0, 40);
    if (!isActivityType(e.type)) throw new Error("unknown activity type");
    const tenantId = id(e.tenantId);
    const userId = id(e.userId);
    if (!tenantId && !userId) throw new Error("no user or workspace");
    const detail = JSON.stringify(cleanDetail(e.detail ?? {}));
    const ip = e.type.startsWith("auth.") && typeof e.ip === "string" && e.ip ? e.ip.slice(0, 45) : null;
    await withTimeout(
      exec("INSERT INTO user_activity (tenant_id, user_id, type, detail, ip) VALUES (?, ?, ?, ?, ?)", [tenantId, userId, e.type, detail, ip]),
      WRITE_TIMEOUT_MS,
    );
    return true;
  } catch (err) {
    // Name and message only: a driver error can carry the query and its values.
    const x = err as Error;
    console.error(`[activity] ${type} not recorded: ${x?.name ?? "Error"}: ${String(x?.message ?? err).slice(0, 160)}`);
    return false;
  }
}

/** The user's first workspace, for events that know only the user (sign-in, password reset). */
export async function primaryTenantOf(userId: number): Promise<number | null> {
  try {
    const m = await one<{ tenant_id: number }>("SELECT tenant_id FROM memberships WHERE user_id = ? ORDER BY created_at LIMIT 1", [userId]);
    return m?.tenant_id ?? null;
  } catch {
    return null;
  }
}

// ---- job runs -------------------------------------------------------------------------

export type RunStats = { checked: number; changed: number; skipped: number; errors: number; priceChanged?: number };

export type FinishedRun = {
  tenantId: number;
  kind: string;
  ok: boolean;
  msg: string;
  /** The job's last_ok before this run (null on its first run). */
  prevOk: boolean | null;
  stats?: RunStats;
};

/**
 * What a finished reprice or push run means for the timeline: the moment it
 * starts failing or recovers, and the workspace's first successful reprice and
 * first price change. Every run is also summed into the hourly summaries.
 * Never throws.
 */
export async function noteJobRun(r: FinishedRun): Promise<void> {
  try {
    const prefix = r.kind === "reprice" ? "reprice" : r.kind === "push" ? "stock_sync" : null;
    if (!prefix) return;
    if (!r.ok && r.prevOk !== false) {
      await recordActivity({ type: `${prefix}.failing` as ActivityType, tenantId: r.tenantId, detail: { message: r.msg } });
    } else if (r.ok && r.prevOk === false) {
      await recordActivity({ type: `${prefix}.recovered` as ActivityType, tenantId: r.tenantId, detail: { message: r.msg } });
    }
    if (r.kind !== "reprice" || !r.ok || !r.stats) return;
    if (r.stats.checked > 0) {
      const res = await exec("UPDATE tenants SET first_reprice_at = NOW(3) WHERE id = ? AND first_reprice_at IS NULL", [r.tenantId]);
      if (res.affectedRows === 1) await recordActivity({ type: "reprice.first_success", tenantId: r.tenantId, detail: { checked: r.stats.checked } });
    }
    if ((r.stats.priceChanged ?? 0) > 0) {
      const res = await exec("UPDATE tenants SET first_price_change_at = NOW(3) WHERE id = ? AND first_price_change_at IS NULL", [r.tenantId]);
      if (res.affectedRows === 1) await recordActivity({ type: "reprice.first_price_change", tenantId: r.tenantId, detail: { changed: r.stats.priceChanged ?? 0 } });
    }
  } catch (err) {
    console.error(`[activity] job run not noted: ${(err as Error)?.name ?? "Error"}`);
  }
}

// ---- housekeeping (called by the hourly maintenance, under its lock) -------------------

const floorHour = (d: Date) => new Date(Math.floor(d.getTime() / 3600_000) * 3600_000);

/**
 * One summary row per workspace, job kind and clock hour with work in it, for
 * the last 24 complete hours: runs, failed runs and the per-run counts. A
 * reprice run every minute would otherwise mean ~250,000 rows a year per
 * workspace. Stamped with the hour's end and skipped if already there, so it
 * is safe to run any number of times.
 */
export async function recordHourlySummaries(c: Tx, now = new Date()): Promise<number> {
  const to = floorHour(now);
  const from = new Date(to.getTime() - 24 * 3600_000);
  const res = await c.exec(
    `INSERT INTO user_activity (tenant_id, user_id, type, detail, created_at)
     SELECT s.tenant_id, NULL, s.type, s.detail, s.hour_end FROM (
       SELECT r.tenant_id,
              IF(j.kind = 'reprice', 'reprice.hourly', 'stock_sync.hourly') AS type,
              TIMESTAMP(DATE_FORMAT(r.started_at, '%Y-%m-%d %H:00:00')) + INTERVAL 1 HOUR AS hour_end,
              JSON_OBJECT('runs', COUNT(*), 'failedRuns', SUM(r.ok = 0), 'checked', SUM(r.n_checked),
                          'changed', SUM(r.n_changed), 'skipped', SUM(r.n_skipped), 'errors', SUM(r.n_errors)) AS detail
         FROM job_runs r JOIN jobs j ON j.id = r.job_id
        WHERE j.kind IN ('reprice', 'push') AND r.started_at >= ? AND r.started_at < ?
        GROUP BY r.tenant_id, type, hour_end
       HAVING SUM(r.n_checked) > 0 OR SUM(r.ok = 0) > 0
     ) s
     WHERE NOT EXISTS (SELECT 1 FROM user_activity a WHERE a.tenant_id = s.tenant_id AND a.type = s.type AND a.created_at = s.hour_end)`,
    [from, to],
  );
  return res.affectedRows;
}

/** Free access granted by an admin ends on its date: note it before the sweep clears comp_until. */
export async function recordFreeAccessEnding(c: Tx): Promise<void> {
  await c.exec(
    `INSERT INTO user_activity (tenant_id, user_id, type, detail)
     SELECT id, NULL, 'billing.free_access_ended', JSON_OBJECT('plan', plan) FROM tenants
      WHERE comp_until IS NOT NULL AND comp_until < NOW(3) LIMIT 5000`,
  );
}

/** The retention sweep, run in chunks by the hourly maintenance like its other sweeps. */
export const PRUNE_ACTIVITY_SQL = `DELETE FROM user_activity WHERE created_at < NOW(3) - INTERVAL ${ACTIVITY_RETENTION_MONTHS} MONTH LIMIT 5000`;
