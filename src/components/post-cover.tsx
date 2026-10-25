import { unsplash, type Post } from "@/content/posts";
import { cn } from "@/lib/utils";

const TONES = ["bg-ink text-white", "bg-sea text-white", "bg-sun text-ink", "bg-mint text-ink", "bg-sky text-ink"];

function tone(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** The post's photo, or a branded title card when it has none. */
export function PostCover({ post, size, className, priority }: { post: Post; size: "lg" | "md" | "sm"; className?: string; priority?: boolean }) {
  if (post.cover) {
    const w = size === "lg" ? 1600 : size === "md" ? 900 : 400;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={unsplash(post.cover.src, w)}
        alt={size === "sm" ? "" : post.cover.alt}
        width={w}
        height={Math.round(w * 0.5625)}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div aria-hidden="true" className={cn("relative flex flex-col justify-between overflow-hidden", tone(post.slug), className, size === "sm" ? "p-3" : "p-6 sm:p-8")}>
      <div className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -top-10 right-16 size-24 rounded-full bg-white/10" />
      <span className={cn("relative font-bold tracking-[0.12em] uppercase opacity-80", size === "sm" ? "text-[9px]" : "text-xs")}>{post.category}</span>
      {size !== "sm" && (
        <span className={cn("relative max-w-[90%] font-display leading-[1.05] font-extrabold tracking-[-0.03em]", size === "lg" ? "text-[clamp(26px,4vw,48px)]" : "text-2xl")}>
          {post.keyword}
        </span>
      )}
      <span className={cn("relative font-display font-extrabold", size === "sm" ? "text-[11px]" : "text-sm")}>SellSail</span>
    </div>
  );
}
