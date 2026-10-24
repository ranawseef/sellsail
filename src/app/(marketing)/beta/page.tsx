import type { Metadata } from "next";
import { BetaForm } from "@/components/beta-form";
import { PageHero } from "@/components/sections";

export const metadata: Metadata = {
  title: "Join the SellSail beta",
  description: "Join the free SellSail beta: Amazon and AliExpress to OnBuy dropshipping with fee-aware repricing.",
  alternates: { canonical: "/beta" },
};

export default function BetaPage() {
  return (
    <>
      <PageHero
        eyebrow="Free beta"
        title={<>Be first to <span className="highlight px-1">set sail</span></>}
        intro="Beta places are free. Leave your email and we'll send one message when your place is ready."
      >
        <div className="mt-10">
          <BetaForm />
        </div>
      </PageHero>
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <ul className="grid gap-5 md:grid-cols-3">
          {[
            ["Free while in beta", "No card needed. We'll tell you well before any paid plan starts."],
            ["Shape the product", "Beta sellers get a direct line to us and help decide what we build next."],
            ["Your data stays yours", "We only use your email to tell you about the beta. Unsubscribe any time."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display text-xl font-bold">{t}</h2>
              <p className="mt-2 leading-relaxed text-body">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
