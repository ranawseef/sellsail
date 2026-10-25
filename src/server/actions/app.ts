"use server";

// Every action the dashboard can take. Server actions are public POST
// endpoints, so each one looks up the session and role itself, takes the
// workspace id only from the session, and validates every field.
//
// Roles: member = view and "run now"; admin = connections, pricing, imports,
// settings, billing; owner = everything, including deleting the workspace.

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authForAction, appUrl, ForbiddenError, requestInfo } from "../auth/context.ts";
import { hit, LIMITS } from "../auth/rate-limit.ts";
import { deleteUserSessions } from "../auth/sessions.ts";
import { passwordProblem, PASSWORD_MAX } from "../auth/password.ts";
import { changePassword } from "../tenants/accounts.ts";
import { audit, logEvent } from "../audit.ts";
import { exec, one } from "../db/pool.ts";
import { loadProxy, parseProxyInput, removeProxy, routeForTenant, saveProxy, testProxy } from "../connections/proxy.ts";
import { connectOnBuy, disconnectOnBuy, getOnBuyAccount, parseOnBuyKeys } from "../connections/onbuy.ts";
import { repriceLocally, saveBands, saveCompete, saveSettings, getSettings } from "../repos/pricing.ts";
import { startOnBuyImport, upsertListings } from "../jobs/import.ts";
import { runJobNow } from "../jobs/registry.ts";
import { requestFullPush } from "../jobs/push.ts";
import { ensureSchedulerStarted, pollOnce } from "../jobs/scheduler.ts";
import { BillingError, checkoutUrl, portalUrl } from "../billing/stripe.ts";
import { EgressBlockedError, ProxyFailureError } from "../net/egress.ts";
import { OnBuyError } from "../integrations/onbuy/client.ts";
import { AmazonError } from "../integrations/amazon/spapi.ts";
import { SecretsConfigError } from "../crypto/secrets.ts";
import { CSV_MAX_BYTES, readListingsCsv } from "../../lib/csv.ts";
import { parsePrefixes } from "../../lib/sku.ts";
import { PAID_PLANS, planFor, type PlanId } from "../../config/plans.ts";
import type { PricingBand } from "../../lib/pricing.ts";

export type ActionState = { ok?: boolean; message?: string; error?: string; fieldErrors?: Record<string, string> } | undefined;

// Errors whose message is written for the seller and safe to show.
const SHOWABLE = [ForbiddenError, EgressBlockedError, ProxyFailureError, OnBuyError, AmazonError, SecretsConfigError, BillingError];

async function attempt(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (err) {
    unstable_rethrow(err); // let redirect() through
    if (SHOWABLE.some((E) => err instanceof E)) return { error: (err as Error).message };
    console.error("[action] failed:", err);
    return { error: "Something went wrong on our side. Please try again in a minute." };
  }
}

function refreshApp() {
  revalidatePath("/app", "layout");
}

/** Start due jobs now instead of waiting for the next poll (unless SCHEDULER=off). */
function kickScheduler() {
  if (ensureSchedulerStarted()) void pollOnce("ui").catch(() => {});
}

const str = (form: FormData, k: string) => String(form.get(k) ?? "");
const money = (label: string, max: number) =>
  z.coerce.number({ error: `${label} must be a number.` }).min(0, `${label} can't be negative.`).max(max, `${label} is too high.`);

// The wizard tells an action where to go next; only wizard steps are allowed.
function wizardNext(form: FormData): string | null {
  const v = str(form, "next");
  return /^\/app\/onboarding\?step=[a-z]+$/.test(v) ? v : null;
}

async function connectionTestAllowed(tenantId: number): Promise<boolean> {
  return hit(`conn-test:${tenantId}`, LIMITS.connectionTestPerTenant);
}

// ---- proxy -------------------------------------------------------------------

