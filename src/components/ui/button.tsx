import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui-style button variants. Use `buttonVariants` on a <Link> for links
// that look like buttons, and <Button> for real buttons.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
  {
    variants: {
      variant: {
        ink: "bg-ink text-white hover:bg-[#1d3a2f]",
        sea: "bg-sea text-white hover:bg-sea-dark",
        sun: "bg-sun text-ink hover:bg-[#f5c51c]",
        outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
        ghost: "text-ink hover:bg-mint",
        white: "bg-white text-ink hover:bg-mint",
      },
      size: {
        sm: "min-h-11 px-5 text-[15px]",
        md: "min-h-12 px-6",
        lg: "min-h-14 px-8 text-[17px]",
      },
    },
    defaultVariants: { variant: "ink", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
