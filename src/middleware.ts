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
      // Solo consideramos que hay sesión si la cookie tiene formato de token válido (con punto intermedio)
      if (sessionCookie && sessionCookie.includes(".") && sessionCookie.length > 30) {
        url.pathname = "/admin";
      } else {
        url.pathname = "/admin/login";
      }
      return NextResponse.rewrite(url);
    }

    // Si acceden escribiendo explícitamente /admin o /admin/login, redirigir a la raíz limpia "/" (preservando parámetros como ?tab=)
    if (pathname === "/admin" || pathname === "/admin/login" || pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
