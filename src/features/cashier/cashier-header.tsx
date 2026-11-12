import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCashierUser } from "@/lib/api/current-user";
import { logoutAction } from "./actions";

export async function CashierHeader() {
  const t = await getTranslations("cashier.header");
  const user = await getCashierUser();

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label={t("signOut")}
              className="flex size-11 items-center justify-center rounded-md text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97"
            >
              <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
