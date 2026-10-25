import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { ResendCodeForm, VerifyEmailForm } from "@/components/app/auth/auth-forms";
import { getAuth } from "@/server/auth/context";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  if (auth.emailVerified) redirect("/app/onboarding");
  return (
    <div className="w-full max-w-[420px] animate-rise">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-mint text-sea-dark">
        <MailCheck aria-hidden="true" className="size-6" />
      </span>
      <h1 className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">Check your email</h1>
      <p className="mt-2 mb-6 text-body">
        We sent a 6-digit code to <strong className="text-ink">{auth.email}</strong>. Enter it below to finish setting up
        your account. It works for 15 minutes.
      </p>
      <VerifyEmailForm />
      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
        <p className="mb-2">Nothing arrived? Check your spam folder, or</p>
        <ResendCodeForm />
      </div>
    </div>
  );
}
