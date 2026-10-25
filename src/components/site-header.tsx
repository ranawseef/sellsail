"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { mainNav, portal } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-3.5">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 justify-center gap-7 text-[15px] font-medium lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-body no-underline hover:text-sea",
                pathname.startsWith(item.href) && "text-ink underline decoration-sun decoration-[3px] underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link href={portal("/login")} className="text-[15px] font-semibold text-body no-underline hover:text-sea">
            Log in
          </Link>
          <Link href={portal("/signup")} className={buttonVariants({ variant: "ink", size: "sm" })}>
            Start free trial
          </Link>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-full hover:bg-mint lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper px-6 pb-6 lg:hidden">
          <ul className="flex flex-col py-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-lg font-semibold text-ink no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5">
            <Link href={portal("/signup")} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "ink" }), "w-full")}>
              Start free trial
            </Link>
            <Link href={portal("/login")} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Log in
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
