export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const formattingLocales = {
  es: "es-MX",
  en: "en-US",
} as const satisfies Record<Locale, string>;

export type FormattingLocale = (typeof formattingLocales)[Locale];

export const localeCookieName = "NEXT_LOCALE";

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.quality) && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .map((entry) => entry.tag.split("-")[0]);
}

export function resolveLocale(
  cookieValue: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  if (isLocale(cookieValue)) {
    return cookieValue;
  }

  if (acceptLanguage) {
    const match = parseAcceptLanguage(acceptLanguage).find(isLocale);
    if (match) {
      return match;
    }
  }

  return defaultLocale;
}
