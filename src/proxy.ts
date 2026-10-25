// Runs before every request. Two jobs:
//
// 1. Hosts. The marketing site lives on sellsail.io and the dashboard (seller
//    app, login/signup, admin) on app.sellsail.io. Both are served by this one
//    Next.js process, so each host redirects the other's pages across. APIs
//    (Stripe webhooks, cron) and Next's assets work on either host.
// 2. Sessions. Visitors to /app without a session cookie go to /login. That is
//    a convenience, not the security boundary: every page, server action and
//    route handler under /app looks the session up in the database itself
//    (src/server/auth).
//
// Other hosts (localhost, previews) get no host redirects.

import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/lib/site";

const COOKIES = ["__Host-ss_session", "ss_session"];
const MAIN_HOSTS = new Set([new URL(site.url).host, `www.${new URL(site.url).host}`]);
/** Pages that belong on the dashboard host. */
const PORTAL = /^\/(app|admin|login|signup|verify-email|forgot-password|reset-password)(\/|$)/;
/** Served on both hosts. */
const SHARED = /^\/(api|_next|favicon\.ico|icon|apple-icon)(\/|$)/;

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().replace(/:\d+$/, "");
  const { pathname, search } = req.nextUrl;
  const hasSession = COOKIES.some((c) => req.cookies.has(c));

  if (MAIN_HOSTS.has(host) && PORTAL.test(pathname)) {
    return NextResponse.redirect(new URL(pathname + search, site.appUrl), 308);
  }

  const onApp = host === site.appHost;
  if (onApp) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL(hasSession ? "/app/overview" : "/login", site.appUrl));
    }
    if (!PORTAL.test(pathname) && !SHARED.test(pathname)) {
      return NextResponse.redirect(new URL(pathname + search, site.url), 308);
    }
  }

  if (/^\/app(\/|$)/.test(pathname) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (onApp) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
