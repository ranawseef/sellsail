import type { Post } from "@/content/posts";
import { LogoMark } from "@/components/logo";
import { coverHeadline, coverPhoto, coverUrl } from "@/lib/cover";
import { cn } from "@/lib/utils";

/**
 * A post's cover: a licence-free photo with the SellSail brand on top (ink
 * gradient, green-to-sun accent, topic chip, headline and logo). The small
 * size, used in "related" lists, keeps just the photo, tint and logo.
 */
export function PostCover({ post, size, className, priority }: { post: Post; size: "lg" | "md" | "sm"; className?: string; priority?: boolean }) {
  const w = size === "lg" ? 1600 : size === "md" ? 900 : 400;
  const photo = coverPhoto(post);
  return (
    <div className={cn("relative isolate overflow-hidden bg-ink", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverUrl(post, w)}
        alt={size === "sm" ? "" : photo.alt}
        width={w}
        height={Math.round(w * 0.5625)}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-tr from-ink via-ink/70 to-sea/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-sea/15 mix-blend-multiply" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-sea via-sea-mid to-sun" />

      {size === "sm" ? (
        <span aria-hidden="true" className="absolute top-2 left-2">
          <LogoMark size={18} />
        </span>
      ) : (
        <div aria-hidden="true" className={cn("flex h-full flex-col justify-between", size === "lg" ? "p-6 sm:p-10" : "p-5 sm:p-6")}>
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-sun px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-ink uppercase sm:text-xs">{post.category}</span>
            <LogoMark size={size === "lg" ? 40 : 28} />
          </div>
          <div>
            <p
              className={cn(
                "max-w-[85%] font-display leading-[1.02] font-extrabold tracking-[-0.03em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.35)]",
                size === "lg" ? "text-[clamp(28px,4.6vw,56px)]" : "text-[26px] sm:text-[28px]",
              )}
            >
              {coverHeadline(post)}
            </p>
            <p className={cn("mt-2 font-semibold text-white/75", size === "lg" ? "text-sm sm:text-base" : "text-xs")}>
              SellSail guides · sellsail.io
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
