"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { Plan } from "@/lib/domain";
import { revealClasses } from "@/lib/motion";
import { PlanPrice } from "./plan-price";
import { usePlanHighlights } from "./use-plan-highlights";

type PlanChoicesProps = {
  plans: Plan[];
  currentPlanId: number;
  trialActive: boolean;
  onChoose: (plan: Plan) => void;
};

export function PlanChoices({ plans, currentPlanId, trialActive, onChoose }: PlanChoicesProps) {
  const t = useTranslations("plans.change");
  const highlightsOf = usePlanHighlights();

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {plans.map((plan, index) => {
        const current = plan.id === currentPlanId;

        return (
          <li key={plan.id} className={revealClasses(index)}>
            <section
              aria-current={current ? "true" : undefined}
              className={cx(
                "flex h-full flex-col gap-4 rounded-lg border p-4",
                current ? "border-primary bg-primary-soft" : "border-border-strong bg-surface",
              )}
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-subheading text-foreground">{plan.name}</h3>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  <PlanPrice cents={plan.priceCents} />
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {highlightsOf(plan).map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-foreground">
                    <Check aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primary-text" />
                    {highlight}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex min-h-11 items-center justify-center">
                {current ? (
                  <Badge tone="primary">{trialActive ? t("currentTrial") : t("current")}</Badge>
                ) : (
                  <Button
                    variant="outline"
                    fullWidth
                    aria-label={t("chooseNamed", { plan: plan.name })}
                    onClick={() => onChoose(plan)}
                  >
                    {t("choose")}
                  </Button>
                )}
              </div>
            </section>
          </li>
        );
      })}
    </ul>
  );
}
