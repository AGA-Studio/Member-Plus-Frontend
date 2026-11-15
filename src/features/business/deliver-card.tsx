"use client";

import { Copy, Link2, Mail, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
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

const qrSize = 160;

export function DeliverCardButton({ id, email, className }: DeliverCardButtonProps) {
  const t = useTranslations("business.customer");
  const toasts = useTranslations("toasts");
  const common = useTranslations("common");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const attempt = useAttempt();
  const [busy, setBusy] = useState<Busy>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  function closeDialog() {
    setOpen(false);
    setLinkUrl(null);
  }

  async function sendEmail() {
    setBusy("email");
    const result = await attempt(() => sendCardEmailAction(id), toasts("cardEmailFailed"));
    setBusy(null);
    if (!result) return;

    if (result.ok) {
      closeDialog();
      show("success", toasts("cardEmailSent"));
      return;
    }

    show("danger", toasts(result.reason === "rateLimited" ? "cardEmailRateLimited" : "cardEmailFailed"));
  }

  async function generateLink() {
    setBusy("link");
    const result = await attempt(() => createCardLinkAction(id), toasts("cardLinkCreateFailed"));
    setBusy(null);
    if (!result) return;

    if (result.ok) {
      setLinkUrl(result.url);
      return;
    }

    show("danger", toasts("cardLinkCreateFailed"));
  }

  async function copyLink() {
    if (!linkUrl) return;

    try {
      await navigator.clipboard.writeText(linkUrl);
      show("success", toasts("cardLinkCopied"));
    } catch {
      show("danger", toasts("cardLinkFailed"));
    }
  }

  return (
    <>
      <Button variant="outline" className={className} onClick={() => setOpen(true)}>
        <Send aria-hidden strokeWidth={1.75} className="size-5" />
        {t("actions.deliver")}
      </Button>
      <Dialog open={open} onClose={closeDialog} title={t("deliver.title")}>
        <p className="text-base text-muted">{t("deliver.description", { email })}</p>
        <div className="flex flex-col gap-3">
          <Button size="lg" fullWidth loading={busy === "email"} disabled={busy !== null} onClick={sendEmail}>
            {busy === "email" ? null : <Mail aria-hidden strokeWidth={1.75} className="size-5" />}
            {busy === "email" ? t("deliver.sending") : t("deliver.sendEmail")}
          </Button>
          {linkUrl ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-4 transition-[opacity,scale] duration-200 ease-out starting:scale-95 starting:opacity-0">
              <div className="rounded-md bg-white p-3 text-ink-900 ring-1 ring-border">
                <QRCodeSVG
                  value={linkUrl}
                  size={qrSize}
                  level="M"
                  fgColor="currentColor"
                  bgColor="transparent"
                  role="img"
                  aria-label={t("deliver.qrLabel")}
                />
              </div>
              <p className="text-center text-sm text-muted">{t("deliver.qrHint")}</p>
              <Button variant="outline" size="lg" fullWidth onClick={copyLink}>
                <Copy aria-hidden strokeWidth={1.75} className="size-5" />
                {t("deliver.copyLink")}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              loading={busy === "link"}
              disabled={busy !== null}
              onClick={generateLink}
            >
              {busy === "link" ? null : <Link2 aria-hidden strokeWidth={1.75} className="size-5" />}
              {busy === "link" ? t("deliver.generating") : t("deliver.generateLink")}
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={closeDialog}>
            {common("close")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
