import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/app/auth/auth-forms";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  const shown = typeof email === "string" ? email.slice(0, 190) : "";
  return (
    <div className="w-full max-w-[420px] animate-rise">
      <h1 className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">Set a new password</h1>
      <p className="mt-2 mb-6 text-body">
        If an account exists for {shown ? <strong className="text-ink">{shown}</strong> : "that email"}, we&apos;ve sent it a
        6-digit code. It works for 15 minutes. Signing in again is needed on every device afterwards.
      </p>
      <ResetPasswordForm email={shown} />
    </div>
  );
}
