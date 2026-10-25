import { ImageResponse } from "next/og";

// A square PNG of the logo mark, for search engines (Organization schema).
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <svg width="448" height="448" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#0e7c66" />
          <path d="M15 7 L15 21 L8 21 Z" fill="#ffffff" />
          <path d="M17 10 L23 21 L17 21 Z" fill="#ffd23f" />
          <path d="M7 24 Q16 27 25 24" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
