import { getTranslations } from "next-intl/server";
import { getInitials } from "@/components/ui/avatar";
import { LogoutButton } from "@/features/auth/logout-button";
import { requireSession } from "@/lib/session";

export async function CashierHeader() {
  const t = await getTranslations("cashier.header");
  const user = await requireSession();

  return (
    <header className="border-b border-white/10 bg-ink-950 text-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-md lg:size-12 lg:text-base"
          >
            {user.businessInitials}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-base font-semibold lg:text-lg">{user.businessName}</span>
            <span className="truncate text-xs text-ink-300 lg:text-sm">{t("workspace")}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:gap-3">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium"
          >
            {getInitials(user.fullName)}
          </span>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium leading-tight">{user.fullName}</span>
            <span className="text-xs leading-tight text-ink-300">{t("role")}</span>
          </div>
          <LogoutButton tone="inverse" />
        </div>
      </div>
    </header>
  );
}
