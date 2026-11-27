import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import type { Plan } from "@/lib/domain";
import { PlanPrice } from "./plan-price";
import { usePlanName } from "./use-plan-name";

export function PlanCatalog({ plans }: { plans: Plan[] }) {
  const t = useTranslations("plans");
  const catalog = useTranslations("plans.catalog");
  const format = useFormatter();
  const planName = usePlanName();

  const limitOf = (limit: number | null) => (limit === null ? t("unlimited") : format.number(limit));
  const availability = (enabled: boolean) => catalog(enabled ? "included" : "excluded");

  function rowsOf(plan: Plan) {
    return [
      { key: "customers", value: limitOf(plan.maxCustomers) },
      { key: "users", value: limitOf(plan.maxUsers) },
      { key: "devices", value: limitOf(plan.maxDevices) },
      {
        key: "history",
        value: plan.historyDays === null ? catalog("historyFull") : catalog("historyDays", { days: plan.historyDays }),
      },
      { key: "images", value: availability(plan.imagesEnabled) },
      { key: "exports", value: availability(plan.exportsEnabled) },
      {
        key: "ai",
        value: plan.aiEnabled ? catalog("aiMessages", { count: plan.aiMessagesMonth }) : catalog("excluded"),
      },
    ] as const;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {plans.map((plan, index) => (
        <li key={plan.id}>
          <Reveal variant="entrance" index={2 + index} className="h-full">
            <section className="flex h-full flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-subheading text-foreground">{planName(plan)}</h2>
                  <span className="flex flex-wrap gap-2">
                    {plan.isDefault ? <Badge tone="neutral">{catalog("default")}</Badge> : null}
                    {plan.trialDays > 0 ? (
                      <Badge tone="success">{catalog("trial", { days: plan.trialDays })}</Badge>
                    ) : null}
                  </span>
                </div>
                <p className="font-display text-heading font-semibold tabular-nums text-foreground">
                  <PlanPrice cents={plan.priceCents} />
                </p>
              </div>
              <dl className="flex flex-col">
                {rowsOf(plan).map(({ key, value }) => (
                  <div key={key} className="flex items-baseline justify-between gap-4 border-t border-border py-3">
                    <dt className="text-sm text-muted">{catalog(`rows.${key}`)}</dt>
                    <dd className="text-right text-base font-medium tabular-nums text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
