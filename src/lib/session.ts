import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { fetchSessionUser } from "@/lib/api/current-user";
import type { SessionUser, UserRole } from "@/lib/domain";
import { sessionCookieName } from "./session-cookie";

export const roleHomePaths: Record<UserRole, string> = {
  cashier: "/caja",
  admin: "/clientes",
  platform: "/login",
};

type SessionState =
  | { status: "ok"; user: SessionUser }
  | { status: "none" }
  | { status: "unauthorized" }
  | { status: "unavailable" };

const getSessionState = cache(async (): Promise<SessionState> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(sessionCookieName)?.value;

  if (!accessToken) return { status: "none" };

  return fetchSessionUser(accessToken);
});

export async function getSessionUser(): Promise<SessionUser | null> {
  const state = await getSessionState();

  return state.status === "ok" ? state.user : null;
}

type GuardMode = "page" | "action";

export async function requireUser(allowedRoles?: UserRole[], mode: GuardMode = "page"): Promise<SessionUser> {
  const state = await getSessionState();

  if (state.status === "none") redirect("/login");
  if (state.status === "unauthorized") redirect("/login?toast=sessionExpired");
  if (state.status === "unavailable") {
    if (mode === "action") throw new Error("The service is not available");
    redirect("/sin-conexion");
  }

  const { user } = state;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(`${roleHomePaths[user.role]}?toast=noAccess`);
  }

  return user;
}

export async function requireSession(): Promise<SessionUser> {
  return requireUser();
}

export async function requireActionUser(allowedRoles?: UserRole[]): Promise<SessionUser> {
  return requireUser(allowedRoles, "action");
}
