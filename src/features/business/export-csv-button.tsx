"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import type { MovementPeriod } from "@/lib/api/purchases";
import { exportMovementsAction, type MovementExportRow } from "./actions";

type ExportCsvButtonProps = {
  query?: string;
  register?: string;
  period: MovementPeriod;
};

function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers: string[], rows: MovementExportRow[]): string {
  const lines = rows.map((row) =>
    [
      row.createdAt,
      row.registerName,
      row.memberName,
      row.memberCode,
      row.concept,
      row.amount.toFixed(2),
      row.discount.toFixed(2),
      row.points,
      row.cashbackEarned.toFixed(2),
      row.cashbackUsed.toFixed(2),
    ]
      .map(escapeCell)
      .join(","),
  );

  return [headers.map(escapeCell).join(","), ...lines].join("\n");
}

export function ExportCsvButton({ query, register, period }: ExportCsvButtonProps) {
  const t = useTranslations("business.movements.export");
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const rows = await exportMovementsAction({ query, register, period });
      const headers = [
        t("headers.date"),
        t("headers.register"),
        t("headers.customer"),
        t("headers.code"),
        t("headers.concept"),
        t("headers.amount"),
        t("headers.discount"),
        t("headers.points"),
        t("headers.cashbackEarned"),
        t("headers.cashbackUsed"),
      ];
      const blob = new Blob([`﻿${toCsv(headers, rows)}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = t("fileName");
      link.click();
      URL.revokeObjectURL(url);
      show("success", t("done", { count: rows.length }));
    });
  }

  return (
    <Button variant="outline" loading={pending} onClick={handleClick}>
      {pending ? null : <Download aria-hidden strokeWidth={1.75} className="size-5" />}
      {pending ? t("preparing") : t("label")}
    </Button>
  );
}
