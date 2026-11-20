import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/s\/([^/]+)(\/.*)?$/);
  if (match) {
    const subdominio = decodeURIComponent(match[1]);
    const rest = match[2] || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest === "/" ? "/" : rest.replace(/\/$/, "") || "/";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tienda-subdominio", subdominio);
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    // Cookie como fallback fiable para server components
    res.cookies.set("tienda-subdominio", subdominio, { path: "/", httpOnly: false, sameSite: "lax" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
