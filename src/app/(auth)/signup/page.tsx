import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SignupForm } from "@/components/app/auth/auth-forms";
import { getAuth } from "@/server/auth/context";
import { TRIAL_DAYS } from "@/config/plans";

export const metadata: Metadata = { title: "Start your free trial", alternates: { canonical: "/signup" } };

export default async function SignupPage() {
  if (await getAuth()) redirect("/app");
  return (
    <Card className="w-full max-w-md animate-rise p-8">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em]">Set sail</h1>
      <p className="mt-2 mb-6 text-body">
        {TRIAL_DAYS} days free, no card needed. You&apos;ll connect your proxy, OnBuy and Amazon next.
      </p>
      <SignupForm />
    </Card>
  );
}
