"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { TextField, CheckboxField } from "@/components/app/field";
import { SubmitButton } from "@/components/app/form-bits";
import { loginAction, signupAction, type FormState } from "@/server/actions/auth";
import { AlertTriangle } from "lucide-react";

function FormError({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {state.error}
    </p>
  );
}

export function LoginForm({ next }: { next: string }) {
  const id = useId();
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError state={state} />
      <TextField
        id={`${id}-email`}
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
      />
      <TextField
        id={`${id}-password`}
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />
      <SubmitButton size="lg" pendingLabel="Logging in…" className="mt-2 w-full">
        Log in
      </SubmitButton>
      <p className="text-center text-sm text-body">
        New to SellSail?{" "}
        <Link href="/signup" className="font-bold text-sea-dark underline underline-offset-4">
          Start a free trial
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const id = useId();
  const [state, action] = useActionState(signupAction, undefined);
  const v = state?.values;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormError state={state} />
      <TextField id={`${id}-name`} name="name" label="Your name" autoComplete="name" required defaultValue={v?.name} error={state?.fieldErrors?.name} />
      <TextField
        id={`${id}-workspace`}
        name="workspace"
        label="Business name"
        hint="Shown in your dashboard. You can change it later."
        autoComplete="organization"
        required
        defaultValue={v?.workspace}
        error={state?.fieldErrors?.workspace}
      />
      <TextField id={`${id}-email`} name="email" type="email" label="Email" autoComplete="email" required defaultValue={v?.email} error={state?.fieldErrors?.email} />
      <TextField
        id={`${id}-password`}
        name="password"
        type="password"
        label="Password"
        hint="At least 10 characters."
        autoComplete="new-password"
        required
        minLength={10}
        error={state?.fieldErrors?.password}
      />
      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Company website</label>
        <input id={`${id}-website`} name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <CheckboxField
        id={`${id}-terms`}
        name="terms"
        required
        label={
          <>
            I agree to the{" "}
            <Link href="/terms" className="text-sea-dark underline underline-offset-4">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-sea-dark underline underline-offset-4">
              privacy policy
            </Link>
          </>
        }
      />
      {state?.fieldErrors?.terms && <p className="-mt-2 text-[13px] font-semibold text-danger">{state.fieldErrors.terms}</p>}
      <SubmitButton size="lg" pendingLabel="Creating your workspace…" className="mt-2 w-full">
        Start my 14-day free trial
      </SubmitButton>
      <p className="text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-sea-dark underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
