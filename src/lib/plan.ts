import type { PlanSummary, PlanUsageItem } from "./domain";

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
