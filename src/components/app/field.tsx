import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A labelled field the way the fee calculator writes them (label above,
// flex-col gap-1.5), with a hint and an error tied to the control for
// screen readers.

type Common = { id: string; label: React.ReactNode; hint?: React.ReactNode; error?: string; className?: string };

function describedBy(id: string, hint?: React.ReactNode, error?: string) {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

function FieldText({ id, hint, error }: { id: string; hint?: React.ReactNode; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({ id, label, hint, error, className, ...input }: Common & Omit<React.ComponentProps<"input">, "id">) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...input} />
      <FieldText id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({ id, label, hint, error, className, children, ...select }: Common & Omit<React.ComponentProps<"select">, "id">) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...select}>
        {children}
      </Select>
      <FieldText id={id} hint={hint} error={error} />
    </div>
  );
}

export function CheckboxField({ id, label, hint, className, ...input }: Omit<Common, "error"> & Omit<React.ComponentProps<"input">, "id" | "type">) {
  return (
    <div className={cn("flex gap-3", className)}>
      <input id={id} type="checkbox" className="mt-0.5 size-5 shrink-0 accent-sea" aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint && (
          <p id={`${id}-hint`} className="text-[13px] text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
