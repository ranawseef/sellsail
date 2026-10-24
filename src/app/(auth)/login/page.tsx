import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/app/auth/auth-forms";
import { getAuth } from "@/server/auth/context";

export const metadata: Metadata = { title: "Log in", alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAuth()) redirect("/app");
  const { next } = await searchParams;
  return (
    <Card className="w-full max-w-md animate-rise p-8">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em]">Welcome back</h1>
      <p className="mt-2 mb-6 text-body">Log in to your SellSail dashboard.</p>
      <LoginForm next={typeof next === "string" ? next.slice(0, 200) : ""} />
    </Card>
  );
}
