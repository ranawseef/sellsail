// Read-only queries behind the dashboard pages. Every one takes the tenant id
// from the session (never from the request) and filters on it.

import { one, q } from "../db/pool.ts";

export type Overview = {
  products: number;
  inStock: number;
  outOfStock: number;
  unpriced: number;
  pendingPush: number;
  pushErrors: number;
  sourceErrors: number;
  archived: number;
  changes24h: number;
  lastRepriceAt: Date | null;
  lastPushAt: Date | null;
};

export async function getOverview(tenantId: number): Promise<Overview> {
  const p = await one<Record<string, number | null>>(
    `SELECT COUNT(*) AS products,
            SUM(stock > 0) AS inStock,
            SUM(stock = 0) AS outOfStock,
            SUM(price IS NULL) AS unpriced,
            SUM(needs_push) AS pendingPush,
            SUM(push_error IS NOT NULL) AS pushErrors,
            SUM(source_fails > 0) AS sourceErrors,
            MAX(NULLIF(priced_at, '1970-01-01 00:00:01.000')) AS lastRepriceAt,
            MAX(pushed_at) AS lastPushAt
       FROM products WHERE tenant_id = ?`,
    [tenantId],
  );
  const archived = await one<{ n: number }>("SELECT COUNT(*) AS n FROM archived_skus WHERE tenant_id = ?", [tenantId]);
  const changes = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM price_history WHERE tenant_id = ? AND created_at > NOW(3) - INTERVAL 1 DAY",
    [tenantId],
  );
  const n = (k: string) => Number(p?.[k] ?? 0);
  return {
    products: n("products"),
    inStock: n("inStock"),
    outOfStock: n("outOfStock"),
    unpriced: n("unpriced"),
    pendingPush: n("pendingPush"),
    pushErrors: n("pushErrors"),
    sourceErrors: n("sourceErrors"),
    archived: Number(archived?.n ?? 0),
    changes24h: Number(changes?.n ?? 0),
    lastRepriceAt: (p?.lastRepriceAt as unknown as Date | null) ?? null,
    lastPushAt: (p?.lastPushAt as unknown as Date | null) ?? null,
  };
}

/** Price/stock changes per hour for the last 24 hours, oldest first, 24 buckets. */
export async function changesByHour(tenantId: number): Promise<{ hour: string; changes: number }[]> {
  const rows = await q<{ h: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00') AS h, COUNT(*) AS n FROM price_history
      WHERE tenant_id = ? AND created_at > NOW(3) - INTERVAL 24 HOUR GROUP BY h`,
    [tenantId],
  );
  const byHour = new Map(rows.map((r) => [r.h, Number(r.n)]));
  const out: { hour: string; changes: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600_000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:00`;
    out.push({ hour: key.slice(11), changes: byHour.get(key) ?? 0 });
  }
  return out;
}

export type JobRow = {
  id: number;
  kind: "reprice" | "push" | "import" | "compete";
  targetId: number;
  enabled: boolean;
  running: boolean;
  runNow: boolean;
  nextRunAt: Date;
  lastStartedAt: Date | null;
  lastFinishedAt: Date | null;
  lastOk: boolean | null;
  lastMsg: string;
  progDone: number;
  progTotal: number;
  progNote: string;
  runs: number;
  targetLabel: string;
};

