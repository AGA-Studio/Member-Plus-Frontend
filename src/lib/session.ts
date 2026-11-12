import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "./session-cookie";

const eightHoursInSeconds = 60 * 60 * 8;

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

export async function requireSession(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) redirect("/login");

  return token;
}
