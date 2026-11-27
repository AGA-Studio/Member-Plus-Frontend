import { Users } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BusinessLogo } from "@/components/ui/business-logo";
import { LogoutButton } from "@/features/auth/logout-button";
import { ProfileButton } from "@/features/auth/profile-button";
import { LanguageButton } from "@/features/i18n/language-button";
import { requireSession } from "@/lib/session";

export async function CashierHeader() {
  const t = await getTranslations("cashier.header");
  const user = await requireSession();
  const roles = await getTranslations("common.role");
  const manager = user.role === "manager";

  return (
    <header className="border-b border-white/10 bg-ink-950 text-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BusinessLogo
            name={user.businessName}
            initials={user.businessInitials}
            logoUrl={user.businessLogoUrl}
            className="shadow-md lg:size-12 lg:text-base"
            entryOrigin
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-base font-semibold lg:text-lg">{user.businessName}</span>
            <span className="truncate text-xs text-ink-300 lg:text-sm">{t("workspace")}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:gap-3">
          {manager ? (
            <Link
              href="/clientes"
              aria-label={t("customers")}
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-97"
            >
              <Users aria-hidden strokeWidth={1.75} className="size-5" />
              <span className="hidden sm:inline">{t("customers")}</span>
            </Link>
          ) : null}
          <ProfileButton fullName={user.fullName} photoUrl={user.photoUrl} tone="inverse" avatarClassName="size-9" />
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium leading-tight">{user.fullName}</span>
            <span className="text-xs leading-tight text-ink-300">{manager ? roles("manager") : t("role")}</span>
          </div>
          <LanguageButton tone="inverse" />
          <LogoutButton tone="inverse" />
        </div>
      </div>
    </header>
  );
}
