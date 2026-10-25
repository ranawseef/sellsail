// Read side of competition for the dashboard. Every query filters on tenant_id.

import { one, q } from "../db/pool.ts";
import { COMPETITOR_TTL_H } from "../../lib/competition.ts";

export type CompeteStats = {
  inPlay: number;
  checked: number;
  winning: number;
  losing: number;
  undercut: number;
  optedOut: number;
  lastCheckAt: Date | null;
  changes24h: number;
};

export async function competeStats(tenantId: number): Promise<CompeteStats> {
  const r = await one<Record<string, number | Date | null>>(
    `SELECT
       SUM(compete = 1 AND stock > 0) AS in_play,
       SUM(compete = 1 AND stock > 0 AND compete_checked_at IS NOT NULL) AS checked,
       SUM(compete = 1 AND stock > 0 AND winning = 1) AS winning,
       SUM(compete = 1 AND stock > 0 AND winning = 0) AS losing,
       SUM(compete = 1 AND stock > 0 AND competitor_price IS NOT NULL AND competitor_seen_at > NOW(3) - INTERVAL ? HOUR) AS undercut,
       SUM(compete = 0) AS opted_out,
       MAX(compete_checked_at) AS last_check
     FROM products WHERE tenant_id = ? AND marketplace = 'onbuy'`,
    [COMPETITOR_TTL_H, tenantId],
  );
  const c = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM price_history WHERE tenant_id = ? AND reason = 'compete' AND created_at > NOW(3) - INTERVAL 1 DAY",
    [tenantId],
  );
  const n = (k: string) => Number(r?.[k] ?? 0);
  return {
    inPlay: n("in_play"),
    checked: n("checked"),
    winning: n("winning"),
    losing: n("losing"),
    undercut: n("undercut"),
    optedOut: n("opted_out"),
    lastCheckAt: (r?.last_check as Date | null) ?? null,
    changes24h: Number(c?.n ?? 0),
  };
}

export type CompeteFilter = "losing" | "winning" | "unchecked" | "off" | "all";
export const COMPETE_FILTERS: CompeteFilter[] = ["losing", "winning", "unchecked", "off", "all"];

export type CompeteRow = {
  id: number;
  sku: string;
  title: string | null;
  sourcePrice: number | null;
  price: number | null;
  stock: number | null;
  competitorPrice: number | null;
  competitorSeenAt: Date | null;
  winning: boolean | null;
  checkedAt: Date | null;
  compete: boolean;
};

export const COMPETE_PAGE = 50;

export async function competeRows(tenantId: number, filter: CompeteFilter, page: number): Promise<{ rows: CompeteRow[]; total: number }> {
  const where =
    filter === "losing"
      ? "compete = 1 AND stock > 0 AND winning = 0"
      : filter === "winning"
        ? "compete = 1 AND stock > 0 AND winning = 1"
        : filter === "unchecked"
          ? "compete = 1 AND stock > 0 AND compete_checked_at IS NULL"
          : filter === "off"
            ? "compete = 0"
            : "1 = 1";
  const order = filter === "losing" ? "(price - competitor_price) DESC, id" : "compete_checked_at DESC, id";
  const offset = Math.max(0, page - 1) * COMPETE_PAGE;
  const [rows, total] = await Promise.all([
    q<Record<string, unknown>>(
      `SELECT id, sku, title, source_price, price, stock, competitor_price, competitor_seen_at, winning, compete_checked_at, compete
         FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND ${where}
        ORDER BY ${order} LIMIT ? OFFSET ?`,
      [tenantId, COMPETE_PAGE, offset],
    ),
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM products WHERE tenant_id = ? AND marketplace = 'onbuy' AND ${where}`, [tenantId]),
  ]);
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    total: Number(total?.n ?? 0),
    rows: rows.map((r) => ({
      id: Number(r.id),
      sku: String(r.sku),
      title: (r.title as string | null) ?? null,
      sourcePrice: num(r.source_price),
      price: num(r.price),
      stock: num(r.stock),
      competitorPrice: num(r.competitor_price),
      competitorSeenAt: (r.competitor_seen_at as Date | null) ?? null,
      winning: r.winning === null ? null : Boolean(r.winning),
      checkedAt: (r.compete_checked_at as Date | null) ?? null,
      compete: Boolean(r.compete),
    })),
  };
}
