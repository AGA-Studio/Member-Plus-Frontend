"use client";

import { CircleCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/format";
import type { PaymentStage } from "./use-payment-simulation";

type PaymentDialogProps = {
  open: boolean;
  stage: PaymentStage;
  planName: string;
  priceCents: number;
  trialDays: number;
};

export function PaymentDialog({ open, stage, planName, priceCents, trialDays }: PaymentDialogProps) {
  const t = useTranslations("registration.payment");
  const format = useFormatter();
  const approved = stage === "approved";

  return (
    <Dialog open={open} title={approved ? t("approvedTitle") : t("processingTitle")} dismissible={false}>
      <div role="status" className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="flex size-12 items-center justify-center">
          {approved ? (
            <CircleCheck
              aria-hidden
              strokeWidth={1.75}
              className="size-12 text-success-text transition-[opacity,scale] duration-200 ease-out starting:scale-90 starting:opacity-0"
            />
          ) : (
            <Spinner className="size-10 text-primary-text" />
          )}
        </span>
        <p
          key={stage}
          className="text-base font-semibold text-foreground transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0"
        >
          {stage === "approved" ? t("approvedDetail", { plan: planName, days: trialDays }) : t(`steps.${stage}`)}
        </p>
        <p className="text-sm tabular-nums text-muted">
          {t("summary", { plan: planName, price: formatMoney(format, priceCents) })}
        </p>
      </div>
      <p className="text-center text-sm text-muted">{t("simulated")}</p>
    </Dialog>
  );
}
