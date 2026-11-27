import { Check, Minus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Reveal } from "@/components/ui/reveal";
import type { PlanSummary } from "@/lib/domain";
import { monthlyPriceCents } from "@/lib/plan";
import { PlanPrice } from "./plan-price";
import { UsageMeter } from "./usage-meter";

type PlanOverviewProps = {
  summary: PlanSummary;
  audience: "business" | "platform";
  fallbackPlanName?: string;
  changeControl?: ReactNode;
};

const cardClasses = "flex h-full flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6";

export function PlanOverview({ summary, audience, fallbackPlanName, changeControl }: PlanOverviewProps) {
  const t = useTranslations("plans");
  const copy = useTranslations(`plans.${audience}`);
  const format = useFormatter();
  const { plan, trialEndsAt, trialActive, usage } = summary;
  const trialDate = trialEndsAt
    ? format.dateTime(new Date(trialEndsAt), { day: "numeric", month: "short", year: "numeric" })
    : null;

  const features = [
    {
      key: "history",
      included: true,
      label: plan.historyDays === null ? t("features.historyFull") : t("features.history", { days: plan.historyDays }),
    },
    { key: "images", included: plan.imagesEnabled, label: t("features.images") },
    { key: "exports", included: plan.exportsEnabled, label: t("features.exports") },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {trialDate ? (
        <Reveal variant="entrance" index={2}>
          {trialActive ? (
            <Alert tone="info">
              {copy("trialRunning", { plan: plan.name, date: trialDate })}
              {audience === "business" && fallbackPlanName
                ? ` ${t("business.trialAfter", { plan: fallbackPlanName })}`
                : null}
            </Alert>
          ) : (
            <Alert tone="warning">{copy("trialEnded", { plan: plan.name, date: trialDate })}</Alert>
          )}
        </Reveal>
      ) : null}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Reveal variant="entrance" index={3}>
          <section className={cardClasses}>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium text-muted">{copy("planTitle")}</h2>
              <p className="font-display text-heading font-semibold text-foreground">{plan.name}</p>
              <p className="text-base tabular-nums text-muted">
                {trialActive ? t("trialPrice") : <PlanPrice cents={monthlyPriceCents(summary)} />}
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-5">
              <h3 className="text-subheading text-foreground">{t("features.title")}</h3>
              <ul className="flex flex-col gap-2">
                {features.map(({ key, included, label }) => {
                  const Icon = included ? Check : Minus;

                  return (
                    <li key={key} className="flex items-start gap-3 text-base text-foreground">
                      <Icon
                        aria-hidden
                        strokeWidth={1.75}
                        className={included ? "mt-0.5 size-5 shrink-0 text-primary-text" : "mt-0.5 size-5 shrink-0 text-muted"}
                      />
                      <span className={included ? undefined : "text-muted"}>
                        {included ? label : t("features.excluded", { feature: label })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </Reveal>
        <Reveal variant="entrance" index={4}>
          <section className={cardClasses}>
            <h2 className="text-subheading text-foreground">{t("usage.title")}</h2>
            <div className="flex flex-col gap-6">
              <UsageMeter
                label={t("usage.customers")}
                hint={t("usage.customersHint")}
                item={usage.customers}
                reachedMessage={t("usage.customersReached")}
              />
              <UsageMeter label={t("usage.users")} item={usage.users} reachedMessage={t("usage.usersReached")} />
            </div>
            {audience === "business" ? (
              <div className="mt-auto border-t border-border pt-5">
                {changeControl ?? <p className="text-sm text-muted">{t("business.changeHint")}</p>}
              </div>
            ) : null}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
