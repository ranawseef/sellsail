"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/app/form-bits";
import type { ActionState } from "@/server/actions/app";

/**
 * A one-button form for an action that needs no fields. The result shows as a
 * toast, since the button usually sits in a header with no room for a message.
 */
export function ActionButton({
  action,
  children,
  pendingLabel,
  variant = "outline",
  size = "sm",
  confirm,
  disabled,
  fields,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "ink" | "sea" | "sun" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  confirm?: string;
  disabled?: boolean;
  /** Hidden inputs sent with the action, e.g. the id of the row it acts on. */
  fields?: Record<string, string>;
}) {
  const [, run] = useActionState(async (prev: ActionState, form: FormData) => {
    const res = await action(prev, form);
    if (res?.error) toast.error(res.error);
    else if (res?.message) toast.success(res.message);
    return res;
  }, undefined);
  return (
    <form
      action={run}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton variant={variant} size={size} pendingLabel={pendingLabel} disabled={disabled}>
        {children}
      </SubmitButton>
    </form>
  );
}
