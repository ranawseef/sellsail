import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// The picture shown when sellsail.io is shared on social sites and in chats.
export const alt = "SellSail: the Amazon to OnBuy repricer for UK sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#10231c", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#0e7c66" />
            <path d="M15 7 L15 21 L8 21 Z" fill="#ffffff" />
            <path d="M17 10 L23 21 L17 21 Z" fill="#ffd23f" />
            <path d="M7 24 Q16 27 25 24" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 980 }}>
            Reprice OnBuy from Amazon, never at a loss
          </div>
          <div style={{ fontSize: 32, color: "#c9ddd5", maxWidth: 960 }}>
            Live Amazon UK prices · fee-aware pricing · competition · stock sync
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
          <span style={{ background: "#ffd23f", color: "#10231c", borderRadius: 999, padding: "12px 28px", fontWeight: 700 }}>14-day free trial</span>
          <span style={{ color: "#9fbdb1" }}>sellsail.io</span>
        </div>
      </div>
    ),
    size,
  );
}
