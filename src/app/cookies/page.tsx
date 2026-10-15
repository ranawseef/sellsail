import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookie notice",
  description: "How sellsail.io uses cookies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie notice" updated="15 October 2026">
      <p>
        Right now sellsail.io does not set any analytics or advertising cookies. We only use what is strictly necessary
        for the site to work, which does not need your consent.
      </p>
      <h2>If this changes</h2>
      <p>
        If we add analytics in future, we will ask for your consent first and non-essential cookies will be off until you
        say yes. You will be able to change your choice at any time.
      </p>
    </LegalPage>
  );
}
