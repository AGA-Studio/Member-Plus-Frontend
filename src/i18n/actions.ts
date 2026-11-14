"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName } from "./config";

const oneYearSeconds = 60 * 60 * 24 * 365;

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  (await cookies()).set(localeCookieName, locale, {
    path: "/",
    maxAge: oneYearSeconds,
    sameSite: "lax",
  });
}
