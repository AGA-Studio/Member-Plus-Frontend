import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/session-cookie";

const protectedPrefixes = ["/caja"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(sessionCookieName);
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/caja", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/caja/:path*"],
};
