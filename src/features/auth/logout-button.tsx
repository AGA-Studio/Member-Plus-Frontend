"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { logoutAction } from "./actions";

export function LogoutButton() {
  const t = useTranslations("common.logout");
  const [open, setOpen] = useState(false);

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
        <form action={logoutAction} className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <SubmitButton label={t("confirm")} pendingLabel={t("confirming")} />
        </form>
      </Dialog>
    </>
  );
}
