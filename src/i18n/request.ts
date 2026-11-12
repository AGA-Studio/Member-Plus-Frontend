import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { formattingLocales, localeCookieName, resolveLocale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale = resolveLocale(
    cookieStore.get(localeCookieName)?.value,
    headerStore.get("accept-language"),
  );

  return {
    locale: formattingLocales[locale],
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
