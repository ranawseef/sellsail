import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/app/auth/auth-forms";

export const metadata: Metadata = { title: "Forgot password", alternates: { canonical: "/forgot-password" } };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[420px] animate-rise">
      <h1 className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">Forgot your password?</h1>
      <p className="mt-2 mb-6 text-body">Enter your account email and we&apos;ll send you a 6-digit code to set a new one.</p>
      <ForgotPasswordForm />
    </div>
  );
}
