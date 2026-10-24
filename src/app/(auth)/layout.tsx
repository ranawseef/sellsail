import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export const metadata: Metadata = { robots: { index: false, follow: true } };

// Login and signup: the logo, one card on the dotted paper, the disclaimer.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dots flex min-h-screen flex-1 flex-col">
      <header className="mx-auto w-full max-w-[1200px] px-6 py-5">
        <Logo />
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[1200px] px-6 py-6 text-[13px] leading-relaxed text-muted">{site.disclaimer}</footer>
    </div>
  );
}
