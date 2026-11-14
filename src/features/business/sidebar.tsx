"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { cx } from "@/lib/cx";
import { LogoutButton } from "@/features/auth/logout-button";
import { LogoDialog } from "./logo-dialog";
import { businessNavItems } from "./nav-items";

type SidebarProps = {
  businessName: string;
  businessInitials: string;
  businessLogoUrl: string | null;
  userName: string;
};

const settleMilliseconds = 320;

const indicatorOffsets = ["translate-y-0", "translate-y-13", "translate-y-26", "translate-y-39"] as const;

const labelEnter =
  "transition-opacity duration-200 ease-out delay-100 starting:opacity-0";

export function Sidebar({ businessName, businessInitials, businessLogoUrl, userName }: SidebarProps) {
  const t = useTranslations("business");
  const logout = useTranslations("common.logout");
  const pathname = usePathname();
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const activeIndex = businessNavItems.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  const [isPill, setIsPill] = useState(true);

  function expand() {
    setIsPill(false);
    setExpanded(true);
  }

  function collapse() {
    setExpanded(false);
  }

  useEffect(() => {
    if (expanded) return;

    const timer = window.setTimeout(() => setIsPill(true), settleMilliseconds);

    return () => window.clearTimeout(timer);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
      setExpanded(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [expanded]);

  return (
    <div
      className={cx(
        "relative hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
        expanded ? "w-70" : "w-22",
      )}
    >
      <aside
        ref={panelRef}
        id={panelId}
        className={cx(
          "absolute inset-y-3 left-3 z-30 flex flex-col gap-2 overflow-hidden border border-border bg-surface p-2",
          "transition-[width,box-shadow] duration-300 ease-in-out",
          expanded ? "w-64 shadow-md" : "w-16 shadow-md",
          isPill ? "rounded-full" : "rounded-xl",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between">
          {expanded ? (
            <>
              <Logo className={cx("ml-2 h-8 w-auto", labelEnter)} entryTarget />
              <button
                type="button"
                onClick={collapse}
                aria-label={t("sidebar.close")}
                aria-expanded
                aria-controls={panelId}
                className="flex size-12 shrink-0 items-center justify-center rounded-full text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97"
              >
                <PanelLeftClose aria-hidden strokeWidth={1.75} className="size-5" />
              </button>
            </>
          ) : (
            <Tooltip label={t("sidebar.open")} className="shrink-0">
              <button
                type="button"
                onClick={expand}
                aria-label={t("sidebar.open")}
                aria-expanded={false}
                aria-controls={panelId}
                data-entry-target="origin"
                className="group relative flex size-12 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97"
              >
                <Logo
                  variant="icon"
                  className="absolute h-8 w-auto scale-100 opacity-100 transition-[opacity,scale] duration-200 ease-out group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0"
                />
                <PanelLeftOpen
                  aria-hidden
                  strokeWidth={1.75}
                  className="absolute size-5 scale-75 text-primary-text opacity-0 transition-[opacity,scale] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                />
              </button>
            </Tooltip>
          )}
        </div>

        <nav aria-label={t("nav.label")} className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {expanded ? (
            <p className={cx("px-4 pb-1 pt-2 text-xs font-medium text-muted", labelEnter)}>{t("nav.section")}</p>
          ) : (
            <span aria-hidden className="mx-3 my-2 h-px bg-border" />
          )}
          <div className="relative flex flex-col gap-1">
            <span
              aria-hidden
              className={cx(
                "absolute inset-x-0 top-0 h-12 rounded-full bg-primary-soft transition-[translate,opacity] duration-300 ease-in-out",
                activeIndex === -1 ? "opacity-0" : indicatorOffsets[activeIndex],
              )}
            />
          {businessNavItems.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const label = t(`nav.${key}`);

            return (
              <Tooltip key={href} label={label} disabled={expanded} className="w-full shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  aria-label={label}
                  className={cx(
                    "relative flex h-12 items-center rounded-full text-base transition-[background-color,color,transform] duration-150 ease-out active:scale-97",
                    active
                      ? "font-semibold text-primary-text"
                      : "text-foreground hover:bg-surface-muted",
                  )}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center">
                    <Icon aria-hidden strokeWidth={1.75} className={cx("size-5", active ? "text-primary-text" : "text-muted")} />
                  </span>
                  {expanded ? <span className={cx("truncate pr-4", labelEnter)}>{label}</span> : null}
                </Link>
              </Tooltip>
            );
          })}
          </div>
        </nav>

        <div
          className={cx(
            "flex shrink-0 border-t border-border pt-2",
            expanded ? "items-center gap-1" : "flex-col items-center gap-1",
          )}
        >
          <LogoDialog
            businessName={businessName}
            initials={businessInitials}
            logoUrl={businessLogoUrl}
            userName={userName}
            compact={!expanded}
          />
          {expanded ? (
            <LogoutButton />
          ) : (
            <Tooltip label={logout("title")}>
              <LogoutButton />
            </Tooltip>
          )}
        </div>
      </aside>
    </div>
  );
}
