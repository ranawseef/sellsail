import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#0e7c66" />
      <path d="M15 7 L15 21 L8 21 Z" fill="#ffffff" />
      <path d="M17 10 L23 21 L17 21 Z" fill="#ffd23f" />
      <path d="M7 24 Q16 27 25 24" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink no-underline ${className}`}
    >
      <LogoMark />
      SellSail
    </Link>
  );
}
