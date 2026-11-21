"use server";

import { revalidatePath } from "next/cache";
import { updateBusinessStatus, type SettableBusinessStatus } from "@/lib/api/platform";
import { requireActionUser } from "@/lib/session";

export type BusinessStatusActionResult = "done" | "notFound" | "trialNotAllowed" | "unavailable";

export async function updateBusinessStatusAction(
  id: number,
  status: SettableBusinessStatus,
): Promise<BusinessStatusActionResult> {
  await requireActionUser(["platform"]);

  const result = await updateBusinessStatus(id, status);
  if (!result.ok) return result.reason;

  revalidatePath("/plataforma", "layout");
  return "done";
}
