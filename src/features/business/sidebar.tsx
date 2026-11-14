"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { cx } from "@/lib/cx";
import { LogoutButton } from "@/features/auth/logout-button";
import { LogoDialog } from "./logo-dialog";
import { businessNavItems } from "./nav-items";

type SidebarProps = {
  businessName: string;
  businessInitials: string;
  businessLogoUrl: string | null;
  userName: string;
  userRole: string;
  initials: string;
};

export function Sidebar({ businessName, businessInitials, businessLogoUrl, userName, userRole, initials }: SidebarProps) {
  const t = useTranslations("business");
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-66 shrink-0 flex-col gap-6 border-r border-border bg-surface px-4 py-6 lg:flex">
      <Logo className="ml-3 h-10 w-auto shrink-0 self-start" entryTarget />
      <LogoDialog businessName={businessName} initials={businessInitials} logoUrl={businessLogoUrl} />
      <nav aria-label={t("nav.label")} className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="px-3 pb-1 text-xs font-medium text-muted">{t("nav.section")}</p>
        {businessNavItems.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-11 items-center gap-3 rounded-md px-3 text-base transition-[background-color,color,transform] duration-150 ease-out active:scale-97",
                active
                  ? "bg-primary-soft font-semibold text-primary-text"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              <Icon aria-hidden strokeWidth={1.75} className={cx("size-5", active ? "text-primary-text" : "text-muted")} />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>
      <div className="-mx-4 -mb-6 flex shrink-0 items-center gap-3 border-t border-border px-7 py-4">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary-text"
        >
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{userName}</span>
          <span className="truncate text-xs text-muted">{userRole}</span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
