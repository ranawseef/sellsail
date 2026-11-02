// Reads for the admin activity views (/admin/users/[id],
// /admin/workspaces/[id]/activity) and the overview's "Needs attention".
// Cross-workspace on purpose, like repo.ts: only admin pages call these, and
// each of those checks the admin session itself.
//
// Built mostly on what was already recorded: users, sessions, tenants,
// marketplace_accounts, jobs, job_runs, price_history and events, plus
// user_activity for the timeline and what it alone knows.

import { one, q } from "../db/pool.ts";
import { parseDetail, PROBLEM_TYPES, typesForFilter, type ActivityDetail } from "../../lib/activity.ts";
import { ATTENTION_LOOKBACK_DAYS, ATTENTION_ORDER, attentionReasons, REPEATED_ERRORS_24H, TRIAL_ENDING_DAYS, type AccountFacts, type AttentionReason } from "./activity-rules.ts";

const n = (v: unknown) => Number(v ?? 0);
const d = (v: unknown) => (v instanceof Date ? v : null);

// One row per workspace and "its user": the owner (first member) unless a
// member is named. USER_JOIN is replaced by one of the two joins below.
const FACTS_SQL = `
  SELECT t.id AS tenant_id, t.name AS tenant_name, t.plan, t.plan_status, t.trial_ends_at, t.comp_until, t.paused,
         t.onboarded_at, t.first_reprice_at, t.first_price_change_at,
         u.id AS user_id, u.email, u.name AS user_name, u.created_at AS signed_up_at, u.email_verified_at, u.last_login_at,
         (SELECT MIN(a.created_at) FROM user_activity a WHERE a.user_id = u.id AND a.type = 'auth.signed_in') AS first_sign_in_at,
         ma.status AS onbuy_status, ma.created_at AS onbuy_connected_at,
         (SELECT MIN(a.created_at) FROM user_activity a WHERE a.tenant_id = t.id AND a.type = 'onbuy.connected') AS onbuy_first_connected_at,
         (SELECT COUNT(*) FROM products p WHERE p.tenant_id = t.id) AS listings,
         COALESCE(
           (SELECT MIN(a.created_at) FROM user_activity a WHERE a.tenant_id = t.id AND a.type IN ('listings.imported', 'listings.csv_uploaded')),
           (SELECT MIN(p.created_at) FROM products p WHERE p.tenant_id = t.id)
         ) AS first_import_at,
         (SELECT j.enabled FROM jobs j WHERE j.tenant_id = t.id AND j.kind = 'reprice' ORDER BY j.id LIMIT 1) AS reprice_enabled,
         (SELECT COUNT(*) FROM job_runs r JOIN jobs j ON j.id = r.job_id
           WHERE r.tenant_id = t.id AND j.kind = 'reprice' AND r.ok = 0 AND r.started_at > NOW(3) - INTERVAL 1 DAY) AS reprice_failures_24h,
         (SELECT COUNT(*) FROM price_history h WHERE h.tenant_id = t.id AND h.created_at > NOW(3) - INTERVAL 7 DAY) AS changes_7d
    FROM tenants t
    USER_JOIN
    LEFT JOIN marketplace_accounts ma ON ma.tenant_id = t.id AND ma.marketplace = 'onbuy'`;
const FACTS_SELECT = FACTS_SQL.replace(
  "USER_JOIN",
  "JOIN users u ON u.id = (SELECT m.user_id FROM memberships m WHERE m.tenant_id = t.id ORDER BY m.role = 'owner' DESC, m.created_at LIMIT 1)",
);
const FACTS_FOR_MEMBER = FACTS_SQL.replace("USER_JOIN", "JOIN memberships mm ON mm.tenant_id = t.id AND mm.user_id = ? JOIN users u ON u.id = mm.user_id");

