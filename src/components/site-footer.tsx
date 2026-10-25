import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { companyLine, footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-[#c9ddd5]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 pt-16 pb-8 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 font-display text-2xl font-extrabold text-white">
            <LogoMark /> SellSail
          </div>
          <p className="mt-3 max-w-sm leading-relaxed">
            The Amazon to OnBuy repricer for UK sellers: fee-aware prices, competition and stock sync.
          </p>
          <p className="mt-4 flex flex-col gap-1 text-sm">
            <a href={`mailto:${site.email}`} className="text-white underline-offset-4 hover:underline">
              {site.email}
            </a>
            <a href={site.phoneHref} className="text-white underline-offset-4 hover:underline">
              {site.phone}
            </a>
          </p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-3 font-bold text-white">{group.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#c9ddd5] no-underline hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 border-t border-[#2a4038] px-6 py-6 text-sm leading-relaxed sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <p>{site.disclaimer}</p>
          <p>{companyLine}</p>
        </div>
        <p className="shrink-0">© {new Date().getFullYear()} {site.company}</p>
      </div>
    </footer>
  );
}
