import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full font-semibold", {
  variants: {
    variant: {
      mint: "bg-mint text-sea-dark",
      sun: "bg-sun-soft text-[#6b5300]",
      grey: "bg-[#f3f5f4] text-muted",
      sky: "bg-sky text-[#1f5f8b]",
      solid: "bg-sun text-ink",
      danger: "bg-danger-soft text-danger",
    },
    size: { sm: "px-2.5 py-1 text-xs", md: "px-3 py-1 text-[13px]" },
  },
  defaultVariants: { variant: "mint", size: "md" },
});

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
