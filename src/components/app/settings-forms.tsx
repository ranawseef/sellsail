"use client";

import { useActionState, useId } from "react";
import { TextField } from "@/components/app/field";
import { FormMessage, SubmitButton } from "@/components/app/form-bits";
import { changePasswordAction, deleteWorkspaceAction, updateWorkspaceAction } from "@/server/actions/app";

export function WorkspaceForm({ name }: { name: string }) {
  const id = useId();
  const [state, action] = useActionState(updateWorkspaceAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField id={`${id}-name`} name="name" label="Workspace name" defaultValue={name} maxLength={120} required className="max-w-md" />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="ink" size="sm">
          Save name
        </SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const id = useId();
  const [state, action] = useActionState(changePasswordAction, undefined);
  const fe = state?.fieldErrors;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <TextField id={`${id}-cur`} name="current" type="password" label="Current password" autoComplete="current-password" required error={fe?.current} />
      <TextField id={`${id}-new`} name="next" type="password" label="New password" hint="At least 10 characters." autoComplete="new-password" required error={fe?.next} />
      <TextField id={`${id}-conf`} name="confirm" type="password" label="New password again" autoComplete="new-password" required error={fe?.confirm} />
      <div className="flex flex-col gap-3 sm:col-span-3">
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="ink" size="sm" pendingLabel="Changing…">
            Change password
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function DeleteWorkspaceForm({ name }: { name: string }) {
  const id = useId();
  const [state, action] = useActionState(deleteWorkspaceAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        id={`${id}-confirm`}
        name="confirm"
        label={`Type “${name}” to confirm`}
        autoComplete="off"
        required
        error={state?.fieldErrors?.confirm}
        className="max-w-md"
      />
      <FormMessage state={state?.error ? state : undefined} />
      <div>
        <SubmitButton variant="outline" size="sm" pendingLabel="Deleting…" className="border-danger text-danger hover:bg-danger hover:text-white">
          Delete workspace and all its data
        </SubmitButton>
      </div>
    </form>
  );
}
