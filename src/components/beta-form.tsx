"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

// Phase 1 is frontend only: no sign-up storage yet, so the form says so
// honestly instead of pretending to save the address.
export function BetaForm({ dark = false }: { dark?: boolean }) {
  const id = useId();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="mx-auto max-w-lg rounded-2xl bg-white p-4 text-ink">
        Beta sign-ups open very soon. Until then, email{" "}
        <a href={`mailto:${site.email}?subject=SellSail%20beta`} className="font-semibold text-sea-dark underline">
          {site.email}
        </a>{" "}
        and we&apos;ll add you to the list.
      </p>
    );
  }

  return (
    <form
      className="mx-auto flex max-w-lg flex-wrap gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <input
        id={`${id}-email`}
        type="email"
        required
        autoComplete="email"
        placeholder="you@yourshop.co.uk"
        className="min-h-14 flex-[1_1_260px] rounded-full border-2 border-ink bg-white px-6 text-base text-ink placeholder:text-[#7b8d86]"
      />
      <Button type="submit" variant={dark ? "sun" : "ink"} size="lg">
        Join the beta
      </Button>
    </form>
  );
}
