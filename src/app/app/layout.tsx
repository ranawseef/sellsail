import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, Banner } from "@/components/app/app-shell";
import { AppProviders } from "@/components/app/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/server/auth/context";
import { loadProxy } from "@/server/connections/proxy";
import { setPausedAction } from "@/server/actions/app";
import { canRunJobs, planFor } from "@/config/plans";
import { daysLeft } from "@/lib/format";

export const metadata: Metadata = {
  title: { template: "%s · SellSail", default: "Dashboard · SellSail" },
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuth();
  const proxy = await loadProxy(auth.tenantId);
  const plan = planFor(auth.plan);
  const trialDays = daysLeft(auth.trialEndsAt);
  const trialOver = auth.planStatus === "trialing" && trialDays === 0;

  const planLabel =
    auth.planStatus === "trialing"
      ? trialOver
        ? "Trial ended"
        : `Trial · ${trialDays} day${trialDays === 1 ? "" : "s"} left`
      : auth.planStatus === "past_due"
        ? `${plan.name} · payment due`
        : auth.planStatus === "active"
          ? plan.name
          : "No active plan";
  const planTone = auth.planStatus === "active" ? "mint" : auth.planStatus === "trialing" && !trialOver ? "sun" : "danger";

  const banners: React.ReactNode[] = [];
  if (auth.paused) {
    banners.push(
      <Banner
        key="paused"
        tone="sun"
        title="Syncing is paused"
        action={
          auth.role !== "member" && (
            <form action={setPausedAction}>
              <input type="hidden" name="paused" value="0" />
              <Button type="submit" variant="ink" size="sm">
                Resume syncing
              </Button>
            </form>
          )
        }
      >
        Nothing is sent to OnBuy or Amazon until you resume.
      </Banner>,
    );
  }
  if (!canRunJobs({ plan: auth.plan, planStatus: auth.planStatus, trialEndsAt: auth.trialEndsAt, paused: false })) {
    banners.push(
      <Banner
        key="plan"
        tone="danger"
        title={trialOver ? "Your free trial has ended" : "Your subscription isn't active"}
        action={
          <Link href="/app/billing" className={buttonVariants({ variant: "ink", size: "sm" })}>
            Choose a plan
          </Link>
        }
      >
        Repricing and OnBuy updates are stopped. Your listings keep their last prices.
      </Banner>,
    );
  } else if (auth.planStatus === "past_due") {
    banners.push(
      <Banner key="due" tone="danger" title="Your last payment failed" action={<Link href="/app/billing" className={buttonVariants({ variant: "ink", size: "sm" })}>Update payment</Link>}>
        Syncing carries on for now. Update your card to keep it running.
      </Banner>,
    );
  } else if (auth.planStatus === "trialing" && trialDays <= 3) {
    banners.push(
      <Banner key="trial" tone="sun" title={`Your trial ends in ${trialDays} day${trialDays === 1 ? "" : "s"}`} action={<Link href="/app/billing" className={buttonVariants({ variant: "ink", size: "sm" })}>See plans</Link>}>
        Choose a plan to keep repricing after the trial.
      </Banner>,
    );
  }
  if (proxy?.status === "failing") {
    banners.push(
      <Banner
        key="proxy"
        tone="danger"
        title="Your proxy isn't working, so nothing is being sent to OnBuy"
        action={
          <Link href="/app/connections#proxy" className={buttonVariants({ variant: "ink", size: "sm" })}>
            Check the proxy
          </Link>
        }
      >
        {proxy.lastError ?? "The last check failed."} We test it again every few minutes. Or remove the proxy to send directly.
      </Banner>,
    );
  }

  return (
    <AppProviders>
      <AppShell
        workspace={auth.tenantName}
        userName={auth.name}
        planLabel={planLabel}
        planTone={planTone}
        onboarded={Boolean(auth.onboardedAt)}
        banners={banners.length ? <div className="flex flex-col gap-3">{banners}</div> : null}
      >
        {children}
      </AppShell>
    </AppProviders>
  );
}
