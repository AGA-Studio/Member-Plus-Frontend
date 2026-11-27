"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Plan, PlanSummary } from "@/lib/domain";
import { formatMoney } from "@/lib/format";
import { planChangeWarnings } from "@/lib/plan";
import type { PlanChangeFailure } from "./actions";

type PlanChangeConfirmationProps = {
  summary: PlanSummary;
  target: Plan;
  failure: PlanChangeFailure | null;
  pending: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function PlanChangeConfirmation({
  summary,
  target,
  failure,
  pending,
  onBack,
  onConfirm,
}: PlanChangeConfirmationProps) {
  const t = useTranslations("plans.change");
  const format = useFormatter();
  const warnings = planChangeWarnings(summary, target);

  return (
    <div className="flex flex-col gap-5">
      {failure ? <Alert tone="danger">{t(`failures.${failure}`)}</Alert> : null}
      <p className="text-base text-foreground">
        {target.priceCents === 0
          ? t("confirmFree", { current: summary.plan.name, plan: target.name })
          : t("confirmPaid", {
              current: summary.plan.name,
              plan: target.name,
              price: formatMoney(format, target.priceCents),
            })}
      </p>
      {warnings.length > 0 ? (
        <Alert tone="warning">
          <ul className="flex flex-col gap-1">
            {warnings.map((warning) => (
              <li key={warning.kind}>
                {warning.kind === "customersOver" || warning.kind === "usersOver"
                  ? t(`warnings.${warning.kind}`, { used: warning.used, limit: warning.limit })
                  : t(`warnings.${warning.kind}`)}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onBack} disabled={pending}>
          {t("back")}
        </Button>
        <Button loading={pending} onClick={onConfirm}>
          {pending ? t("confirming") : t("confirm")}
        </Button>
      </div>
    </div>
  );
}
