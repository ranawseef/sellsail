import Link from "next/link";
import { features } from "@/content/features";
import { cn } from "@/lib/utils";

export function ToolGrid({ limit }: { limit?: number }) {
  const list = limit ? features.slice(0, limit) : features;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((f) => {
        const href = f.slug === "fee-calculator" ? "/onbuy-fee-calculator" : `/features#${f.slug}`;
        const highlight = f.slug === "fee-calculator";
        return (
          <li key={f.slug}>
            <Link
              href={href}
              className={cn(
                "flex h-full flex-col rounded-3xl p-6 text-ink no-underline transition-transform hover:-translate-y-1",
                highlight ? "bg-sun" : "border border-line bg-white",
              )}
            >
              <span className={cn("flex size-11 items-center justify-center rounded-xl", f.tile)}>
                <f.icon aria-hidden={true} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className={cn("mt-1.5 leading-relaxed", highlight ? "text-sun-ink" : "text-muted")}>{f.short}</p>
              <span className="mt-auto pt-4 text-sm font-bold">
                {highlight ? "Open it" : "Learn more"} <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
