import { Eyebrow } from "@/components/sections";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Page header, section card and empty state for /app pages: the marketing
// site's display type and cards, sized for a working screen.

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
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 font-display text-[clamp(30px,3.6vw,40px)] leading-none font-extrabold tracking-[-0.04em]">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl leading-relaxed text-body">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
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
    <Card className={cn("p-6", className)} id={id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {intro && <p className="mt-1 text-sm leading-relaxed text-muted">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </Card>
  );
}

export function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-mint text-sea-dark" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-3 font-bold">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
}

const tiles = {
  mint: { box: "bg-mint", label: "text-sea-dark", value: "text-sea-dark" },
  sun: { box: "bg-sun-soft", label: "text-sun-ink", value: "text-ink" },
  mist: { box: "bg-mist", label: "text-body", value: "text-ink" },
  sky: { box: "bg-sky", label: "text-[#1f5f8b]", value: "text-ink" },
  danger: { box: "bg-danger-soft", label: "text-danger", value: "text-danger" },
};

/** A figure in a tinted tile, as the fee calculator and import mock-up show them. */
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
    <div className={cn("rounded-2xl p-4", t.box)}>
      <div className={cn("flex items-center justify-between gap-2 text-[13px] font-semibold", t.label)}>
        {label}
        {icon && <span aria-hidden="true">{icon}</span>}
      </div>
      <div className={cn("mt-1 font-display text-[28px] leading-tight font-extrabold", t.value)}>{value}</div>
      {sub && <div className="mt-0.5 text-[13px] text-muted">{sub}</div>}
    </div>
  );
}
