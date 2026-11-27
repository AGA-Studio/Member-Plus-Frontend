import type { Plan, PlanSummary, PlanUsageItem } from "./domain";

const nearLimitRatio = 0.8;

export type UsageLevel = "ok" | "near" | "reached";

export function usageLevel({ used, limit }: PlanUsageItem): UsageLevel {
  if (limit === null) return "ok";
  if (used >= limit) return "reached";

  return used >= limit * nearLimitRatio ? "near" : "ok";
}

export function usagePercent({ used, limit }: PlanUsageItem): number {
  if (limit === null) return 0;
  if (limit <= 0) return 100;

  return Math.min(100, (used / limit) * 100);
}

export function monthlyPriceCents({ plan, trialEndsAt, unitPriceCents }: PlanSummary): number {
  if (trialEndsAt !== null) return plan.priceCents;

  return unitPriceCents ?? plan.priceCents;
}

export function isTrialRunning(trialEndsAt: string | null, now: Date): boolean {
  return trialEndsAt !== null && new Date(trialEndsAt).getTime() > now.getTime();
}

export type PlanChangeWarning =
  | { kind: "trialEnds" | "imagesLost" | "exportsLost" | "historyShorter" }
  | { kind: "customersOver" | "usersOver"; used: number; limit: number };

export function planChangeWarnings({ plan, trialActive, usage }: PlanSummary, target: Plan): PlanChangeWarning[] {
  const warnings: PlanChangeWarning[] = [];
  const { customers, users } = usage;

  if (trialActive) warnings.push({ kind: "trialEnds" });
  if (target.maxCustomers !== null && customers.used > target.maxCustomers) {
    warnings.push({ kind: "customersOver", used: customers.used, limit: target.maxCustomers });
  }
  if (target.maxUsers !== null && users.used > target.maxUsers) {
    warnings.push({ kind: "usersOver", used: users.used, limit: target.maxUsers });
  }
  if (plan.imagesEnabled && !target.imagesEnabled) warnings.push({ kind: "imagesLost" });
  if (plan.exportsEnabled && !target.exportsEnabled) warnings.push({ kind: "exportsLost" });
  if (target.historyDays !== null && (plan.historyDays === null || target.historyDays < plan.historyDays)) {
    warnings.push({ kind: "historyShorter" });
  }

  return warnings;
}
