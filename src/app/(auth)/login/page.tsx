import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/app/auth/auth-forms";
import { getAuth } from "@/server/auth/context";

export const metadata: Metadata = { title: "Log in", alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  if (await getAuth()) redirect("/app");
  const { next, reset } = await searchParams;
  return (
    <div className="w-full max-w-[420px] animate-rise">
      <h1 className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">Welcome back</h1>
      <p className="mt-2 mb-7 text-body">Log in to see your prices, stock and sales.</p>
      <LoginForm
        next={typeof next === "string" ? next.slice(0, 200) : ""}
        notice={reset === "1" ? "Your password has been changed. Log in with the new one." : undefined}
      />
    </div>
  );
}
