import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-xl border-2 border-[#d5e3dd] bg-white px-3 text-base text-ink placeholder:text-[#7b8d86] focus:border-sea focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "min-h-12 w-full rounded-xl border-2 border-[#d5e3dd] bg-white px-3 text-base text-ink focus:border-sea focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-ink", className)} {...props} />;
}
