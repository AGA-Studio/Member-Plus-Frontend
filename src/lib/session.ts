import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByToken } from "@/lib/api/current-user";
import type { SessionUser, UserRole } from "@/lib/domain";
import { sessionCookieName } from "./session-cookie";

const eightHoursInSeconds = 60 * 60 * 8;

export const roleHomePaths: Record<UserRole, string> = {
  cashier: "/caja",
  admin: "/clientes",
};

export async function createSession(accessToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: eightHoursInSeconds,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  return getUserByToken(cookieStore.get(sessionCookieName)?.value);
}

export async function requireUser(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role)) redirect(roleHomePaths[user.role]);

  return user;
}

export async function requireSession(): Promise<SessionUser> {
  return requireUser();
}
