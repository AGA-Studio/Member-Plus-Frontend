"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import { businessNavItems } from "./nav-items";

export function BottomNav() {
  const t = useTranslations("business");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.label")}
      className="shrink-0 border-t border-border bg-surface lg:hidden"
    >
      <ul className="flex">
        {businessNavItems.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex h-18 flex-col items-center justify-center gap-1 text-xs transition-[color,transform] duration-150 ease-out active:scale-97",
                  active ? "font-semibold text-primary-text" : "text-muted",
                )}
              >
                <Icon aria-hidden strokeWidth={1.75} className="size-6" />
                {t(`nav.${key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
