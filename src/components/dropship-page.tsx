import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CheckList, CtaBand, Faq, FaqJsonLd, PageHero, SectionHeading } from "@/components/sections";
import { Comparison } from "@/components/home/comparison";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  source: string;
  points: string[];
  steps: [string, string][];
  faq: { q: string; a: string }[];
};

export function DropshipPage({ eyebrow, title, intro, source, points, steps, faq }: Props) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/beta" className={buttonVariants({ variant: "ink", size: "lg" })}>
            Join the free beta <span aria-hidden="true">→</span>
          </Link>
          <Link href="/onbuy-fee-calculator" className={buttonVariants({ variant: "sun", size: "lg" })}>
            Check your margins
          </Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex flex-wrap items-start gap-12">
          <div className="min-w-0 flex-[1_1_380px]">
            <h2 className="font-display text-[40px] leading-none font-extrabold tracking-[-0.04em]">
              What SellSail does for {source} sellers
            </h2>
            <CheckList items={points} />
          </div>
          <ol className="min-w-0 flex-[1_1_420px] space-y-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-3xl border border-line bg-white p-5">
                <span className="flex size-10 flex-none items-center justify-center rounded-full bg-ink font-display text-lg font-extrabold text-sun">
                  {i + 1}
                </span>
                <span>
                  <strong className="block text-lg">{t}</strong>
                  <span className="leading-relaxed text-body">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-12 rounded-3xl border-2 border-dashed border-[#e0c46a] bg-sun-soft p-6 text-sun-ink">
          <strong className="text-ink">Check the rules first.</strong> Marketplace and supplier policies on dropshipping
          change. Read OnBuy&apos;s seller policy and the {source} terms that apply to you before you start. You are the
          seller of record and are responsible for dispatch times, returns and customer service.
        </div>
      </section>

      <Comparison />

      <section className="mx-auto max-w-[820px] px-6 py-16">
        <SectionHeading title="Questions" />
        <div className="mt-8"><Faq items={faq} /></div>
        <FaqJsonLd items={faq} />
      </section>
      <CtaBand />
    </>
  );
}
