import { useTranslations } from "next-intl";
import type { Plan } from "@/lib/domain";

export function usePlanHighlights(): (plan: Plan) => string[] {
  const t = useTranslations("registration.plans");

  return (plan) => [
    plan.maxCustomers === null ? t("customersUnlimited") : t("customers", { count: plan.maxCustomers }),
    plan.maxUsers === null ? t("usersUnlimited") : t("users", { count: plan.maxUsers }),
    plan.historyDays === null ? t("historyFull") : t("history", { days: plan.historyDays }),
    ...(plan.imagesEnabled ? [t("images")] : []),
    ...(plan.exportsEnabled ? [t("exports")] : []),
  ];
}
