import { PageHero } from "@/components/sections";

// Legal pages are a starting draft. Have them reviewed by a solicitor before
// launch, and fill in the [bracketed] company details.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={`Last updated ${updated}`} />
      <section className="mx-auto max-w-[820px] px-6 py-16">
        <div className="prose-site mx-auto">{children}</div>
      </section>
    </>
  );
}
