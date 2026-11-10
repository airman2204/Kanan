import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("kanan_admin_session")?.value;

  // En el subdominio admin.kananlimpieza.mx
  if (host.startsWith("admin.")) {
    // Si visita la raíz "/" en el subdominio
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      if (sessionCookie && sessionCookie.includes(".") && sessionCookie.length > 50) {
        url.pathname = "/admin";
      } else {
        url.pathname = "/admin/login";
      }
      return NextResponse.rewrite(url);
    }

    // Permitir /admin/login sin redirigir
    if (pathname === "/admin/login" || pathname === "/login") {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