function toFacts(r: Record<string, unknown>): AccountFacts {
  return {
    userId: n(r.user_id),
    email: String(r.email),
    userName: String(r.user_name),
    tenantId: n(r.tenant_id),
    tenantName: String(r.tenant_name),
    signedUpAt: r.signed_up_at as Date,
    emailVerifiedAt: d(r.email_verified_at),
    lastLoginAt: d(r.last_login_at),
    firstSignInAt: d(r.first_sign_in_at),
    onbuyStatus: (r.onbuy_status as string | null) ?? null,
    onbuyConnectedAt: d(r.onbuy_connected_at),
    onbuyFirstConnectedAt: d(r.onbuy_first_connected_at),
    listings: n(r.listings),
    firstImportAt: d(r.first_import_at),
    onboardedAt: d(r.onboarded_at),
    repriceJobEnabled: Boolean(n(r.reprice_enabled)),
    paused: Boolean(n(r.paused)),
    firstRepriceAt: d(r.first_reprice_at),
    firstPriceChangeAt: d(r.first_price_change_at),
    repriceFailures24h: n(r.reprice_failures_24h),
    plan: String(r.plan),
    planStatus: String(r.plan_status),
    trialEndsAt: d(r.trial_ends_at),
    compUntil: d(r.comp_until),
    priceChanges7d: n(r.changes_7d),
  };
}

/** A workspace's facts, seen from its owner, or from the member given. */
export async function accountFacts(tenantId: number, userId?: number): Promise<AccountFacts | null> {
  const r = userId
    ? await one<Record<string, unknown>>(`${FACTS_FOR_MEMBER} WHERE t.id = ?`, [userId, tenantId])
    : await one<Record<string, unknown>>(`${FACTS_SELECT} WHERE t.id = ?`, [tenantId]);
  return r ? toFacts(r) : null;
}

// ---- needs attention ---------------------------------------------------------------

export type AttentionItem = { facts: AccountFacts; reasons: AttentionReason[] };

/**
 * Sellers who may be stuck. Only plausible candidates are read (recent
 * sign-ups, trials ending, connected without a reprice, failing reprices),
 * then the rules in activity-rules.ts decide.
 */
export async function needsAttention(limit = 500): Promise<AttentionItem[]> {
  const rows = await q<Record<string, unknown>>(
    `${FACTS_SELECT}
      WHERE u.created_at > NOW(3) - INTERVAL ? DAY
         OR (t.plan_status = 'trialing' AND t.comp_until IS NULL AND t.trial_ends_at > NOW(3) AND t.trial_ends_at <= NOW(3) + INTERVAL ? DAY)
         OR (ma.status = 'connected' AND t.first_reprice_at IS NULL)
         OR (SELECT COUNT(*) FROM job_runs r JOIN jobs j ON j.id = r.job_id
              WHERE r.tenant_id = t.id AND j.kind = 'reprice' AND r.ok = 0 AND r.started_at > NOW(3) - INTERVAL 1 DAY) >= ?
      ORDER BY t.id DESC LIMIT ?`,
    [ATTENTION_LOOKBACK_DAYS, TRIAL_ENDING_DAYS, REPEATED_ERRORS_24H, limit],
  );
  const now = new Date();
  const items: AttentionItem[] = [];
  for (const r of rows) {
    const facts = toFacts(r);
    const reasons = attentionReasons(facts, now);
    if (reasons.length) items.push({ facts, reasons });
  }
  // Most urgent reason first, then newest workspace.
  const rank = (i: AttentionItem) => ATTENTION_ORDER.indexOf(i.reasons[0].key);
  return items.sort((a, b) => rank(a) - rank(b) || b.facts.tenantId - a.facts.tenantId);
}

// ---- repricer health ---------------------------------------------------------------

export type RepricerHealth = {
  jobEnabled: boolean;
  lastRunAt: Date | null;
  lastOk: boolean | null;
  lastMsg: string;
  lastSuccessAt: Date | null;
  runs7d: number;
  failed7d: number;
  checked7d: number;
  /** Price or stock changes (price_history rows). */
  changes7d: number;
  /** Distinct listings whose price moved. */
  repriced7d: number;
  listings: number;
};