export async function listJobs(tenantId: number): Promise<JobRow[]> {
  const rows = await q<Record<string, unknown>>(
    `SELECT j.id, j.kind, j.target_id, j.enabled, (j.lease_until IS NOT NULL AND j.lease_until > NOW(3)) AS running, j.run_now,
            j.next_run_at, j.last_started_at, j.last_finished_at, j.last_ok, j.last_msg, j.prog_done, j.prog_total, j.prog_note, j.runs,
            IF(j.kind = 'reprice', 'Amazon prices', 'OnBuy') AS target_label
       FROM jobs j
      WHERE j.tenant_id = ?
      ORDER BY FIELD(j.kind, 'import', 'reprice', 'compete', 'push'), j.id`,
    [tenantId],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    kind: r.kind as JobRow["kind"],
    targetId: Number(r.target_id),
    enabled: Boolean(r.enabled),
    running: Boolean(Number(r.running)),
    runNow: Boolean(r.run_now),
    nextRunAt: r.next_run_at as Date,
    lastStartedAt: (r.last_started_at as Date | null) ?? null,
    lastFinishedAt: (r.last_finished_at as Date | null) ?? null,
    lastOk: r.last_ok === null ? null : Boolean(r.last_ok),
    lastMsg: String(r.last_msg ?? ""),
    progDone: Number(r.prog_done),
    progTotal: Number(r.prog_total),
    progNote: String(r.prog_note ?? ""),
    runs: Number(r.runs),
    targetLabel: String(r.target_label),
  }));
}

export type RunRow = { id: number; kind: string; startedAt: Date; finishedAt: Date; ok: boolean; msg: string; via: string };

export async function recentRuns(tenantId: number, limit = 20): Promise<RunRow[]> {
  const rows = await q<Record<string, unknown>>(
    `SELECT r.id, j.kind, r.started_at, r.finished_at, r.ok, r.msg, r.via FROM job_runs r JOIN jobs j ON j.id = r.job_id
      WHERE r.tenant_id = ? AND r.msg NOT LIKE '%Amazon keys are not set up%'
      ORDER BY r.started_at DESC, r.id DESC LIMIT ?`,
    [tenantId, Math.min(Math.max(limit, 1), 100)],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    kind: String(r.kind),
    startedAt: r.started_at as Date,
    finishedAt: r.finished_at as Date,
    ok: Boolean(r.ok),
    msg: String(r.msg),
    via: String(r.via),
  }));
}

export type EventRow = { id: number; level: "info" | "warn" | "error"; kind: string; message: string; createdAt: Date };

export async function recentEvents(tenantId: number, limit = 20, levels: EventRow["level"][] = ["info", "warn", "error"]): Promise<EventRow[]> {
  const rows = await q<Record<string, unknown>>(
    "SELECT id, level, kind, message, created_at FROM events WHERE tenant_id = ? AND level IN (?) AND message NOT LIKE '%Amazon keys are not set up%' ORDER BY created_at DESC, id DESC LIMIT ?",
    [tenantId, levels, Math.min(Math.max(limit, 1), 100)],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    level: r.level as EventRow["level"],
    kind: String(r.kind),
    message: String(r.message),
    createdAt: r.created_at as Date,
  }));
}

export const PRODUCT_FILTERS = ["all", "in-stock", "out-of-stock", "pending", "errors", "unpriced"] as const;
export type ProductFilter = (typeof PRODUCT_FILTERS)[number];

// Fixed SQL per filter: user input picks a key, never writes SQL.
const FILTER_SQL: Record<ProductFilter, string> = {
  all: "",
  "in-stock": "AND stock > 0",
  "out-of-stock": "AND stock = 0",
  pending: "AND needs_push = 1",
  errors: "AND (push_error IS NOT NULL OR source_fails > 0)",
  unpriced: "AND price IS NULL",
};

export type ProductRow = {
  id: number;
  sku: string;
  asin: string;
  title: string | null;
  sourcePrice: number | null;
  price: number | null;
  stock: number | null;
  pushedPrice: number | null;
  pushedStock: number | null;
  needsPush: boolean;
  pricedAt: Date | null;
  pushedAt: Date | null;
  /** OnBuy refused the last update, or Amazon reads keep failing. */
  error: string | null;
  /** Why the listing is out of stock or unpriced; not an error. */
  note: string | null;
};

export const PAGE_SIZE = 50;

