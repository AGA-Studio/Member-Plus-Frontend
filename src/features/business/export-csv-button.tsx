"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import type { MovementPeriod } from "@/lib/api/purchases";
import { exportMovementsAction } from "./actions";

type ExportCsvButtonProps = {
  query?: string;
  period: MovementPeriod;
};

function countRows(csv: string): number {
  return Math.max(0, csv.split("\n").filter((line) => line.trim() !== "").length - 1);
}

export function ExportCsvButton({ query, period }: ExportCsvButtonProps) {
  const t = useTranslations("business.movements.export");
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const csv = await exportMovementsAction({ query, period });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = t("fileName");
      link.click();
      URL.revokeObjectURL(url);
      show("success", t("done", { count: countRows(csv) }));
    });
  }

  return (
    <Button variant="outline" loading={pending} onClick={handleClick}>
      {pending ? null : <Download aria-hidden strokeWidth={1.75} className="size-5" />}
      {pending ? t("preparing") : t("label")}
    </Button>
  );
}