export async function saveProxyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let next: string | null = null;
  const state = await attempt(async () => {
    const auth = await authForAction("admin");
    if (!(await connectionTestAllowed(auth.tenantId))) return { error: "Too many connection tests this hour. Please wait a little." };

    const existing = await loadProxy(auth.tenantId);
    const input = {
      type: str(form, "type"),
      host: str(form, "host"),
      port: str(form, "port"),
      username: str(form, "username"),
      password: str(form, "password"),
    };
    // The saved password is never sent to the browser; an empty box keeps it.
    if (!input.password && existing?.config?.password && existing.config.host === input.host.trim()) {
      input.password = existing.config.password;
    }
    const parsed = parseProxyInput(input);
    if (!parsed.ok) return { error: parsed.error };

    await saveProxy(auth.tenantId, parsed.config);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "proxy.save", detail: `${parsed.config.type} proxy on port ${parsed.config.port}`, ip });
    refreshApp();
    try {
      const egress = await testProxy(auth.tenantId);
      next = wizardNext(form);
      return { ok: true, message: `Proxy works. OnBuy will see the IP address ${egress}.` };
    } catch (err) {
      return {
        error: `Saved, but the test failed: ${(err as Error).message}. Nothing is sent to OnBuy until it works, or until you remove the proxy.`,
      };
    }
  });
  if (next) redirect(next);
  return state;
}

export async function removeProxyAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    if (!(await removeProxy(auth.tenantId))) return { error: "There was no proxy to remove." };
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "proxy.remove", ip });
    await logEvent(auth.tenantId, "info", "proxy", "Proxy removed. OnBuy requests now go direct from SellSail.");
    refreshApp();
    kickScheduler();
    return { ok: true, message: "Proxy removed. OnBuy requests now go direct from SellSail." };
  });
}

export async function testProxyAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("member");
    if (!(await connectionTestAllowed(auth.tenantId))) return { error: "Too many connection tests this hour. Please wait a little." };
    const ip = await testProxy(auth.tenantId);
    refreshApp();
    return { ok: true, message: `Proxy works. Exit IP ${ip}.` };
  });
}

// ---- OnBuy ---------------------------------------------------------------------

/** Direct, or the workspace's proxy. A saved proxy that isn't working blocks the call. */
async function requireRoute(tenantId: number) {
  const { route, reason } = await routeForTenant(tenantId);
  if (!route) throw new EgressBlockedError(`${reason}. Fix the proxy, or remove it to connect directly.`);
  return route;
}

export async function connectOnBuyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let next: string | null = null;
  const state = await attempt(async () => {
    const auth = await authForAction("admin");
    if (!(await connectionTestAllowed(auth.tenantId))) return { error: "Too many connection tests this hour. Please wait a little." };
    const creds = parseOnBuyKeys(str(form, "consumerKey"), str(form, "secretKey"));
    if (typeof creds === "string") return { error: creds };
    const route = await requireRoute(auth.tenantId);
    const acc = await connectOnBuy(auth.tenantId, route, creds);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "onbuy.connect", detail: `Consumer key ${acc.keyHint}`, ip });
    await logEvent(auth.tenantId, "info", "onbuy", "OnBuy connected.");
    refreshApp();
    next = wizardNext(form);
    return { ok: true, message: "Connected to OnBuy. Your keys are stored encrypted." };
  });
  if (next) redirect(next);
  return state;
}

export async function disconnectOnBuyAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    await disconnectOnBuy(auth.tenantId);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "onbuy.disconnect", ip });
    refreshApp();
    return { ok: true, message: "OnBuy disconnected and its keys deleted." };
  });
}

// ---- pricing -------------------------------------------------------------------

function bandsFromForm(form: FormData): PricingBand[] | string {
  const upTo = form.getAll("upTo").map(String);
  const pct = form.getAll("profitPct").map(String);
  const fixed = form.getAll("fixedProfit").map(String);
  const min = form.getAll("minProfit").map(String);
  if (upTo.length === 0 || upTo.length > 30 || [pct, fixed, min].some((a) => a.length !== upTo.length)) return "Send between 1 and 30 complete bands.";
  const bands: PricingBand[] = [];
  for (let i = 0; i < upTo.length; i++) {
    const b = { upTo: Number(upTo[i]), profitPct: Number(pct[i]), fixedProfit: Number(fixed[i]), minProfit: Number(min[i]) };
    if (Object.values(b).some((v) => !Number.isFinite(v)) || [upTo[i], pct[i], fixed[i], min[i]].some((v) => v.trim() === "")) {
      return `Band ${i + 1}: fill in every box with a number.`;
    }
    bands.push(b);
  }
  return bands;
}

