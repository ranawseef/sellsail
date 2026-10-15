import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-3xl border border-line bg-white p-7", className)} {...props} />;
}
