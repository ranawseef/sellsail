"use client";

// Google Analytics 4, only with consent (UK PECR). Set NEXT_PUBLIC_GA_ID
// (e.g. G-XXXXXXX) in the hosting environment to turn it on; without it this
// renders nothing. The choice is kept in this browser's localStorage, and the
// "Cookie settings" link in the footer asks again.

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "ss_consent";
const EVENT = "ss-consent-change";

type Choice = "granted" | "denied" | "unset" | "unknown";

function read(): Choice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

function write(v: "granted" | "denied" | null) {
  try {
    if (v) window.localStorage.setItem(KEY, v);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useChoice(): Choice {
  return useSyncExternalStore(subscribe, read, () => "unknown");
}

export function AnalyticsConsent() {
  const choice = useChoice();
  if (!GA_ID) return null;
  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {choice === "unset" && (
        <div
          role="dialog"
          aria-label="Cookie choice"
          className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgba(16,35,28,.45)] sm:inset-x-auto sm:left-5 sm:max-w-sm"
        >
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-body">
            <Cookie aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sea" />
            <span>
              We&apos;d like to use analytics cookies to see how visitors use this site, so we can improve it. They are off
              unless you allow them.{" "}
              <Link href="/cookies" className="font-semibold text-sea-dark underline underline-offset-4">
                Cookie notice
              </Link>
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="ink" className="flex-1" onClick={() => write("granted")}>
              Allow analytics
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => write("denied")}>
              Reject
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer link that clears the saved choice so the banner asks again. */
export function CookieSettingsButton({ className }: { className?: string }) {
  if (!GA_ID) return null;
  return (
    <button type="button" onClick={() => write(null)} className={className}>
      Cookie settings
    </button>
  );
}
