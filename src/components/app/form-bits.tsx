"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/server/actions/app";

/** The form's submit button: disabled, with a spinner and its own words, while the action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-disabled={pending || undefined} className={className} {...props}>
      {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}

/** What the last submit did: a status for success, an alert for a problem. */
export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (!state?.error && !state?.message) return null;
  const bad = Boolean(state.error);
  return (
    <p
      role={bad ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl p-3 text-sm font-semibold",
        bad ? "bg-danger-soft text-danger" : "bg-mint text-sea-dark",
        className,
      )}
    >
      {bad ? <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
      <span>{state.error ?? state.message}</span>
    </p>
  );
}
