// Platform-wide reads for the admin panel. Unlike everything under /app these
// cross workspaces on purpose; only admin pages (requireAdmin) call them.

import { one, q } from "../db/pool.ts";
import { PLANS, type PlanId } from "../../config/plans.ts";

const n = (v: unknown) => Number(v ?? 0);

export type PlatformStats = {
  workspaces: number;
  users: number;
  unverified: number;
  signups7d: number;
  trialing: number;
  active: number;
  pastDue: number;
  churned: number;
  paused: number;
  free: number;
  mrrPence: number;
  listings: number;
  inStock: number;
  priceChanges24h: number;
  pushed24h: number;
  onbuyConnected: number;
  jobsFailing: number;
  jobsOverdue: number;
  competing: number;
};

export async function platformStats(): Promise<PlatformStats> {
  const [t, u, p, h, j, plans, ob] = await Promise.all([
    one<Record<string, unknown>>(
      `SELECT COUNT(*) AS total,
              SUM(plan_status = 'trialing' AND trial_ends_at > NOW(3)) AS trialing,
              SUM(plan_status = 'active') AS active,
              SUM(plan_status = 'past_due') AS past_due,
              SUM(plan_status IN ('canceled','expired') OR (plan_status = 'trialing' AND trial_ends_at <= NOW(3))) AS churned,
              SUM(paused = 1) AS paused,
              SUM(comp_until IS NOT NULL) AS free,
              SUM(created_at > NOW(3) - INTERVAL 7 DAY) AS signups7d
         FROM tenants`,
    ),
    one<Record<string, unknown>>("SELECT COUNT(*) AS total, SUM(email_verified_at IS NULL) AS unverified FROM users"),
    one<Record<string, unknown>>("SELECT COUNT(*) AS total, SUM(stock > 0) AS in_stock FROM products"),
    one<Record<string, unknown>>(
      `SELECT COUNT(*) AS changes,
              (SELECT COUNT(*) FROM products WHERE pushed_at > NOW(3) - INTERVAL 1 DAY) AS pushed
         FROM price_history WHERE created_at > NOW(3) - INTERVAL 1 DAY`,
    ),
    one<Record<string, unknown>>(
      `SELECT SUM(enabled = 1 AND last_ok = 0) AS failing,
              SUM(enabled = 1 AND next_run_at < NOW(3) - INTERVAL 15 MINUTE AND (lease_until IS NULL OR lease_until < NOW(3))) AS overdue
         FROM jobs`,
    ),
    q<{ plan: string; n: number }>("SELECT plan, COUNT(*) AS n FROM tenants WHERE plan_status IN ('active','past_due') AND comp_until IS NULL GROUP BY plan"),
    one<Record<string, unknown>>(
      `SELECT (SELECT COUNT(*) FROM marketplace_accounts WHERE marketplace = 'onbuy' AND status = 'connected') AS connected,
              (SELECT COUNT(*) FROM repricer_settings WHERE compete_enabled = 1) AS competing`,
    ),
  ]);
  const mrr = plans.reduce((sum, r) => sum + (PLANS[r.plan as PlanId]?.pricePence ?? 0) * n(r.n), 0);
  return {
    workspaces: n(t?.total),
    users: n(u?.total),
    unverified: n(u?.unverified),
    signups7d: n(t?.signups7d),
    trialing: n(t?.trialing),
    active: n(t?.active),
    pastDue: n(t?.past_due),
    churned: n(t?.churned),
    paused: n(t?.paused),
    free: n(t?.free),
    mrrPence: mrr,
    listings: n(p?.total),
    inStock: n(p?.in_stock),
    priceChanges24h: n(h?.changes),
    pushed24h: n(h?.pushed),
    onbuyConnected: n(ob?.connected),
    jobsFailing: n(j?.failing),
    jobsOverdue: n(j?.overdue),
    competing: n(ob?.competing),
  };
}