export async function saveBandsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let next: string | null = null;
  const state = await attempt(async () => {
    const auth = await authForAction("admin");
    const bands = bandsFromForm(form);
    if (typeof bands === "string") return { error: bands };
    const errors = await saveBands(auth.tenantId, bands);
    if (errors.length) return { error: errors.join(" ") };
    await exec("UPDATE tenants SET pricing_reviewed_at = COALESCE(pricing_reviewed_at, NOW(3)) WHERE id = ?", [auth.tenantId]);
    const changed = await repriceLocally(auth.tenantId);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "pricing.bands", detail: `${bands.length} bands saved; ${changed} prices changed`, ip });
    refreshApp();
    next = wizardNext(form);
    return { ok: true, message: changed ? `Bands saved. ${changed} listing price${changed === 1 ? "" : "s"} updated and queued for OnBuy.` : "Bands saved." };
  });
  if (next) redirect(next);
  return state;
}

const settingsSchema = z.object({
  marketplaceFeePct: money("OnBuy commission %", 60),
  paymentFeePct: money("Payment fee %", 30),
  paymentFixedFee: money("Payment fixed fee", 50),
  inStockQty: z.coerce.number().int("Stock to show must be a whole number.").min(1).max(999),
  outOfStockPrice: money("Out-of-stock price", 99999),
  boostPct: z.union([z.literal(""), z.coerce.number().int().min(1).max(50)]),
  skuPrefixes: z.string().max(255),
  prefixedOnly: z.boolean(),
});

export async function saveSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const parsed = settingsSchema.safeParse({
      marketplaceFeePct: str(form, "marketplaceFeePct"),
      paymentFeePct: str(form, "paymentFeePct"),
      paymentFixedFee: str(form, "paymentFixedFee"),
      inStockQty: str(form, "inStockQty"),
      outOfStockPrice: str(form, "outOfStockPrice"),
      boostPct: str(form, "boostPct").trim(),
      skuPrefixes: str(form, "skuPrefixes"),
      prefixedOnly: form.get("prefixedOnly") === "on",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
    const d = parsed.data;
    const errors = await saveSettings(auth.tenantId, {
      fees: { marketplaceFeePct: d.marketplaceFeePct, paymentFeePct: d.paymentFeePct, paymentFixedFee: d.paymentFixedFee },
      inStockQty: d.inStockQty,
      outOfStockPrice: d.outOfStockPrice,
      boostPct: d.boostPct === "" ? null : d.boostPct,
      skuPrefixes: parsePrefixes(d.skuPrefixes).join(", "),
      prefixedOnly: d.prefixedOnly,
    });
    if (errors.length) return { error: errors.join(" ") };
    const changed = await repriceLocally(auth.tenantId);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "pricing.settings", detail: `Fees ${d.marketplaceFeePct}% + ${d.paymentFeePct}% + £${d.paymentFixedFee}; ${changed} prices changed`, ip });
    refreshApp();
    return { ok: true, message: changed ? `Settings saved. ${changed} listing price${changed === 1 ? "" : "s"} updated.` : "Settings saved." };
  });
}

// ---- competition -----------------------------------------------------------------

const competeSchema = z.object({
  enabled: z.boolean(),
  strategy: z.enum(["profit", "aggressive"], { error: "Choose a strategy." }),
  beatBy: money("Beat by", 5),
  maxUndercut: money("Max undercut", 100),
  minProfit: money("Minimum profit", 500),
  maxLoss: money("Maximum loss", 50),
});

export async function saveCompeteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const parsed = competeSchema.safeParse({
      enabled: form.get("enabled") === "on",
      strategy: str(form, "strategy"),
      beatBy: str(form, "beatBy"),
      maxUndercut: str(form, "maxUndercut"),
      minProfit: str(form, "minProfit") || "0",
      maxLoss: str(form, "maxLoss") || "0",
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
    const errors = await saveCompete(auth.tenantId, parsed.data);
    if (errors.length) return { error: errors.join(" ") };
    const changed = await repriceLocally(auth.tenantId);
    if (parsed.data.enabled) await exec("UPDATE jobs SET run_now = 1, enabled = 1 WHERE tenant_id = ? AND kind = 'compete'", [auth.tenantId]);
    const { ip } = await requestInfo();
    await audit({
      tenantId: auth.tenantId,
      userId: auth.userId,
      action: "compete.settings",
      detail: `${parsed.data.enabled ? "On" : "Off"}, ${parsed.data.strategy}, beat by £${parsed.data.beatBy}; ${changed} prices changed`,
      ip,
    });
    if (parsed.data.enabled) kickScheduler();
    refreshApp();
    const base = parsed.data.enabled ? "Competition is on. The first check starts now." : "Competition is off. Listings go back to their band prices.";
    return { ok: true, message: changed ? `${base} ${changed} price${changed === 1 ? "" : "s"} updated.` : base };
  });
}