export async function repricerHealth(tenantId: number): Promise<RepricerHealth> {
  const [job, runs, changes, listings] = await Promise.all([
    one<Record<string, unknown>>("SELECT enabled, last_finished_at, last_ok, last_msg FROM jobs WHERE tenant_id = ? AND kind = 'reprice' ORDER BY id LIMIT 1", [tenantId]),
    one<Record<string, unknown>>(
      // Runs before migration 013 have no counts: "Read N listings" in msg is the same fact.
      `SELECT COUNT(*) AS runs, SUM(r.ok = 0) AS failed, SUM(r.n_checked) AS checked,
              MAX(IF(r.ok = 1 AND (r.n_checked > 0 OR r.msg LIKE 'Read %'), r.finished_at, NULL)) AS last_success
         FROM job_runs r JOIN jobs j ON j.id = r.job_id
        WHERE r.tenant_id = ? AND j.kind = 'reprice' AND r.started_at > NOW(3) - INTERVAL 7 DAY`,
      [tenantId],
    ),
    one<{ n: number; repriced: number }>(
      `SELECT COUNT(*) AS n, COUNT(DISTINCT IF(NOT (new_price <=> old_price), product_id, NULL)) AS repriced
         FROM price_history WHERE tenant_id = ? AND created_at > NOW(3) - INTERVAL 7 DAY`,
      [tenantId],
    ),
    one<{ n: number }>("SELECT COUNT(*) AS n FROM products WHERE tenant_id = ?", [tenantId]),
  ]);
  return {
    jobEnabled: Boolean(n(job?.enabled)),
    lastRunAt: d(job?.last_finished_at),
    lastOk: job?.last_ok === null || job?.last_ok === undefined ? null : Boolean(n(job.last_ok)),
    lastMsg: String(job?.last_msg ?? ""),
    lastSuccessAt: d(runs?.last_success),
    runs7d: n(runs?.runs),
    failed7d: n(runs?.failed),
    checked7d: n(runs?.checked),
    changes7d: n(changes?.n),
    repriced7d: n(changes?.repriced),
    listings: n(listings?.n),
  };
}

// ---- recent errors and the timeline ---------------------------------------------------

/** Whose activity a view shows: one user (plus their workspaces' system events), or one workspace. */
export type ActivityScope = { userId: number; tenantIds: number[] } | { tenantId: number };

function scopeSql(s: ActivityScope): { sql: string; args: (number | number[])[] } {
  if ("tenantId" in s) return { sql: "a.tenant_id = ?", args: [s.tenantId] };
  if (s.tenantIds.length === 0) return { sql: "a.user_id = ?", args: [s.userId] };
  return { sql: "(a.user_id = ? OR (a.user_id IS NULL AND a.tenant_id IN (?)))", args: [s.userId, s.tenantIds] };
}

export type ProblemRow = { source: "activity" | "notice"; type: string; detail: ActivityDetail; message: string; createdAt: Date };

