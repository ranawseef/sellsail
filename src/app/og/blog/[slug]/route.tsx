import { ImageResponse } from "next/og";
import { getPost, isPublished } from "@/content/posts";
import { coverHeadline, coverUrl } from "@/lib/cover";

// The branded picture shown when a guide is shared on social sites and in
// chats: the post's cover photo under the SellSail brand. Rendered on
// request rather than at build time, to keep Hostinger builds light; the
// response is cached for a day.
const size = { width: 1200, height: 630 };

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const title = post && isPublished(post) ? post.title : "SellSail guides for UK OnBuy sellers";
  const chip = post?.category ?? "Guides";
  const headline = post ? coverHeadline(post) : "SellSail";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#10231c", fontFamily: "sans-serif" }}>
        {post && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl(post, 1200, 630)} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(60deg, rgba(16,35,28,0.97) 0%, rgba(16,35,28,0.86) 45%, rgba(14,124,102,0.25) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, display: "flex", background: "linear-gradient(90deg, #0e7c66, #2a9c84, #ffd23f)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "56px 64px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#ffffff", fontSize: 40, fontWeight: 800 }}>
              <svg width="56" height="56" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="16" fill="#0e7c66" />
                <path d="M15 7 L15 21 L8 21 Z" fill="#ffffff" />
                <path d="M17 10 L23 21 L17 21 Z" fill="#ffd23f" />
                <path d="M7 24 Q16 27 25 24" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
              SellSail
            </div>
            <div style={{ display: "flex", background: "#ffd23f", color: "#10231c", borderRadius: 999, padding: "10px 24px", fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              {chip}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", color: "#ffd23f", fontSize: 30, fontWeight: 700 }}>{headline}</div>
            <div style={{ display: "flex", color: "#ffffff", fontSize: 60, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
            <div style={{ display: "flex", color: "#c9ddd5", fontSize: 26 }}>Guides for UK OnBuy sellers · sellsail.io</div>
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
