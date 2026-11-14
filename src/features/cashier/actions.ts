"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findMemberByCode, normalizeMemberCode } from "@/lib/api/members";
import { registerPurchase } from "@/lib/api/purchases";
import { parseAmountToCents } from "@/lib/format";
import { requireActionUser } from "@/lib/session";

export type LookupResult = { ok: true; code: string } | { ok: false; reason: "empty" | "notFound" };

export async function lookupCardAction(rawCode: string): Promise<LookupResult> {
  await requireActionUser(["cashier"]);

  const code = normalizeMemberCode(rawCode);
  if (!code) return { ok: false, reason: "empty" };

  const member = await findMemberByCode(code);
  if (!member) return { ok: false, reason: "notFound" };

  return { ok: true, code: member.code };
}

export type PurchaseState = {
  error?: "invalidAmount" | "memberNotFound" | "unavailable";
  newKey?: boolean;
};

export async function registerPurchaseAction(
  _previousState: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  await requireActionUser(["cashier"]);

  const result = await registerPurchase({
    memberId: Number(formData.get("memberId")),
    amountCents: parseAmountToCents(String(formData.get("amount") ?? "")),
    concept: String(formData.get("concept") ?? "").trim(),
    useCashback: formData.get("useCashback") === "on",
    idempotencyKey: String(formData.get("idempotencyKey") ?? ""),
  });

  if (!result.ok) {
    if (result.reason === "conflict") return { error: "unavailable", newKey: true };
    if (result.reason === "unavailable") return { error: "unavailable" };
    return { error: result.reason, newKey: true };
  }

  revalidatePath("/", "layout");
  redirect(`/caja/comprobante/${result.receiptId}?toast=purchaseRegistered`);
}
