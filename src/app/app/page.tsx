import { redirect } from "next/navigation";
import { requireAuth } from "@/server/auth/context";

export default async function AppIndex() {
  const auth = await requireAuth();
  redirect(auth.onboardedAt ? "/app/overview" : "/app/onboarding");
}
