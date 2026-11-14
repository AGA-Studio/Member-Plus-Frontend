"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cx } from "@/lib/cx";
import { logoutFromBackend } from "./auth-client";

type LogoutDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const t = useTranslations("common.logout");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    return () => {
      setLeaving(false);
      onCloseRef.current();
    };
  }, []);

  function confirmLogout() {
    setLeaving(true);
    startTransition(async () => {
      await logoutFromBackend();
      router.replace("/login?toast=signedOut");
      router.refresh();
    });
  }

  const busy = pending || leaving;

  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      <p className="text-base text-muted">{t("body")}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button loading={busy} onClick={confirmLogout}>
          {busy ? t("confirming") : t("confirm")}
        </Button>
      </div>
    </Dialog>
  );
}

type LogoutButtonProps = {
  tone?: "muted" | "strong" | "inverse";
};

export function LogoutButton({ tone = "muted" }: LogoutButtonProps) {
  const t = useTranslations("common.logout");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
        className={cx(
          "flex size-11 items-center justify-center transition-[background-color,color,transform] duration-150 ease-out active:scale-97",
          tone === "inverse"
            ? "rounded-full text-ink-300 hover:bg-white/10 hover:text-white"
            : cx("rounded-md hover:bg-surface-muted hover:text-foreground", tone === "strong" ? "text-foreground" : "text-muted"),
        )}
      >
        <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
      </button>
      <LogoutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type UserAvatarButtonProps = {
  initials: string;
};

export function UserAvatarButton({ initials }: UserAvatarButtonProps) {
  const t = useTranslations("common.logout");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
        data-entry-target="origin"
        className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary-text transition-transform duration-150 ease-out active:scale-97"
      >
        {initials}
      </button>
      <LogoutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
