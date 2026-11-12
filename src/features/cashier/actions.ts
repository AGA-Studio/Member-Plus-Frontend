"use server";

import { redirect } from "next/navigation";
import { findMemberByCode, normalizeMemberCode } from "@/lib/api/members";
import { registerPurchase } from "@/lib/api/purchases";
import { parseAmountToCents } from "@/lib/format";
import { destroySession, requireSession } from "@/lib/session";

export type LookupResult = { ok: false; reason: "empty" | "notFound" };

export async function lookupCardAction(rawCode: string): Promise<LookupResult> {
  await requireSession();

  const code = normalizeMemberCode(rawCode);
  if (!code) return { ok: false, reason: "empty" };

  const member = await findMemberByCode(code);
  if (!member) return { ok: false, reason: "notFound" };

  redirect(`/caja/${encodeURIComponent(member.code)}`);
}

export type PurchaseState = {
  error?: "invalidAmount" | "memberNotFound" | "unavailable";
};

export async function registerPurchaseAction(
  _previousState: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  await requireSession();

  const result = await registerPurchase({
    memberCode: String(formData.get("memberCode") ?? ""),
    amountCents: parseAmountToCents(String(formData.get("amount") ?? "")),
    concept: String(formData.get("concept") ?? "").trim(),
    useCashback: formData.get("useCashback") === "on",
  });

  if (!result.ok) return { error: result.reason };

  redirect(`/caja/comprobante/${result.receiptId}`);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