/** New workspaces per day for the last `days` days (UTC), oldest first. */
export async function signupSeries(days = 30): Promise<{ day: string; n: number }[]> {
  const rows = await q<{ d: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n FROM tenants
      WHERE created_at > UTC_TIMESTAMP() - INTERVAL ? DAY GROUP BY d`,
    [days],
  );
  const by = new Map(rows.map((r) => [r.d, n(r.n)]));
  const out: { day: string; n: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    out.push({ day: d, n: by.get(d) ?? 0 });
  }
  return out;
}

/** Price changes per day across the platform, for the activity chart. */
export async function activitySeries(days = 14): Promise<{ day: string; n: number }[]> {
  const rows = await q<{ d: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n FROM price_history
      WHERE created_at > UTC_TIMESTAMP() - INTERVAL ? DAY GROUP BY d`,
    [days],
  );
  const by = new Map(rows.map((r) => [r.d, n(r.n)]));
  const out: { day: string; n: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    out.push({ day: d, n: by.get(d) ?? 0 });
  }
  return out;
}

export type TenantRow = {
  id: number;
  name: string;
  plan: string;
  planStatus: string;
  trialEndsAt: Date | null;
  paused: boolean;
  createdAt: Date;
  ownerEmail: string | null;
  listings: number;
  onbuy: string | null;
  competing: boolean;
  free: boolean;
  lastActivity: Date | null;
  failing: number;
};

export const ADMIN_PAGE = 25;

export async function listTenants(search: string, status: string, page: number): Promise<{ rows: TenantRow[]; total: number }> {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (search) {
    where.push("(t.name LIKE ? OR EXISTS (SELECT 1 FROM memberships m2 JOIN users u2 ON u2.id = m2.user_id WHERE m2.tenant_id = t.id AND u2.email LIKE ?) OR t.id = ?)");
    const like = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
    args.push(like, like, Number(search) || 0);
  }
  if (status === "free") where.push("t.comp_until IS NOT NULL");
  else if (status === "trialing") where.push("t.plan_status = 'trialing' AND t.trial_ends_at > NOW(3)");
  else if (status === "active") where.push("t.plan_status = 'active' AND t.comp_until IS NULL");
  else if (status === "past_due") where.push("t.plan_status = 'past_due'");
  else if (status === "churned") where.push("(t.plan_status IN ('canceled','expired') OR (t.plan_status = 'trialing' AND t.trial_ends_at <= NOW(3)))");
  else if (status === "paused") where.push("t.paused = 1");
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = Math.max(0, page - 1) * ADMIN_PAGE;
  const [rows, total] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT t.id, t.name, t.plan, t.plan_status, t.trial_ends_at, t.paused, t.created_at, t.comp_until,
              (SELECT u.email FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.tenant_id = t.id ORDER BY m.role = 'owner' DESC, m.created_at LIMIT 1) AS owner_email,
              (SELECT COUNT(*) FROM products p WHERE p.tenant_id = t.id) AS listings,
              (SELECT ma.status FROM marketplace_accounts ma WHERE ma.tenant_id = t.id AND ma.marketplace = 'onbuy' LIMIT 1) AS onbuy,
              (SELECT rs.compete_enabled FROM repricer_settings rs WHERE rs.tenant_id = t.id) AS competing,
              (SELECT MAX(j.last_finished_at) FROM jobs j WHERE j.tenant_id = t.id) AS last_activity,
              (SELECT COUNT(*) FROM jobs j WHERE j.tenant_id = t.id AND j.enabled = 1 AND j.last_ok = 0) AS failing
         FROM tenants t ${w}
        ORDER BY t.created_at DESC, t.id DESC LIMIT ? OFFSET ?`,
      [...args, ADMIN_PAGE, offset],
    ),
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM tenants t ${w}`, args),
  ]);
  return {
    total: n(total?.n),
    rows: rows.map((r) => ({
      id: n(r.id),
      name: String(r.name),
      plan: String(r.plan),
      planStatus: String(r.plan_status),
      trialEndsAt: (r.trial_ends_at as Date | null) ?? null,
      paused: Boolean(r.paused),
      createdAt: r.created_at as Date,
      ownerEmail: (r.owner_email as string | null) ?? null,
      listings: n(r.listings),
      onbuy: (r.onbuy as string | null) ?? null,
      competing: Boolean(n(r.competing)),
      free: r.comp_until !== null,
      lastActivity: (r.last_activity as Date | null) ?? null,
      failing: n(r.failing),
    })),
  };
}

