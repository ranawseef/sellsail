// Who did what in a workspace. Never put secrets in `detail`: describe the
// change ("OnBuy keys replaced, key ••••a1b2"), don't copy it.

import { exec, type Tx } from "./db/pool.ts";

export type AuditEntry = {
  tenantId: number;
  userId: number | null;
  action: string;
  detail?: string;
  ip?: string;
};

export async function audit(e: AuditEntry, t?: Tx): Promise<void> {
  const run = t ? t.exec.bind(t) : exec;
  await run("INSERT INTO audit_log (tenant_id, user_id, action, detail, ip) VALUES (?, ?, ?, ?, ?)", [
    e.tenantId,
    e.userId,
    e.action.slice(0, 64),
    (e.detail ?? "").slice(0, 500),
    (e.ip ?? "").slice(0, 45),
  ]);
}

export type EventLevel = "info" | "warn" | "error";

/** Something the seller should see in the activity feed. */
export async function logEvent(tenantId: number, level: EventLevel, kind: string, message: string, t?: Tx): Promise<void> {
  const run = t ? t.exec.bind(t) : exec;
  await run("INSERT INTO events (tenant_id, level, kind, message) VALUES (?, ?, ?, ?)", [
    tenantId,
    level,
    kind.slice(0, 32),
    message.slice(0, 500),
  ]);
}
