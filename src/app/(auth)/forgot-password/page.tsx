import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/app/auth/auth-forms";

export const metadata: Metadata = { title: "Forgot password", alternates: { canonical: "/forgot-password" } };

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md animate-rise p-8">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em]">Forgot your password?</h1>
      <p className="mt-2 mb-6 text-body">Enter your account email and we&apos;ll send you a 6-digit code to set a new one.</p>
      <ForgotPasswordForm />
    </Card>
  );
}