export async function checkCompetitionNowAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction();
    const res = await exec("UPDATE jobs SET run_now = 1 WHERE tenant_id = ? AND kind = 'compete' AND enabled = 1", [auth.tenantId]);
    if (res.affectedRows === 0) return { error: "Connect OnBuy first." };
    kickScheduler();
    refreshApp();
    return { ok: true, message: "Check queued. Results appear here as OnBuy answers." };
  });
}

/** One listing in or out of competition. */
export async function setListingCompeteAction(form: FormData): Promise<void> {
  const auth = await authForAction("admin");
  const id = Number(form.get("productId"));
  if (!Number.isInteger(id) || id <= 0) return;
  const on = form.get("on") === "1";
  await exec("UPDATE products SET compete = ?, compete_checked_at = IF(?, NULL, compete_checked_at) WHERE id = ? AND tenant_id = ?", [on ? 1 : 0, on ? 1 : 0, id, auth.tenantId]);
  await repriceLocally(auth.tenantId);
  refreshApp();
}

// ---- import ----------------------------------------------------------------------

export async function startImportAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const acc = await getOnBuyAccount(auth.tenantId);
    if (!acc) return { error: "Connect OnBuy first." };
    await startOnBuyImport(auth.tenantId, acc.id, form.get("includeArchived") === "on");
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "import.onbuy", ip });
    kickScheduler();
    refreshApp();
    return { ok: true, message: "Import started. It reads 500 listings at a time; this page shows its progress." };
  });
}

export async function uploadCsvAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file." };
    if (file.size > CSV_MAX_BYTES) return { error: "That file is over 5 MB. Split it and upload the parts." };
    const settings = await getSettings(auth.tenantId);
    const parsed = readListingsCsv(await file.text(), parsePrefixes(settings.skuPrefixes), settings.prefixedOnly);
    if (parsed.error) return { error: parsed.error };
    const tenant = await one<{ plan: string }>("SELECT plan FROM tenants WHERE id = ?", [auth.tenantId]);
    const plan = planFor(tenant?.plan);
    let imported = 0;
    let overLimit = 0;
    let archived = 0;
    for (let i = 0; i < parsed.rows.length; i += 500) {
      const chunk = parsed.rows.slice(i, i + 500).map((r) => ({ ...r, opc: "", price: null, stock: null }));
      const res = await upsertListings(auth.tenantId, chunk, { includeArchived: form.get("includeArchived") === "on", maxSkus: plan.maxSkus });
      imported += res.imported;
      overLimit += res.overLimit;
      archived += res.archivedSkipped;
    }
    await exec("UPDATE jobs SET run_now = 1 WHERE tenant_id = ? AND kind = 'reprice' AND enabled = 1", [auth.tenantId]);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "import.csv", detail: `${imported} imported, ${parsed.skipped.length} skipped`, ip });
    kickScheduler();
    refreshApp();
    const parts = [`${imported} listing${imported === 1 ? "" : "s"} imported`];
    if (parsed.skipped.length) {
      const first = parsed.skipped.slice(0, 3).map((s) => `line ${s.line}: ${s.reason}`).join("; ");
      parts.push(`${parsed.skipped.length} skipped (${first}${parsed.skipped.length > 3 ? "; …" : ""})`);
    }
    if (archived) parts.push(`${archived} archived SKU${archived === 1 ? "" : "s"} left out`);
    if (overLimit) parts.push(`${overLimit} over your plan's ${plan.maxSkus.toLocaleString("en-GB")} SKU limit`);
    return { ok: imported > 0, message: parts.join(", ") + ".", error: imported === 0 ? parts.join(", ") + "." : undefined };
  });
}

// ---- automation ------------------------------------------------------------------

