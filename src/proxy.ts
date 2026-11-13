import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/session-cookie";

const protectedPrefixes = ["/caja", "/clientes", "/membresias", "/niveles", "/movimientos"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(sessionCookieName);
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/caja/:path*", "/clientes/:path*", "/membresias/:path*", "/niveles/:path*", "/movimientos/:path*"],
};
