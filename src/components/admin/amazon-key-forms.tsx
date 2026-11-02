"use client";

// Forms for SellSail's Amazon key sets on /admin/system. The secret boxes are
// password fields and are never filled in: saved values never come back to
// the browser, and React empties the form after each submit.

import { useActionState, useId } from "react";
import { KeyRound } from "lucide-react";
import { TextField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import { addAmazonKeySetAction, replaceAmazonKeySetAction } from "@/server/admin/amazon-key-actions";

type Errors = Record<string, string> | undefined;

function KeyFields({ id, label, errors }: { id: string; label?: string; errors: Errors }) {
  return (
    <>
      <TextField id={`${id}-label`} name="label" label="Name" placeholder="e.g. Main app" defaultValue={label} maxLength={60} autoComplete="off" required error={errors?.label} />
      <TextField
        id={`${id}-client`}
        name="clientId"
        label="Client ID"
        placeholder="amzn1.application-oa2-client.…"
        autoComplete="off"
        spellCheck={false}
        required
        error={errors?.clientId}
      />
      <TextField id={`${id}-secret`} name="clientSecret" type="password" label="Client secret" placeholder="amzn1.oa2-cs.…" autoComplete="new-password" required error={errors?.clientSecret} />
      <TextField id={`${id}-token`} name="refreshToken" type="password" label="Refresh token" placeholder="Atzr|…" autoComplete="new-password" required error={errors?.refreshToken} />
    </>
  );
}

export function AddKeySetForm() {
  const id = useId();
  const [state, action] = useActionState(addAmazonKeySetAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <KeyFields id={id} errors={state?.fieldErrors} />
      <p className="text-[13px] text-muted sm:col-span-2">
        The app needs the Pricing role; the refresh token comes from self-authorising it in Seller Central. Stored encrypted; saved values are never shown
        again.
      </p>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="sea" size="sm" pendingLabel="Saving…">
            <KeyRound aria-hidden="true" className="size-4" /> Save key set
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

/** New credentials for a stored set. All three values are needed: a set is never half replaced. */
export function ReplaceKeySetForm({ slot, label }: { slot: number; label: string }) {
  const id = useId();
  const [state, action] = useActionState(replaceAmazonKeySetAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="slot" value={slot} />
      <KeyFields id={id} label={label} errors={state?.fieldErrors} />
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="sea" size="sm" pendingLabel="Saving…">
            <KeyRound aria-hidden="true" className="size-4" /> Replace keys
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