/** The last week's problems: activity rows of a problem type, and error notices the seller was shown. */
export async function recentProblems(s: ActivityScope, tenantIds: number[], limit = 6): Promise<ProblemRow[]> {
  const { sql, args } = scopeSql(s);
  const [acts, notices] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT a.type, a.detail, a.created_at FROM user_activity a
        WHERE ${sql} AND a.type IN (?) AND a.created_at > NOW(3) - INTERVAL 7 DAY ORDER BY a.created_at DESC, a.id DESC LIMIT ?`,
      [...args, PROBLEM_TYPES, limit],
    ),
    tenantIds.length
      ? q<Record<string, unknown>>(
          "SELECT kind, message, created_at FROM events WHERE tenant_id IN (?) AND level = 'error' AND created_at > NOW(3) - INTERVAL 7 DAY ORDER BY id DESC LIMIT ?",
          [tenantIds, limit],
        )
      : Promise.resolve([]),
  ]);
  const rows: ProblemRow[] = [
    ...acts.map((a) => ({ source: "activity" as const, type: String(a.type), detail: parseDetail(a.detail), message: "", createdAt: a.created_at as Date })),
    ...notices.map((e) => ({ source: "notice" as const, type: String(e.kind), detail: {}, message: String(e.message), createdAt: e.created_at as Date })),
  ];
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export const TIMELINE_PAGE = 50;

export type TimelineFilter = { type: string; from: string; to: string; page: number };

/** Reads ?type=&from=&to=&page= into a filter, dropping anything that isn't valid. */
export function parseTimelineFilter(sp: Record<string, string | string[] | undefined>): TimelineFilter {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v ?? "").slice(0, 40).trim();
  };
  const date = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) ? v : "");
  const type = typesForFilter(one("type")) ? one("type") : "";
  let from = date(one("from"));
  let to = date(one("to"));
  if (from && to && from > to) [from, to] = [to, from];
  return { type, from, to, page: Math.max(1, Math.min(10_000, Number(one("page")) || 1)) };
}

export type TimelineRow = { id: number; type: string; detail: ActivityDetail; ip: string | null; createdAt: Date; userId: number | null; userEmail: string | null };

export async function activityTimeline(s: ActivityScope, f: TimelineFilter): Promise<{ rows: TimelineRow[]; total: number }> {
  const { sql, args } = scopeSql(s);
  const where = [sql];
  const params: (number | number[] | string | string[] | Date)[] = [...args];
  const types = typesForFilter(f.type);
  if (types) {
    where.push("a.type IN (?)");
    params.push(types);
  }
  if (f.from) {
    where.push("a.created_at >= ?");
    params.push(new Date(`${f.from}T00:00:00Z`));
  }
  if (f.to) {
    where.push("a.created_at < ?");
    params.push(new Date(Date.parse(`${f.to}T00:00:00Z`) + 86400_000)); // the "to" day is included
  }
  const w = where.join(" AND ");
  const [rows, total] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT a.id, a.type, a.detail, a.ip, a.created_at, a.user_id, u.email
         FROM user_activity a LEFT JOIN users u ON u.id = a.user_id
        WHERE ${w} ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?`,
      [...params, TIMELINE_PAGE, (f.page - 1) * TIMELINE_PAGE],
    ),
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM user_activity a WHERE ${w}`, params),
  ]);
  return {
    total: n(total?.n),
    rows: rows.map((r) => ({
      id: n(r.id),
      type: String(r.type),
      detail: parseDetail(r.detail),
      ip: (r.ip as string | null) ?? null,
      createdAt: r.created_at as Date,
      userId: r.user_id === null ? null : n(r.user_id),
      userEmail: (r.email as string | null) ?? null,
    })),
  };
}

// ---- the two views --------------------------------------------------------------------

export type ActivityUser = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  lastSeenAt: Date | null;
  workspaces: { id: number; name: string; role: string }[];
};

/** When the user was last around: a session in use, a sign-in, or something they did. */
async function lastSeen(userId: number): Promise<Date | null> {
  const r = await one<Record<string, unknown>>(
    `SELECT (SELECT MAX(s.last_seen_at) FROM sessions s WHERE s.user_id = ?) AS session_at,
            (SELECT u.last_login_at FROM users u WHERE u.id = ?) AS login_at,
            (SELECT MAX(a.created_at) FROM user_activity a WHERE a.user_id = ?) AS activity_at`,
    [userId, userId, userId],
  );
  const times = [d(r?.session_at), d(r?.login_at), d(r?.activity_at)].filter((x): x is Date => x !== null);
  return times.length ? new Date(Math.max(...times.map((t) => t.getTime()))) : null;
}

export async function activityUser(userId: number): Promise<ActivityUser | null> {
  const u = await one<Record<string, unknown>>("SELECT id, email, name, created_at FROM users WHERE id = ?", [userId]);
  if (!u) return null;
  const [ws, seen] = await Promise.all([
    q<Record<string, unknown>>(
      "SELECT t.id, t.name, m.role FROM memberships m JOIN tenants t ON t.id = m.tenant_id WHERE m.user_id = ? ORDER BY m.created_at",
      [userId],
    ),
    lastSeen(userId),
  ]);
  return {
    id: n(u.id),
    email: String(u.email),
    name: String(u.name),
    createdAt: u.created_at as Date,
    lastSeenAt: seen,
    workspaces: ws.map((w) => ({ id: n(w.id), name: String(w.name), role: String(w.role) })),
  };
}

/** The workspace's members, for its activity view, with when each was last seen. */
export async function workspaceMembers(tenantId: number): Promise<{ id: number; email: string; role: string; lastSeenAt: Date | null }[]> {
  const rows = await q<Record<string, unknown>>(
    "SELECT u.id, u.email, m.role FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.tenant_id = ? ORDER BY m.role = 'owner' DESC, m.created_at",
    [tenantId],
  );
  return Promise.all(rows.map(async (r) => ({ id: n(r.id), email: String(r.email), role: String(r.role), lastSeenAt: await lastSeen(n(r.id)) })));
}
