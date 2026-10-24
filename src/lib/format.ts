// Display formatting for the dashboard. Pure, so server and client agree.

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const whole = new Intl.NumberFormat("en-GB");

export function formatGBP(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "—" : gbp.format(value);
}

export function formatCount(value: number): string {
  return whole.format(value);
}

/** "3 min ago", "2 h ago", "5 days ago"; "—" for no date. */
export function timeAgo(date: Date | string | null | undefined, now = Date.now()): string {
  if (!date) return "—";
  const s = Math.round((now - new Date(date).getTime()) / 1000);
  if (s < 0) return timeUntil(date, now);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** "in 2 min", "in 3 h", "now" for a time already passed. */
export function timeUntil(date: Date | string | null | undefined, now = Date.now()): string {
  if (!date) return "—";
  const s = Math.round((new Date(date).getTime() - now) / 1000);
  if (s <= 30) return "now";
  if (s < 3600) return `in ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `in ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

export function daysLeft(date: Date | string | null | undefined, now = Date.now()): number {
  if (!date) return 0;
  return Math.max(0, Math.ceil((new Date(date).getTime() - now) / 86400_000));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}
