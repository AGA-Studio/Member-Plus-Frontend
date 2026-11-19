"use client";

import { ChevronDown, Camera, Languages, LogOut, Moon, Settings, Sun, UserCog } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef, useState, type MouseEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { LogoutDialog } from "@/features/auth/logout-button";
import { ProfilePhotoDialog } from "@/features/auth/profile-button";
import { LanguageDialog } from "@/features/i18n/language-button";
import { useTheme } from "@/features/theme/use-theme";
import { cx } from "@/lib/cx";
import { staggerClasses } from "@/lib/motion";
import type { UserRole } from "@/lib/domain";
import type { Theme } from "@/lib/theme";

type UserMenuProps = {
  fullName: string;
  photoUrl: string | null;
  role: UserRole;
  initialTheme: Theme;
};

type ActiveDialog = "photo" | "language" | "logout" | null;

const menuGap = 8;

const itemClasses =
  "flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-base text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97";

export function UserMenu({ fullName, photoUrl, role, initialTheme }: UserMenuProps) {
  const t = useTranslations("business.topbar.account");
  const roles = useTranslations("common.role");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const { theme, change } = useTheme(initialTheme);
  const dark = theme === "dark";

  function toggleMenu() {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger) return;

    if (menu.matches(":popover-open")) {
      menu.hidePopover();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + menuGap}px`;
    menu.style.right = `${Math.max(menuGap, window.innerWidth - rect.right)}px`;
    menu.showPopover();
  }

  function closeMenu() {
    menuRef.current?.hidePopover();
  }

  function openDialog(next: Exclude<ActiveDialog, null>) {
    closeMenu();
    setDialog(next);
  }

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const origin = fromKeyboard
      ? { x: rect.right - 32, y: rect.top + rect.height / 2 }
      : { x: event.clientX, y: event.clientY };

    void change(dark ? "light" : "dark", origin);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label={t("label")}
        data-entry-target="origin"
        className="group flex h-12 items-center gap-3 rounded-lg py-1 pl-1 pr-2 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97 sm:pr-3"
      >
        <Avatar name={fullName} photoUrl={photoUrl} className="size-10" />
        <span className="hidden min-w-0 flex-col sm:flex">
          <span className="max-w-40 truncate text-sm font-semibold leading-tight text-foreground">{fullName}</span>
          <span className="text-xs leading-tight text-muted">{roles(role)}</span>
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={cx(
            "hidden size-4 shrink-0 text-muted transition-transform duration-200 ease-out sm:block",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        ref={menuRef}
        popover="auto"
        aria-label={t("label")}
        onToggle={(event) => setExpanded(event.newState === "open")}
        className={cx(
          "m-0 inset-auto w-72 origin-top-right overflow-visible rounded-xl border border-border bg-surface p-2 text-foreground shadow-lg",
          "scale-95 opacity-0 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
          "transition-[opacity,scale,display,overlay] duration-150 ease-out transition-discrete",
        )}
      >
        <div className={cx("flex items-center gap-3 border-b border-border px-3 pb-3 pt-2", staggerClasses(0))}>
          <Avatar name={fullName} photoUrl={photoUrl} className="size-11" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base font-semibold text-foreground">{fullName}</span>
            <span className="text-sm text-muted">{roles(role)}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <div className={staggerClasses(1)}>
            <button type="button" onClick={() => openDialog("photo")} className={itemClasses}>
              <Camera aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
              {t("editPhoto")}
            </button>
          </div>
          <div className={staggerClasses(2)}>
            <button type="button" onClick={() => openDialog("language")} className={itemClasses}>
              <Languages aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
              {t("language")}
            </button>
          </div>
          <div className={staggerClasses(3)}>
          <button type="button" role="switch" aria-checked={dark} onClick={toggleTheme} className={itemClasses}>
            {dark ? (
              <Moon aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
            ) : (
              <Sun aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
            )}
            <span className="flex-1">{t("darkMode")}</span>
            <span
              aria-hidden
              className={cx(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out",
                dark ? "bg-primary" : "bg-border-strong",
              )}
            >
              <span
                className={cx(
                  "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out",
                  dark && "translate-x-5",
                )}
              />
            </span>
          </button>
          </div>
          {role === "admin" ? (
            <>
              <div className={cx(staggerClasses(4), "lg:hidden")}>
                <Link href="/usuarios" onClick={closeMenu} className={itemClasses}>
                  <UserCog aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
                  {t("users")}
                </Link>
              </div>
              <div className={cx(staggerClasses(5), "lg:hidden")}>
                <Link href="/configuracion" onClick={closeMenu} className={itemClasses}>
                  <Settings aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
                  {t("settings")}
                </Link>
              </div>
            </>
          ) : null}
        </div>

        <div className={cx("mt-2 border-t border-border pt-2", staggerClasses(6))}>
          <button type="button" onClick={() => openDialog("logout")} className={itemClasses}>
            <LogOut aria-hidden strokeWidth={1.75} className="size-5 text-muted" />
            {t("signOut")}
          </button>
        </div>
      </div>

      <ProfilePhotoDialog
        open={dialog === "photo"}
        onClose={() => setDialog(null)}
        fullName={fullName}
        photoUrl={photoUrl}
      />
      <LanguageDialog open={dialog === "language"} onClose={() => setDialog(null)} />
      <LogoutDialog open={dialog === "logout"} onClose={() => setDialog(null)} />
    </>
  );
}
