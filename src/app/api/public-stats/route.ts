// Platform-wide totals for the home page's "live" strip. No personal or
// per-seller data: three counts, cached for an hour at the edge.

import { one } from "@/server/db/pool";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await one<{ listings: number; changes: number; pushed: number }>(
      `SELECT (SELECT COUNT(*) FROM products) AS listings,
              (SELECT COUNT(*) FROM price_history WHERE created_at > NOW(3) - INTERVAL 7 DAY) AS changes,
              (SELECT COUNT(*) FROM products WHERE pushed_at > NOW(3) - INTERVAL 7 DAY) AS pushed`,
    );
    return Response.json(
      { listings: Number(r?.listings ?? 0), changes7d: Number(r?.changes ?? 0), pushed7d: Number(r?.pushed ?? 0) },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return Response.json({ listings: 0, changes7d: 0, pushed7d: 0 }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }
}
