import { Settings } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth/logout-button";
import { ProfileButton } from "@/features/auth/profile-button";
import { LanguageButton } from "@/features/i18n/language-button";
import { requireSession } from "@/lib/session";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export async function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const user = await requireSession();
  const settings = await getTranslations("business.nav");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title text-foreground">{title}</h1>
          {subtitle ? <p className="text-base text-muted">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href="/configuracion"
            aria-label={settings("settings")}
            className="flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97"
          >
            <Settings aria-hidden strokeWidth={1.75} className="size-5" />
          </Link>
          <LanguageButton />
          <ProfileButton fullName={user.fullName} photoUrl={user.photoUrl} entryOrigin />
          <LogoutButton />
        </div>
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </div>
  );
}
