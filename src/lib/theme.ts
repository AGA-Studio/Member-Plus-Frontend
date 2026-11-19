export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];

export const themeCookieName = "theme";

export const themeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export function parseTheme(value: string | null | undefined): Theme {
  return themes.find((theme) => theme === value) ?? "light";
}
