"use client";

import { useActionState, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KeyRound, Mail } from "lucide-react";
import { TextField, SelectField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import { deleteTenantAction, grantFreeAccessAction, requestAdminCodeAction, setTenantPlanAction, verifyAdminCodeAction, type AdminState } from "@/server/admin/actions";

function Message({ state }: { state: AdminState }) {
  return <FormMessage state={state?.error ? { error: state.error } : state?.message ? { ok: true, message: state.message } : undefined} />;
}

/** Two steps: email, then the code sent to it. */
export function AdminLoginForm() {
  const id = useId();
  const reduce = useReducedMotion();
  const [sent, request] = useActionState(requestAdminCodeAction, undefined);
  const [checked, verify] = useActionState(verifyAdminCodeAction, undefined);
  const email = checked?.email ?? sent?.email;
  const step = checked?.step ?? sent?.step;
  const slide = reduce ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step !== "code" ? (
        <motion.form key="email" action={request} className="flex flex-col gap-4" noValidate {...slide}>
          <Message state={sent} />
          <TextField id={`${id}-email`} name="email" type="email" label="Admin email" autoComplete="off" spellCheck={false} required />
          <SubmitButton size="lg" pendingLabel="Sending…" className="mt-1 w-full">
            <Mail aria-hidden="true" className="size-4" /> Email me a code
          </SubmitButton>
        </motion.form>
      ) : (
        <motion.form key="code" action={verify} className="flex flex-col gap-4" noValidate {...slide}>
          <Message state={checked ?? sent} />
          <input type="hidden" name="email" value={email ?? ""} />
          <TextField
            id={`${id}-code`}
            name="code"
            label={`Code sent to ${email}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            required
            autoFocus
            className="[&_input]:text-center [&_input]:font-mono [&_input]:text-2xl [&_input]:tracking-[0.4em]"
          />
          <SubmitButton size="lg" pendingLabel="Checking…" className="mt-1 w-full">
            <KeyRound aria-hidden="true" className="size-4" /> Sign in
          </SubmitButton>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export function PlanForm({ tenantId, plan, status, plans }: { tenantId: number; plan: string; status: string; plans: { id: string; name: string }[] }) {
  const id = useId();
  const [state, action] = useActionState(setTenantPlanAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="tenantId" value={tenantId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField id={`${id}-plan`} name="plan" label="Plan" defaultValue={plan}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <SelectField id={`${id}-status`} name="status" label="Status" defaultValue={status}>
          {["trialing", "active", "past_due", "canceled", "expired"].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </SelectField>
      </div>
      <p className="text-[13px] text-muted">Changes SellSail only. Stripe billing is not touched; a later Stripe event can overwrite this.</p>
      <Message state={state} />
      <div>
        <SubmitButton variant="ink" size="sm">
          Save plan
        </SubmitButton>
      </div>
    </form>
  );
}

/** Give a workspace a paid plan free, or a free trial, for a set period. */
export function FreeAccessForm({ tenantId, plans, tomorrow }: { tenantId: number; plans: { id: string; name: string }[]; tomorrow: string }) {
  const id = useId();
  const [state, action] = useActionState(grantFreeAccessAction, undefined);
  const [kind, setKind] = useState<"plan" | "trial">("plan");
  const [by, setBy] = useState<"days" | "until">("days");
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="tenantId" value={tenantId} />
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-bold">Give</legend>
        {(
          [
            ["plan", "A plan, free of charge", "Full plan limits; no card needed."],
            ["trial", "A free trial", "Trial limits (1,000 listings)."],
          ] as const
        ).map(([k, title, text]) => (
          <label key={k} className={`flex cursor-pointer flex-col rounded-2xl border-2 p-3 transition-colors ${kind === k ? "border-sea bg-mint/50" : "border-line bg-white hover:border-sea/40"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            <span className="text-sm font-bold">{title}</span>
            <span className="text-[13px] text-muted">{text}</span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        {kind === "plan" ? (
          <SelectField id={`${id}-plan`} name="plan" label="Plan" defaultValue="growth">
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
        ) : (
          <input type="hidden" name="plan" value="starter" />
        )}
        <SelectField id={`${id}-by`} label="For" value={by} onChange={(e) => setBy(e.target.value as "days" | "until")}>
          <option value="days">A number of days</option>
          <option value="until">Until a date</option>
        </SelectField>
        {by === "days" ? (
          <TextField id={`${id}-days`} name="days" type="number" min={1} max={3650} defaultValue={30} label="Days" required />
        ) : (
          <TextField id={`${id}-until`} name="until" type="date" min={tomorrow} defaultValue={tomorrow} label="Until (inclusive)" required />
        )}
      </div>
      <TextField id={`${id}-note`} name="note" label="Note (optional)" placeholder="e.g. Beta tester, partner deal" maxLength={255} />
      <Message state={state} />
      <div>
        <SubmitButton variant="sea" size="sm" pendingLabel="Granting…">
          Grant free access
        </SubmitButton>
      </div>
    </form>
  );
}

export function DeleteTenantForm({ tenantId, name }: { tenantId: number; name: string }) {
  const id = useId();
  const [state, action] = useActionState(deleteTenantAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="tenantId" value={tenantId} />
      <TextField id={`${id}-confirm`} name="confirm" label={`Type “${name}” to confirm`} autoComplete="off" required className="max-w-md" />
      <Message state={state?.error ? state : undefined} />
      <div>
        <SubmitButton variant="outline" size="sm" pendingLabel="Deleting…" className="border-danger text-danger hover:bg-danger hover:text-white">
          Delete workspace and all its data
        </SubmitButton>
      </div>
    </form>
  );
}
