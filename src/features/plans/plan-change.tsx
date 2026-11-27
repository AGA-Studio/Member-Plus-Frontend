"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { usePaymentSimulation } from "@/features/payments/use-payment-simulation";
import type { Plan, PlanSummary } from "@/lib/domain";
import { useAttempt } from "@/lib/use-action-guard";
import { changePlanAction, type PlanChangeFailure } from "./actions";
import { PlanChangeConfirmation } from "./plan-change-confirmation";
import { PlanChoices } from "./plan-choices";
import { usePlanName } from "./use-plan-name";

type PlanChangeProps = {
  summary: PlanSummary;
  plans: Plan[];
};

type Step = "closed" | "choosing" | "confirming";

export function PlanChange({ summary, plans }: PlanChangeProps) {
  const t = useTranslations("plans.change");
  const toasts = useTranslations("toasts");
  const router = useRouter();
  const { show } = useToast();
  const attempt = useAttempt();
  const payment = usePaymentSimulation();
  const planName = usePlanName();
  const [step, setStep] = useState<Step>("closed");
  const [target, setTarget] = useState<Plan | null>(null);
  const [confirmationSummary, setConfirmationSummary] = useState(summary);
  const [failure, setFailure] = useState<PlanChangeFailure | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(plan: Plan) {
    setTarget(plan);
    setConfirmationSummary(summary);
    setFailure(null);
    setStep("confirming");
  }

  function confirm(plan: Plan) {
    const paidPlan = plan.priceCents > 0;
    setFailure(null);
    if (paidPlan) {
      setStep("closed");
      payment.start();
    }

    startTransition(async () => {
      const result = await attempt(() => changePlanAction(plan.id), t("failures.unavailable"));

      if (result !== "changed") {
        if (paidPlan) flushSync(payment.cancel);
        setStep("confirming");
        if (result !== undefined) setFailure(result);
        if (result === "invalid" || result === "unchanged") router.refresh();
        return;
      }

      if (paidPlan) await payment.approve();
      setStep("closed");
      show("success", toasts("planChanged", { plan: planName(plan) }));
    });
  }

  return (
    <>
      <Button fullWidth onClick={() => setStep("choosing")}>
        {t("open")}
      </Button>
      <Dialog open={step === "choosing"} onClose={() => setStep("closed")} title={t("choosingTitle")} variant="wide">
        <PlanChoices
          plans={plans}
          currentPlanId={summary.plan.id}
          trialActive={summary.trialActive}
          onChoose={choose}
        />
      </Dialog>
      <Dialog
        open={step === "confirming"}
        onClose={() => {
          if (!pending) setStep("closed");
        }}
        title={target ? t("confirmTitle", { plan: planName(target) }) : t("choosingTitle")}
      >
        {target ? (
          <PlanChangeConfirmation
            summary={confirmationSummary}
            target={target}
            failure={failure}
            pending={pending}
            onBack={() => setStep("choosing")}
            onConfirm={() => confirm(target)}
          />
        ) : null}
      </Dialog>
      {target ? (
        <PaymentDialog
          open={payment.open}
          stage={payment.stage}
          planName={planName(target)}
          priceCents={target.priceCents}
          approvedDetail={t("approvedDetail", { plan: planName(target) })}
        />
      ) : null}
    </>
  );
}