export async function tenantDetail(id: number) {
  const t = await one<Record<string, unknown>>("SELECT * FROM tenants WHERE id = ?", [id]);
  if (!t) return null;
  const [members, jobs, events, counts, onbuy, audit, settings] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT u.id, u.email, u.name, u.email_verified_at, u.last_login_at, m.role FROM memberships m JOIN users u ON u.id = m.user_id
        WHERE m.tenant_id = ? ORDER BY m.role = 'owner' DESC, m.created_at`,
      [id],
    ),
    q<Record<string, unknown>>(
      `SELECT id, kind, enabled, last_ok, last_msg, last_finished_at, next_run_at, runs, prog_done, prog_total,
              (lease_until IS NOT NULL AND lease_until > NOW(3)) AS running
         FROM jobs WHERE tenant_id = ? ORDER BY FIELD(kind, 'import', 'reprice', 'compete', 'push'), id`,
      [id],
    ),
    q<Record<string, unknown>>("SELECT level, kind, message, created_at FROM events WHERE tenant_id = ? ORDER BY id DESC LIMIT 15", [id]),
    one<Record<string, unknown>>(
      `SELECT COUNT(*) AS total, SUM(stock > 0) AS in_stock, SUM(needs_push = 1) AS pending, SUM(push_error IS NOT NULL) AS push_errors,
              SUM(source_error IS NOT NULL) AS source_errors, SUM(winning = 1) AS winning, SUM(winning = 0) AS losing
         FROM products WHERE tenant_id = ?`,
      [id],
    ),
    one<Record<string, unknown>>("SELECT status, key_hint, last_ok_at, last_error FROM marketplace_accounts WHERE tenant_id = ? AND marketplace = 'onbuy'", [id]),
    q<Record<string, unknown>>("SELECT email, action, detail, created_at FROM admin_audit WHERE tenant_id = ? ORDER BY id DESC LIMIT 10", [id]),
    one<Record<string, unknown>>("SELECT compete_enabled, compete_strategy FROM repricer_settings WHERE tenant_id = ?", [id]),
  ]);
  return {
    id,
    name: String(t.name),
    plan: String(t.plan),
    planStatus: String(t.plan_status),
    trialEndsAt: (t.trial_ends_at as Date | null) ?? null,
    paused: Boolean(t.paused),
    createdAt: t.created_at as Date,
    onboardedAt: (t.onboarded_at as Date | null) ?? null,
    stripeCustomerId: (t.stripe_customer_id as string | null) ?? null,
    stripeSubscriptionId: (t.stripe_subscription_id as string | null) ?? null,
    compUntil: (t.comp_until as Date | null) ?? null,
    compNote: (t.comp_note as string | null) ?? null,
    members: members.map((m) => ({
      id: n(m.id),
      email: String(m.email),
      name: String(m.name),
      verified: m.email_verified_at !== null,
      lastLoginAt: (m.last_login_at as Date | null) ?? null,
      role: String(m.role),
    })),
    jobs: jobs.map((j) => ({
      id: n(j.id),
      kind: String(j.kind),
      enabled: Boolean(j.enabled),
      lastOk: j.last_ok === null ? null : Boolean(j.last_ok),
      lastMsg: String(j.last_msg ?? ""),
      lastFinishedAt: (j.last_finished_at as Date | null) ?? null,
      nextRunAt: j.next_run_at as Date,
      runs: n(j.runs),
      running: Boolean(n(j.running)),
    })),
    events: events.map((e) => ({ level: String(e.level), kind: String(e.kind), message: String(e.message), createdAt: e.created_at as Date })),
    counts: {
      total: n(counts?.total),
      inStock: n(counts?.in_stock),
      pending: n(counts?.pending),
      pushErrors: n(counts?.push_errors),
      sourceErrors: n(counts?.source_errors),
      winning: n(counts?.winning),
      losing: n(counts?.losing),
    },
    onbuy: onbuy
      ? {
          status: String(onbuy.status),
          keyHint: String(onbuy.key_hint ?? ""),
          lastOkAt: (onbuy.last_ok_at as Date | null) ?? null,
          lastError: (onbuy.last_error as string | null) ?? null,
        }
      : null,
    competing: Boolean(n(settings?.compete_enabled)),
    competeStrategy: String(settings?.compete_strategy ?? "profit"),
    audit: audit.map((a) => ({ email: String(a.email), action: String(a.action), detail: String(a.detail), createdAt: a.created_at as Date })),
  };
}

export type UserRow = {
  id: number;
  email: string;
  name: string;
  verified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  workspaces: string;
  sessions: number;
};

export async function listUsers(search: string, page: number): Promise<{ rows: UserRow[]; total: number }> {
  const like = `%${search.replace(/[%_\\]/g, "\\$&")}%`;
  const w = search ? "WHERE u.email LIKE ? OR u.name LIKE ?" : "";
  const args = search ? [like, like] : [];
  const offset = Math.max(0, page - 1) * ADMIN_PAGE;
  const [rows, total] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT u.id, u.email, u.name, u.email_verified_at, u.created_at, u.last_login_at,
              (SELECT GROUP_CONCAT(CONCAT(t.id, ':', t.name) ORDER BY t.id SEPARATOR '|') FROM memberships m JOIN tenants t ON t.id = m.tenant_id WHERE m.user_id = u.id) AS workspaces,
              (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > NOW(3)) AS sessions
         FROM users u ${w} ORDER BY u.created_at DESC, u.id DESC LIMIT ? OFFSET ?`,
      [...args, ADMIN_PAGE, offset],
    ),
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM users u ${w}`, args),
  ]);
  return {
    total: n(total?.n),
    rows: rows.map((r) => ({
      id: n(r.id),
      email: String(r.email),
      name: String(r.name),
      verified: r.email_verified_at !== null,
      createdAt: r.created_at as Date,
      lastLoginAt: (r.last_login_at as Date | null) ?? null,
      workspaces: String(r.workspaces ?? ""),
      sessions: n(r.sessions),
    })),
  };
}

export async function recentSignups(limit = 6) {
  const rows = await q<Record<string, unknown>>(
    `SELECT t.id, t.name, t.plan, t.plan_status, t.created_at,
            (SELECT u.email FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.tenant_id = t.id ORDER BY m.created_at LIMIT 1) AS email
       FROM tenants t ORDER BY t.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({ id: n(r.id), name: String(r.name), plan: String(r.plan), planStatus: String(r.plan_status), createdAt: r.created_at as Date, email: (r.email as string | null) ?? "" }));
}

