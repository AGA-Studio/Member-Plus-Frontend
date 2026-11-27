import { useTranslations } from "next-intl";
import { localizedPlanName } from "@/lib/plan";

export function usePlanName(): (plan: { key: string; name: string }) => string {
  const t = useTranslations("plans.names");

  return (plan) => localizedPlanName(plan, t);
}
