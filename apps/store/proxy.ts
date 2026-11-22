import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cabeceras que solo se envían cuando la request trae `?preview=`.
 * El snapshot es privado y caduca: no queremos que un crawler lo indexe ni
 * que un proxy/cache lo sirva a otra persona.
 */
function marcarPreview(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // El token viaja en la query (compartible). Nunca se acepta un header
  // x-preview-token que venga del cliente: se limpia y se re-inyecta desde
  // la query para que solo exista si lo puso el dashboard al generar la URL.
  const token = request.nextUrl.searchParams.get("preview");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-preview-token");
  if (token) {
    requestHeaders.set("x-preview-token", token);
  }

  const match = pathname.match(/^\/s\/([^/]+)(\/.*)?$/);
  if (match) {
    const subdominio = decodeURIComponent(match[1]);
    const rest = match[2] || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest === "/" ? "/" : rest.replace(/\/$/, "") || "/";
    requestHeaders.set("x-tienda-subdominio", subdominio);
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    // Cookie como fallback fiable para server components
    res.cookies.set("tienda-subdominio", subdominio, { path: "/", httpOnly: false, sameSite: "lax" });
    if (token) marcarPreview(res);
    return res;
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (token) marcarPreview(res);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
