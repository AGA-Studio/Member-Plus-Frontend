import { getLocale, getTranslations } from "next-intl/server";
import type { UserRole } from "@/lib/domain";
import type { Theme } from "@/lib/theme";
import { GlobalSearch } from "./global-search";
import { getSearchLocales } from "./search-locales";
import { UserMenu } from "./user-menu";

type TopbarProps = {
  fullName: string;
  photoUrl: string | null;
  role: UserRole;
  theme: Theme;
};

export async function Topbar({ fullName, photoUrl, role, theme }: TopbarProps) {
  const t = await getTranslations("business.topbar");
  const formattingLocale = await getLocale();
  const localeIndex = formattingLocale.toLowerCase().startsWith("en") ? 1 : 0;

  return (
    <header
      aria-label={t("label")}
      className="relative flex h-16 items-center gap-2 rounded-xl border border-border bg-surface px-2 shadow-md sm:gap-3 sm:px-3"
    >
      <GlobalSearch locales={getSearchLocales()} localeIndex={localeIndex} />
      <div className="ml-auto flex shrink-0 items-center">
        <UserMenu fullName={fullName} photoUrl={photoUrl} role={role} initialTheme={theme} />
      </div>
    </header>
  );
}
