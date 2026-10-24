// Runs before every matching request. It only checks that a session cookie is
// present and sends visitors without one to /login. That is a convenience,
// not the security boundary: every page, server action and route handler
// under /app looks the session up in the database itself (src/server/auth).

import { NextResponse, type NextRequest } from "next/server";

const COOKIES = ["__Host-ss_session", "ss_session"];

export function proxy(req: NextRequest) {
  const hasSession = COOKIES.some((c) => req.cookies.has(c));
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
