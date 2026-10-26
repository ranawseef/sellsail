import { cn } from "@/lib/utils";

// Page header, section card, empty state and stat tile for /app pages: a
// calm dashboard look (white cards on a light canvas, hairline borders,
// compact type) in the brand colours.

export function PageHeader({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-[12px] font-bold tracking-[0.12em] text-sea-dark uppercase">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[30px]">{title}</h1>
        {intro && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  intro,
  actions,
  children,
  className,
  id,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("rounded-2xl border border-canvas-line bg-white shadow-[0_1px_2px_rgba(16,35,28,0.04)]", className)}
    >
      <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6", !children && "pb-5")}>
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-bold tracking-[-0.01em]">{title}</h2>
          {intro && <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="px-5 pt-4 pb-5 sm:px-6 sm:pb-6">{children}</div>}
    </section>
  );
}

export function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-canvas-line bg-canvas/60 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-sea-dark shadow-sm ring-1 ring-canvas-line" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-3 font-bold">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
}

const tiles = {
  mint: { chip: "bg-mint text-sea-dark", value: "text-ink", bar: "bg-sea" },
  sun: { chip: "bg-sun-soft text-sun-ink", value: "text-ink", bar: "bg-sun" },
  mist: { chip: "bg-mist text-body", value: "text-ink", bar: "bg-muted/40" },
  sky: { chip: "bg-sky text-[#1f5f8b]", value: "text-ink", bar: "bg-[#5b9fd1]" },
  danger: { chip: "bg-danger-soft text-danger", value: "text-danger", bar: "bg-danger" },
};

/** A key figure: icon chip, label, big number and a short note. */
export function StatTile({
  label,
  value,
  sub,
  tone = "mist",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: keyof typeof tiles;
  icon?: React.ReactNode;
}) {
  const t = tiles[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-canvas-line bg-white p-4 shadow-[0_1px_2px_rgba(16,35,28,0.04)] sm:p-5">
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[3px]", t.bar)} />
      <div className="flex items-center gap-2.5">
        {icon && (
          <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", t.chip)}>
            {icon}
          </span>
        )}
        <span className="min-w-0 truncate text-[13px] font-semibold text-muted">{label}</span>
      </div>
      <div className={cn("mt-3 font-display text-[26px] leading-none font-extrabold tracking-[-0.02em] tabular-nums sm:text-[30px]", t.value)}>{value}</div>
      {sub && <div className="mt-1.5 truncate text-[12px] text-muted">{sub}</div>}
    </div>
  );
}
