import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  // Rendered by the root layout, outside the marketing group, so it brings
  // the site header and footer itself.
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="bg-dots">
          <div className="mx-auto max-w-[820px] px-6 py-32 text-center">
            <p className="text-[13px] font-bold tracking-[0.12em] text-sea uppercase">Lost at sea?</p>
            <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] leading-none font-extrabold tracking-[-0.045em]">
              We can&apos;t find that page
            </h1>
            <p className="mt-5 text-lg text-body">It may have moved, or the link may be wrong.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/" className={buttonVariants({ variant: "ink" })}>
                Back to home
              </Link>
              <Link href="/onbuy-fee-calculator" className={buttonVariants({ variant: "outline" })}>
                Try the fee calculator
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
