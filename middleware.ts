import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas protegidas (ajusta si tienes más)
  const protectedPaths = ["/dashboard"];

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  // Cookie que tú setas: "__session"
  const session = req.cookies.get("__session")?.value;

  // Si no hay sesión -> redirigir al login (tu login está en "/")
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";            // o "/login" si tu login está ahí
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Asegura que el middleware solo corra donde debe (opcional pero recomendado)
export const config = {
  matcher: ["/dashboard/:path*"],
};
