import type { Metadata } from "next";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { PageHero } from "@/components/sections";
import { companyLine, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact SellSail",
  description: "Get in touch with the SellSail team about the beta, agency plans or support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    { icon: Mail, title: "General and support", text: "Questions about SellSail or the beta.", action: site.email, href: `mailto:${site.email}` },
    { icon: Building2, title: "Agency plans", text: "Managing several OnBuy accounts? Let's talk.", action: "Email about agency plans", href: `mailto:${site.email}?subject=Agency%20plan` },
    { icon: MessageSquare, title: "Feedback", text: "Ideas for features or guides you'd like to see.", action: "Send feedback", href: `mailto:${site.email}?subject=Feedback` },
  ];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>We&apos;d love to <span className="highlight px-1">hear from you</span></>}
        intro="We're a small UK team and we read every message. We aim to reply within one working day."
      />
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <ul className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <li key={c.title} className="flex flex-col rounded-3xl border border-line bg-white p-7">
              <span className="flex size-12 items-center justify-center rounded-xl bg-mint text-sea">
                <c.icon aria-hidden={true} className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold">{c.title}</h2>
              <p className="mt-2 leading-relaxed text-body">{c.text}</p>
              <a href={c.href} className="mt-auto pt-5 font-bold text-sea-dark underline underline-offset-4">
                {c.action}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-muted">
          {companyLine}{" "}
          <a href={site.companiesHouse} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            View on Companies House
          </a>
        </p>
      </section>
    </>
  );
}