export async function listProducts(
  tenantId: number,
  opts: { search: string; filter: ProductFilter; page: number },
): Promise<{ rows: ProductRow[]; total: number }> {
  const where = ["tenant_id = ?"];
  const params: (string | number)[] = [tenantId];
  const s = opts.search.trim().slice(0, 64);
  if (s) {
    where.push("(sku LIKE ? OR source_ref LIKE ? OR title LIKE ?)");
    const like = `%${s.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    params.push(like, like, like);
  }
  const whereSql = `${where.join(" AND ")} ${FILTER_SQL[opts.filter] ?? ""}`;
  const total = await one<{ n: number }>(`SELECT COUNT(*) AS n FROM products WHERE ${whereSql}`, params);
  const page = Math.max(1, Math.floor(opts.page));
  const rows = await q<Record<string, unknown>>(
    `SELECT id, sku, source_ref, title, source_price, price, stock, pushed_price, pushed_stock, needs_push,
            NULLIF(priced_at, '1970-01-01 00:00:01.000') AS priced_at, pushed_at, push_error, source_error, source_fails
       FROM products WHERE ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    total: Number(total?.n ?? 0),
    rows: rows.map((r) => ({
      id: Number(r.id),
      sku: String(r.sku),
      asin: String(r.source_ref),
      title: (r.title as string | null) ?? null,
      sourcePrice: num(r.source_price),
      price: num(r.price),
      stock: num(r.stock),
      pushedPrice: num(r.pushed_price),
      pushedStock: num(r.pushed_stock),
      needsPush: Boolean(r.needs_push),
      pricedAt: (r.priced_at as Date | null) ?? null,
      pushedAt: (r.pushed_at as Date | null) ?? null,
      error: (r.push_error as string | null) ?? (Number(r.source_fails) > 0 ? ((r.source_error as string | null) ?? "Amazon read failed") : null),
      note: Number(r.source_fails) > 0 ? null : ((r.source_error as string | null) ?? null),
    })),
  };
}

export async function listArchived(tenantId: number, limit = 100) {
  return q<{ sku: string; reason: string; archived_at: Date }>(
    "SELECT sku, reason, archived_at FROM archived_skus WHERE tenant_id = ? ORDER BY archived_at DESC LIMIT ?",
    [tenantId, limit],
  );
}

export type OnboardingState = {
  proxyOk: boolean;
  proxySaved: boolean;
  /** A saved proxy that isn't working blocks OnBuy traffic until fixed or removed. */
  proxyBlocking: boolean;
  onbuyConnected: boolean;
  pricingReviewed: boolean;
  products: number;
  importRunning: boolean;
  onboarded: boolean;
};

export async function getOnboardingState(tenantId: number): Promise<OnboardingState> {
  const r = await one<Record<string, unknown>>(
    `SELECT
       (SELECT status FROM proxies WHERE tenant_id = t.id) AS proxy_status,
       (SELECT status FROM marketplace_accounts WHERE tenant_id = t.id AND marketplace = 'onbuy') AS onbuy_status,
       (SELECT COUNT(*) FROM products WHERE tenant_id = t.id) AS products,
       (SELECT COUNT(*) FROM jobs WHERE tenant_id = t.id AND kind = 'import' AND enabled = 1) AS import_running,
       t.pricing_reviewed_at, t.onboarded_at
     FROM tenants t WHERE t.id = ?`,
    [tenantId],
  );
  return {
    proxyOk: r?.proxy_status === "ok",
    proxySaved: Boolean(r?.proxy_status),
    proxyBlocking: Boolean(r?.proxy_status) && r?.proxy_status !== "ok",
    onbuyConnected: r?.onbuy_status === "connected",
    pricingReviewed: Boolean(r?.pricing_reviewed_at),
    products: Number(r?.products ?? 0),
    importRunning: Number(r?.import_running ?? 0) > 0,
    onboarded: Boolean(r?.onboarded_at),
  };
}

export async function usage(tenantId: number): Promise<{ skus: number }> {
  const r = await one<{ skus: number }>("SELECT COUNT(*) AS skus FROM products WHERE tenant_id = ?", [tenantId]);
  return { skus: Number(r?.skus ?? 0) };
}
