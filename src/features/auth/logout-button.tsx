"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { logoutFromBackend } from "./auth-client";

export function LogoutButton() {
  const t = useTranslations("common.logout");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmLogout() {
    startTransition(async () => {
      await logoutFromBackend();
      router.replace("/login?toast=signedOut");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
        className="flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97"
      >
        <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t("title")}>
        <p className="text-base text-muted">{t("body")}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button loading={pending} onClick={confirmLogout}>
            {pending ? t("confirming") : t("confirm")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
