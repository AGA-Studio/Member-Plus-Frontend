import { getTranslations } from "next-intl/server";
import { getInitials } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/features/auth/logout-button";
import { requireSession } from "@/lib/session";

export async function PlatformHeader() {
  const t = await getTranslations("platform.header");
  const user = await requireSession();

  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-auto lg:h-10" entryTarget />
          <span className="hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-text sm:inline-flex">
            {t("label")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-foreground">{user.fullName}</span>
            <span className="text-xs text-muted">{t("role")}</span>
          </div>
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary-text"
          >
            {getInitials(user.fullName)}
          </span>
          <LogoutButton tone="strong" />
        </div>
      </div>
    </header>
  );
}