export async function recentProblems(limit = 12) {
  const rows = await q<Record<string, unknown>>(
    `SELECT e.tenant_id, t.name, e.level, e.kind, e.message, e.created_at FROM events e JOIN tenants t ON t.id = e.tenant_id
      WHERE e.level IN ('warn','error') ORDER BY e.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({ tenantId: n(r.tenant_id), tenant: String(r.name), level: String(r.level), kind: String(r.kind), message: String(r.message), createdAt: r.created_at as Date }));
}

export async function jobQueue() {
  const rows = await q<Record<string, unknown>>(
    `SELECT kind, COUNT(*) AS total, SUM(enabled = 1) AS enabled,
            SUM(lease_until IS NOT NULL AND lease_until > NOW(3)) AS running,
            SUM(enabled = 1 AND (run_now = 1 OR next_run_at <= NOW(3)) AND (lease_until IS NULL OR lease_until < NOW(3))) AS due,
            SUM(enabled = 1 AND last_ok = 0) AS failing,
            MAX(last_finished_at) AS last_finished
       FROM jobs GROUP BY kind ORDER BY FIELD(kind, 'import', 'reprice', 'compete', 'push')`,
  );
  return rows.map((r) => ({
    kind: String(r.kind),
    total: n(r.total),
    enabled: n(r.enabled),
    running: n(r.running),
    due: n(r.due),
    failing: n(r.failing),
    lastFinished: (r.last_finished as Date | null) ?? null,
  }));
}

export async function failedRuns(limit = 15) {
  const rows = await q<Record<string, unknown>>(
    `SELECT r.tenant_id, t.name, j.kind, r.msg, r.started_at FROM job_runs r JOIN jobs j ON j.id = r.job_id JOIN tenants t ON t.id = r.tenant_id
      WHERE r.ok = 0 ORDER BY r.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({ tenantId: n(r.tenant_id), tenant: String(r.name), kind: String(r.kind), msg: String(r.msg), at: r.started_at as Date }));
}

export async function adminAuditLog(limit = 100) {
  const rows = await q<Record<string, unknown>>(
    `SELECT a.id, a.email, a.action, a.tenant_id, t.name AS tenant, a.detail, a.ip, a.created_at
       FROM admin_audit a LEFT JOIN tenants t ON t.id = a.tenant_id ORDER BY a.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: n(r.id),
    email: String(r.email),
    action: String(r.action),
    tenantId: r.tenant_id === null ? null : n(r.tenant_id),
    tenant: (r.tenant as string | null) ?? null,
    detail: String(r.detail),
    ip: String(r.ip),
    createdAt: r.created_at as Date,
  }));
}
