import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-bold tracking-[0.12em] text-sea-dark uppercase", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-[clamp(34px,4.8vw,58px)] leading-none font-extrabold tracking-[-0.045em]">
        {title}
      </h2>
      {intro && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-dots border-b border-line">
      <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-16 text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-[clamp(40px,6vw,76px)] leading-none font-extrabold tracking-[-0.045em]">
          {title}
        </h1>
        {intro && <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-body">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function BrowserFrame({
  title,
  dark = false,
  right,
  children,
}: {
  title: string;
  dark?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl shadow-[0_24px_50px_-16px_rgba(16,35,28,.25)]",
        dark ? "border border-[#2a4038] bg-[#0b1a14]" : "bg-white",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b px-4 py-3 text-xs",
          dark ? "border-[#2a4038] text-[#9fbdb1]" : "border-[#eef3f1] text-muted",
        )}
      >
        <span className={cn("size-2.5 rounded-full", dark ? "bg-[#3a5248]" : "bg-[#f1c4b6]")} />
        <span className={cn("size-2.5 rounded-full", dark ? "bg-[#3a5248]" : "bg-[#f5e0a3]")} />
        <span className={cn("size-2.5 rounded-full", dark ? "bg-[#3a5248]" : "bg-[#bfe3d6]")} />
        <span className="ml-2">app.sellsail.io · {title}</span>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      {children}
    </div>
  );
}

export function CheckList({ items, tone = "sea" }: { items: string[]; tone?: "sea" | "sun" }) {
  return (
    <ul className="mt-6 flex flex-col gap-2.5 font-semibold">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden="true" className={tone === "sun" ? "text-sun" : "text-sea"}>
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export type FaqItem = { q: string; a: React.ReactNode };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <details key={item.q} className="rounded-2xl border border-line bg-white px-5 py-4">
          <summary className="flex items-center justify-between gap-3 text-lg font-bold">
            {item.q}
            <Plus aria-hidden="true" className="faq-icon size-5 shrink-0 transition-transform" />
          </summary>
          <div className="mt-3 leading-relaxed text-body">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CtaBand({
  title = "Set sail with SellSail",
  intro = "Start your 14-day free trial. No card needed, cancel any time.",
}: {
  title?: string;
  intro?: string;
}) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24">
      <div className="relative overflow-hidden rounded-[36px] bg-sun px-8 py-16 text-center">
        <h2 className="font-display text-[clamp(38px,5.4vw,68px)] leading-none font-extrabold tracking-[-0.045em]">
          {title}
        </h2>
        <p className="mx-auto mt-3.5 mb-7 max-w-lg text-lg text-sun-ink">{intro}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ variant: "ink", size: "lg" })}>
            Start your free trial <span aria-hidden="true">→</span>
          </Link>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "white", size: "lg" })}>
            <MessageCircle aria-hidden="true" className="size-5" /> Book a demo on WhatsApp
          </a>
        </div>
        <div className="pointer-events-none absolute right-10 bottom-8 hidden h-16 w-72 xl:block" aria-hidden="true">
          {[
            ["Price raised", "Amazon cost +£1.20 · example"],
            ["Now cheapest at £23.48", "profit £2.15 kept · example"],
            ["Set out of stock", "Amazon ran out · example"],
          ].map(([t, s], i) => (
            <div
              key={t}
              className="toast-cycle absolute inset-0 rounded-2xl bg-white px-4 py-2.5 text-left text-[13px] shadow-[0_10px_24px_rgba(16,35,28,.15)]"
              style={{ animationDelay: `${i * 4}s` }}
            >
              <strong>{t}</strong>
              <br />
              <span className="text-muted">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-bold text-ink no-underline hover:text-sea">
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}
