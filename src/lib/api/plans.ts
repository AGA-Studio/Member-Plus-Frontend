import type { Plan, PlanSummary } from "@/lib/domain";
import { canSignUpFor } from "@/lib/registration";
import { backendGet, backendUrl } from "./backend";

type BackendPlan = {
  id: number;
  key: string;
  name: string;
  price_cents: number;
  max_customers: number | null;
  max_users: number | null;
  max_devices: number | null;
  history_days: number | null;
  images_enabled: boolean;
  exports_enabled: boolean;
  ai_enabled: boolean;
  ai_messages_month: number;
  trial_days: number;
  is_default: boolean;
};

export type BackendPlanSummary = {
  plan: BackendPlan;
  trial_ends_at: string | null;
  trial_active: boolean;
  unit_price_cents: number | null;
  usage: PlanSummary["usage"];
};

function toPlan(plan: BackendPlan): Plan {
  return {
    id: plan.id,
    key: plan.key,
    name: plan.name,
    priceCents: plan.price_cents,
    maxCustomers: plan.max_customers,
    maxUsers: plan.max_users,
    maxDevices: plan.max_devices,
    historyDays: plan.history_days,
    imagesEnabled: plan.images_enabled,
    exportsEnabled: plan.exports_enabled,
    aiEnabled: plan.ai_enabled,
    aiMessagesMonth: plan.ai_messages_month,
    trialDays: plan.trial_days,
    isDefault: plan.is_default,
  };
}

export function toPlanSummary(summary: BackendPlanSummary): PlanSummary {
  return {
    plan: toPlan(summary.plan),
    trialEndsAt: summary.trial_ends_at,
    trialActive: summary.trial_active,
    unitPriceCents: summary.unit_price_cents,
    usage: summary.usage,
  };
}

export async function fetchSignUpPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(backendUrl("/api/v1/plan/list"), { cache: "no-store" });
    if (!response.ok) return [];

    const plans = (await response.json()) as BackendPlan[];

    return plans.map(toPlan).filter(canSignUpFor);
  } catch {
    return [];
  }
}

export async function listPublicPlans(): Promise<Plan[]> {
  const plans = await backendGet<BackendPlan[]>("/plan/list");

  return plans.map(toPlan);
}

export async function getPlanSummary(): Promise<PlanSummary> {
  return toPlanSummary(await backendGet<BackendPlanSummary>("/plan/summary"));
}
