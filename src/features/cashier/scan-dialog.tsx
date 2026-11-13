"use client";

import { ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ScanCard } from "./scan-card";

type ScanDialogProps = {
  hasMember: boolean;
};

export function ScanDialog({ hasMember }: ScanDialogProps) {
  const t = useTranslations("cashier.scan");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={hasMember ? "outline" : "primary"}
        size="lg"
        fullWidth
        onClick={() => setOpen(true)}
      >
        <ScanLine aria-hidden strokeWidth={1.75} className="size-5" />
        {hasMember ? t("openAnother") : t("open")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t("title")}>
        <div className="flex flex-col items-start gap-3">
          <Badge tone="success">{t("readerConnected")}</Badge>
          <p className="text-base text-muted">{t("subtitle")}</p>
        </div>
        {open ? <ScanCard onFound={() => setOpen(false)} /> : null}
      </Dialog>
    </>
  );
}
