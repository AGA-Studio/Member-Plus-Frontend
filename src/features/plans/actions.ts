"use server";

import { revalidatePath } from "next/cache";
import { changePlan } from "@/lib/api/plans";
import { requireActionUser } from "@/lib/session";

export type PlanChangeFailure = "closed" | "invalid" | "unchanged" | "unavailable";

export async function changePlanAction(planId: number): Promise<"changed" | PlanChangeFailure> {
  await requireActionUser(["admin"]);

  const result = await changePlan(planId);
  if (!result.ok) return result.reason;

  revalidatePath("/", "layout");
  return "changed";
}
