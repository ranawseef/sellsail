import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/app/auth/auth-forms";
import { getAuth } from "@/server/auth/context";
import { TRIAL_DAYS } from "@/config/plans";

export const metadata: Metadata = { title: "Start your free trial", alternates: { canonical: "/signup" } };

export default async function SignupPage() {
  if (await getAuth()) redirect("/app");
  return (
    <div className="w-full max-w-[420px] animate-rise">
      <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-[13px] font-bold text-sea-dark">
        {TRIAL_DAYS}-day free trial · No card needed
      </p>
      <h1 className="mt-4 font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">Start selling smarter</h1>
      <p className="mt-2 mb-7 text-body">Create your workspace in under a minute. You&apos;ll connect your OnBuy shop next.</p>
      <SignupForm />
    </div>
  );
}
