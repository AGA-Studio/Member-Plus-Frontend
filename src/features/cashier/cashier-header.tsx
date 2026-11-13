import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { LogoutButton } from "@/features/auth/logout-button";

export async function CashierHeader() {
  const t = await getTranslations("cashier.header");
  const user = await requireSession();

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-18 lg:px-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground"
          >
            {user.businessInitials}
          </span>
          <span className="font-display text-lg font-semibold text-foreground">
            {user.businessName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-foreground">{user.fullName}</span>
            <span className="text-xs text-muted">{t("role")}</span>
          </div>
          <LogoutButton tone="strong" />
        </div>
      </div>
    </header>
  );
}
