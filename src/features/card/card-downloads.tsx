"use client";

import { FileDown, ImageDown, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { captureCardAsPdf, captureCardAsPng, downloadBlob } from "@/lib/card-export";
import { googleWalletAction } from "./actions";

type CardDownloadsProps = {
  token: string;
  code: string;
  captureId: string;
  googleWalletEnabled: boolean;
};

type Busy = "wallet" | "image" | "pdf" | null;

export function CardDownloads({ token, code, captureId, googleWalletEnabled }: CardDownloadsProps) {
  const t = useTranslations("card");
  const { show } = useToast();
  const [busy, setBusy] = useState<Busy>(null);
  const fileName = `tarjeta-${code.toLowerCase()}`;

  async function download(kind: "image" | "pdf") {
    const node = document.getElementById(captureId);
    if (!node || busy) return;

    setBusy(kind);
    try {
      if (kind === "image") {
        downloadBlob(await captureCardAsPng(node), `${fileName}.png`);
        show("success", t("toasts.imageSaved"));
      } else {
        downloadBlob(await captureCardAsPdf(node), `${fileName}.pdf`);
        show("success", t("toasts.pdfSaved"));
      }
    } catch {
      show("danger", t("toasts.downloadFailed"));
    } finally {
      setBusy(null);
    }
  }

  async function addToWallet() {
    if (busy) return;

    setBusy("wallet");
    const result = await googleWalletAction(token).catch(() => null);
    if (result?.ok) {
      window.location.assign(result.url);
      window.setTimeout(() => setBusy(null), 1500);
      return;
    }

    show("danger", t("toasts.walletFailed"));
    setBusy(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {googleWalletEnabled ? (
        <Button size="lg" fullWidth loading={busy === "wallet"} disabled={busy !== null} onClick={addToWallet}>
          {busy === "wallet" ? null : <Wallet aria-hidden strokeWidth={1.75} className="size-5" />}
          {busy === "wallet" ? t("openingWallet") : t("addToGoogleWallet")}
        </Button>
      ) : null}
      <div className="flex flex-col gap-3">
        <Button
          variant={googleWalletEnabled ? "outline" : "primary"}
          size="lg"
          fullWidth
          loading={busy === "image"}
          disabled={busy !== null}
          onClick={() => download("image")}
        >
          {busy === "image" ? null : <ImageDown aria-hidden strokeWidth={1.75} className="size-5" />}
          {t("downloadImage")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          loading={busy === "pdf"}
          disabled={busy !== null}
          onClick={() => download("pdf")}
        >
          {busy === "pdf" ? null : <FileDown aria-hidden strokeWidth={1.75} className="size-5" />}
          {t("downloadPdf")}
        </Button>
      </div>
    </div>
  );
}
