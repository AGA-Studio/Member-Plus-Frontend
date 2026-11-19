import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/session-cookie";

const protectedPrefixes = ["/caja", "/panel", "/clientes", "/membresias", "/niveles", "/movimientos", "/usuarios", "/configuracion", "/plataforma"];

const defaultBackendUrl = "http://127.0.0.1:8000";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El API se resuelve en tiempo de ejecución: una sola imagen sirve para
  // producción y para el compose local. Reenviar no es una ruta de API: no hay
  // lógica aquí, solo el cambio de destino, y la cookie sigue siendo de
  // primera parte porque el navegador nunca sale de este origen.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const backend = process.env.API_INTERNAL_URL ?? defaultBackendUrl;
    const destination = new URL(`${backend}${pathname}${request.nextUrl.search}`);

    return NextResponse.rewrite(destination, { request: { headers: request.headers } });
  }

  const hasSession = request.cookies.has(sessionCookieName);
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api",
    "/api/:path*",
    "/caja/:path*",
    "/panel/:path*",
    "/clientes/:path*",
    "/membresias/:path*",
    "/niveles/:path*",
    "/movimientos/:path*",
    "/usuarios/:path*",
    "/configuracion/:path*",
    "/plataforma/:path*",
  ],
};