export async function runJobNowAction(form: FormData): Promise<void> {
  const auth = await authForAction("member");
  const id = Number(form.get("jobId"));
  if (Number.isInteger(id) && id > 0 && (await runJobNow(auth.tenantId, id))) kickScheduler();
  refreshApp();
}

export async function setPausedAction(form: FormData): Promise<void> {
  const auth = await authForAction("admin");
  const paused = form.get("paused") === "1";
  await exec("UPDATE tenants SET paused = ? WHERE id = ?", [paused ? 1 : 0, auth.tenantId]);
  const { ip } = await requestInfo();
  await audit({ tenantId: auth.tenantId, userId: auth.userId, action: paused ? "jobs.pause" : "jobs.resume", ip });
  await logEvent(auth.tenantId, paused ? "warn" : "info", "kill-switch", paused ? "All syncing paused. Nothing is sent to OnBuy or Amazon." : "Syncing resumed.");
  if (!paused) kickScheduler();
  refreshApp();
}

export async function requestFullPushAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const n = await requestFullPush(auth.tenantId);
    await exec("UPDATE jobs SET run_now = 1 WHERE tenant_id = ? AND kind = 'push'", [auth.tenantId]);
    kickScheduler();
    refreshApp();
    return { ok: true, message: `${n} listing${n === 1 ? "" : "s"} queued to send to OnBuy again.` };
  });
}

export async function finishOnboardingAction(): Promise<void> {
  const auth = await authForAction("admin");
  await exec("UPDATE tenants SET onboarded_at = COALESCE(onboarded_at, NOW(3)), pricing_reviewed_at = COALESCE(pricing_reviewed_at, NOW(3)) WHERE id = ?", [auth.tenantId]);
  await exec("UPDATE jobs SET run_now = 1 WHERE tenant_id = ? AND kind = 'reprice' AND enabled = 1", [auth.tenantId]);
  kickScheduler();
  refreshApp();
  redirect("/app/overview");
}

// ---- billing ---------------------------------------------------------------------

export async function checkoutAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let url: string | null = null;
  const state = await attempt(async () => {
    const auth = await authForAction("admin");
    const plan = str(form, "plan") as PlanId;
    if (!PAID_PLANS.includes(plan)) return { error: "Choose a plan." };
    url = await checkoutUrl(auth.tenantId, auth.email, plan, appUrl());
    return undefined;
  });
  if (url) redirect(url);
  return state;
}

export async function portalAction(): Promise<ActionState> {
  let url: string | null = null;
  const state = await attempt(async () => {
    const auth = await authForAction("admin");
    url = await portalUrl(auth.tenantId, appUrl());
    return undefined;
  });
  if (url) redirect(url);
  return state;
}

// ---- settings --------------------------------------------------------------------

export async function updateWorkspaceAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("admin");
    const name = str(form, "name").trim();
    if (!name || name.length > 120) return { error: "Enter a workspace name of up to 120 characters." };
    await exec("UPDATE tenants SET name = ? WHERE id = ?", [name, auth.tenantId]);
    refreshApp();
    return { ok: true, message: "Workspace name saved." };
  });
}

export async function changePasswordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return attempt(async (): Promise<ActionState> => {
    const auth = await authForAction("member");
    const current = str(form, "current").slice(0, PASSWORD_MAX);
    const next = str(form, "next");
    if (next !== str(form, "confirm")) return { fieldErrors: { confirm: "The new passwords don't match." } };
    const problem = passwordProblem(next);
    if (problem) return { fieldErrors: { next: problem } };
    if (!(await hit(`pw-change:${auth.userId}`, LIMITS.loginPerEmail))) return { error: "Too many attempts. Please wait 15 minutes." };
    if (!(await changePassword(auth.userId, current, next))) return { fieldErrors: { current: "That isn't your current password." } };
    await deleteUserSessions(auth.userId, auth.sessionId);
    const { ip } = await requestInfo();
    await audit({ tenantId: auth.tenantId, userId: auth.userId, action: "auth.password", detail: "Password changed; other sessions ended", ip });
    return { ok: true, message: "Password changed. You've been logged out everywhere else." };
  });
}

export async function logoutOtherSessionsAction(): Promise<ActionState> {
  return attempt(async () => {
    const auth = await authForAction("member");
    await deleteUserSessions(auth.userId, auth.sessionId);
    refreshApp();
    return { ok: true, message: "Logged out of every other browser." };
  });
}
