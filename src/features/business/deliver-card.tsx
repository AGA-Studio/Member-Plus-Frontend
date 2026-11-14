"use client";

import { Link2, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { useAttempt } from "@/lib/use-action-guard";
import { createCardLinkAction, sendCardEmailAction } from "./actions";

type DeliverCardButtonProps = {
  id: number;
  email: string;
  className?: string;
};

type Busy = "email" | "link" | null;

export function DeliverCardButton({ id, email, className }: DeliverCardButtonProps) {
  const t = useTranslations("business.customer");
  const toasts = useTranslations("toasts");
  const common = useTranslations("common");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const attempt = useAttempt();
  const [busy, setBusy] = useState<Busy>(null);

  async function sendEmail() {
    setBusy("email");
    const result = await attempt(() => sendCardEmailAction(id), toasts("cardEmailFailed"));
    setBusy(null);
    if (!result) return;

    if (result.ok) {
      setOpen(false);
      show("success", toasts("cardEmailSent"));
      return;
    }

    show("danger", toasts(result.reason === "rateLimited" ? "cardEmailRateLimited" : "cardEmailFailed"));
  }

  async function copyLink() {
    setBusy("link");
    const result = await attempt(() => createCardLinkAction(id), toasts("cardLinkFailed"));
    if (!result) {
      setBusy(null);
      return;
    }

    try {
      if (!result.ok) throw new Error("Card link could not be created");
      await navigator.clipboard.writeText(result.url);
      setOpen(false);
      show("success", toasts("cardLinkCopied"));
    } catch {
      show("danger", toasts("cardLinkFailed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Button variant="outline" className={className} onClick={() => setOpen(true)}>
        <Send aria-hidden strokeWidth={1.75} className="size-5" />
        {t("actions.deliver")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t("deliver.title")}>
        <p className="text-base text-muted">{t("deliver.description", { email })}</p>
        <div className="flex flex-col gap-3">
          <Button size="lg" fullWidth loading={busy === "email"} disabled={busy !== null} onClick={sendEmail}>
            {busy === "email" ? null : <Mail aria-hidden strokeWidth={1.75} className="size-5" />}
            {busy === "email" ? t("deliver.sending") : t("deliver.sendEmail")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            loading={busy === "link"}
            disabled={busy !== null}
            onClick={copyLink}
          >
            {busy === "link" ? null : <Link2 aria-hidden strokeWidth={1.75} className="size-5" />}
            {busy === "link" ? t("deliver.copying") : t("deliver.copyLink")}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {common("close")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
