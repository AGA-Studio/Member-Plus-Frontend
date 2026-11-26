"use client";

import { Check } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/lib/registration";

type PlanPickerProps = {
  plans: Plan[];
  selectedId: number;
  onSelect: (planId: number) => void;
};

export function PlanPicker({ plans, selectedId, onSelect }: PlanPickerProps) {
  const t = useTranslations("registration.plans");
  const format = useFormatter();

  function featuresOf(plan: Plan): string[] {
    return [
      plan.maxCustomers === null ? t("customersUnlimited") : t("customers", { count: plan.maxCustomers }),
      plan.maxUsers === null ? t("usersUnlimited") : t("users", { count: plan.maxUsers }),
      plan.historyDays === null ? t("historyFull") : t("history", { days: plan.historyDays }),
      ...(plan.imagesEnabled ? [t("images")] : []),
      ...(plan.exportsEnabled ? [t("exports")] : []),
    ];
  }

  return (
    <div className="flex flex-col gap-3">
      {plans.map((plan) => {
        const selected = plan.id === selectedId;

        return (
          <label
            key={plan.id}
            className={cx(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
              "transition-[background-color,border-color,transform] duration-150 ease-out active:scale-98",
              selected ? "border-primary bg-primary-soft" : "border-border-strong bg-surface hover:bg-surface-muted",
            )}
          >
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={selected}
              onChange={() => onSelect(plan.id)}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-base font-semibold text-foreground">{plan.name}</span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {plan.priceCents === 0
                    ? t("free")
                    : t("monthly", { price: formatMoney(format, plan.priceCents) })}
                </span>
              </span>
              {plan.trialDays > 0 ? (
                <span>
                  <Badge tone="success">{t("trial", { days: plan.trialDays })}</Badge>
                </span>
              ) : null}
              <span className="flex flex-col gap-1">
                {featuresOf(plan).map((feature) => (
                  <span key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primary-text" />
                    {feature}
                  </span>
                ))}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
