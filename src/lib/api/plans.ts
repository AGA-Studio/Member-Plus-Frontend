import { canSignUpFor, type Plan } from "@/lib/registration";
import { backendUrl } from "./backend";

type BackendPlan = {
  id: number;
  key: string;
  name: string;
  price_cents: number;
  max_customers: number | null;
  max_users: number | null;
  history_days: number | null;
  images_enabled: boolean;
  exports_enabled: boolean;
  trial_days: number;
  is_default: boolean;
};

function toPlan(plan: BackendPlan): Plan {
  return {
    id: plan.id,
    key: plan.key,
    name: plan.name,
    priceCents: plan.price_cents,
    maxCustomers: plan.max_customers,
    maxUsers: plan.max_users,
    historyDays: plan.history_days,
    imagesEnabled: plan.images_enabled,
    exportsEnabled: plan.exports_enabled,
    trialDays: plan.trial_days,
    isDefault: plan.is_default,
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
