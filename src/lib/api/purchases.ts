import { randomUUID } from "node:crypto";
import type { Receipt, TierBenefits } from "@/lib/domain";
import { calculatePurchase } from "@/lib/pricing";
import { findMemberByCode } from "./members";

const noBenefits: TierBenefits = {
  discountPercent: 0,
  pointsPerTenPesos: 0,
  cashbackPercent: 0,
};

const globalStore = globalThis as typeof globalThis & {
  mockReceipts?: Map<string, Receipt>;
};

const receiptsById = (globalStore.mockReceipts ??= new Map<string, Receipt>());

type RegisterPurchaseInput = {
  memberCode: string;
  amountCents: number;
  concept: string;
  useCashback: boolean;
};

export type RegisterPurchaseResult =
  | { ok: true; receiptId: string }
  | { ok: false; reason: "memberNotFound" | "invalidAmount" | "unavailable" };

export async function registerPurchase({
  memberCode,
  amountCents,
  concept,
  useCashback,
}: RegisterPurchaseInput): Promise<RegisterPurchaseResult> {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { ok: false, reason: "invalidAmount" };
  }

  const member = await findMemberByCode(memberCode);
  if (!member) return { ok: false, reason: "memberNotFound" };

  const isActive = member.status === "active";
  const benefits = isActive ? member.benefits : noBenefits;

  const breakdown = calculatePurchase({
    amountCents,
    benefits,
    useCashback: isActive && useCashback,
    cashbackBalanceCents: member.cashbackBalanceCents,
  });

  const receipt: Receipt = {
    id: randomUUID(),
    memberCode: member.code,
    memberName: member.fullName,
    tier: member.tier,
    concept,
    createdAt: new Date().toISOString(),
    breakdown,
    discountPercent: benefits.discountPercent,
    pointsAfter: member.points + breakdown.pointsEarned,
    cashbackBalanceAfterCents:
      member.cashbackBalanceCents -
      breakdown.cashbackAppliedCents +
      breakdown.cashbackEarnedCents,
  };

  receiptsById.set(receipt.id, receipt);
  return { ok: true, receiptId: receipt.id };
}

export async function findReceipt(receiptId: string): Promise<Receipt | null> {
  return receiptsById.get(receiptId) ?? null;
}
