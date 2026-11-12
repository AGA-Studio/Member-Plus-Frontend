import { randomUUID } from "node:crypto";
import type { Page, Purchase, Receipt, TierBenefits } from "@/lib/domain";
import { calculatePurchase } from "@/lib/pricing";
import { findMemberByCode } from "./members";
import { simulateLatency } from "./mock/latency";
import { mockStore } from "./mock/store";
import { matchesQuery, paginate } from "./paginate";

const noBenefits: TierBenefits = {
  discountPercent: 0,
  pointsPerTenPesos: 0,
  cashbackPercent: 0,
};

const defaultRegisterName = "Caja principal";

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
  await simulateLatency(250);
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

  const pointsAfter = member.points + breakdown.pointsEarned;
  const cashbackBalanceAfterCents =
    member.cashbackBalanceCents - breakdown.cashbackAppliedCents + breakdown.cashbackEarnedCents;

  const stored = mockStore().members.find((item) => item.code === member.code);
  if (stored) {
    stored.points = pointsAfter;
    stored.cashbackBalanceCents = cashbackBalanceAfterCents;
  }

  const purchase: Purchase = {
    id: randomUUID(),
    memberCode: member.code,
    memberName: member.fullName,
    tier: member.tier,
    concept,
    createdAt: new Date().toISOString(),
    registerName: defaultRegisterName,
    breakdown,
    discountPercent: benefits.discountPercent,
    pointsAfter,
    cashbackBalanceAfterCents,
  };

  mockStore().purchases.unshift(purchase);
  return { ok: true, receiptId: purchase.id };
}

export async function findReceipt(receiptId: string): Promise<Receipt | null> {
  await simulateLatency();
  const purchase = mockStore().purchases.find((item) => item.id === receiptId);
  if (!purchase || purchase.pointsAfter === undefined || purchase.cashbackBalanceAfterCents === undefined) {
    return null;
  }

  return {
    ...purchase,
    pointsAfter: purchase.pointsAfter,
    cashbackBalanceAfterCents: purchase.cashbackBalanceAfterCents,
  };
}

export async function listPurchasesByMember(memberCode: string, page: number): Promise<Page<Purchase>> {
  await simulateLatency();
  const purchases = mockStore().purchases
    .filter((purchase) => purchase.memberCode === memberCode)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return paginate(purchases, page, 6);
}

export type MovementFilters = {
  query?: string;
  register?: string;
  page: number;
};

export type MovementSummary = {
  count: number;
  collectedCents: number;
  discountCents: number;
  cashbackUsedCents: number;
};

export async function listMovements({ query, register, page }: MovementFilters): Promise<{
  page: Page<Purchase>;
  summary: MovementSummary;
}> {
  await simulateLatency();
  const filtered = mockStore().purchases
    .filter((purchase) => matchesQuery(query, purchase.memberName, purchase.memberCode))
    .filter((purchase) => !register || purchase.registerName === register)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const summary = filtered.reduce<MovementSummary>(
    (total, purchase) => ({
      count: total.count + 1,
      collectedCents: total.collectedCents + purchase.breakdown.totalCents,
      discountCents: total.discountCents + purchase.breakdown.discountCents,
      cashbackUsedCents: total.cashbackUsedCents + purchase.breakdown.cashbackAppliedCents,
    }),
    { count: 0, collectedCents: 0, discountCents: 0, cashbackUsedCents: 0 },
  );

  return { page: paginate(filtered, page), summary };
}

export async function listRegisterNames(): Promise<string[]> {
  return [...new Set(mockStore().purchases.map((purchase) => purchase.registerName))].sort();
}

export async function getLastPurchaseDates(): Promise<Record<string, string>> {
  const latest: Record<string, string> = {};
  for (const purchase of mockStore().purchases) {
    const current = latest[purchase.memberCode];
    if (!current || purchase.createdAt > current) latest[purchase.memberCode] = purchase.createdAt;
  }
  return latest;
}
