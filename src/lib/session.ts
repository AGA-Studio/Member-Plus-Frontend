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

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(sessionCookieName)?.value;

  if (!accessToken) return null;

  return fetchSessionUser(accessToken);
});

export async function requireUser(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role)) redirect(roleHomePaths[user.role]);

  return user;
}

export async function requireSession(): Promise<SessionUser> {
  return requireUser();
}
