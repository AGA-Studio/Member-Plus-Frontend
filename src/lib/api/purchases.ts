import type { MemberStatus, Page, Purchase, Receipt, Tier } from "@/lib/domain";
import { backendCall, backendGet, toPage, type BackendPage } from "./backend";

type BackendReceipt = {
  id: number;
  created_at: string;
  card_status: MemberStatus;
  customer: { id: number; full_name: string; code: string };
  level: { id: number; name: string; finish: Tier };
  concept: string | null;
  amount_cents: number;
  discount_percent: number;
  discount_cents: number;
  cashback_used_cents: number;
  total_cents: number;
  points_earned: number;
  cashback_earned_cents: number;
  points_balance_after: number;
  cashback_balance_after_cents: number;
};

type BackendMovement = {
  id: number;
  created_at: string;
  customer: { id: number; full_name: string; code: string };
  cashier_name: string;
  card_status: MemberStatus;
  concept: string | null;
  amount_cents: number;
  discount_percent: number;
  discount_cents: number;
  cashback_used_cents: number;
  total_cents: number;
  points_delta: number;
  cashback_earned_cents: number;
};

type BackendMovementPage = BackendPage<BackendMovement> & {
  summary: {
    count: number;
    collected_cents: number;
    discount_cents: number;
    cashback_used_cents: number;
  };
};

function toReceipt(receipt: BackendReceipt): Receipt {
  return {
    id: String(receipt.id),
    memberCode: receipt.customer.code,
    memberName: receipt.customer.full_name,
    concept: receipt.concept ?? "",
    tier: receipt.level.finish,
    tierName: receipt.level.name,
    createdAt: receipt.created_at,
    cashierName: "",
    cardStatus: receipt.card_status,
    discountPercent: receipt.discount_percent,
    pointsAfter: receipt.points_balance_after,
    cashbackBalanceAfterCents: receipt.cashback_balance_after_cents,
    breakdown: {
      amountCents: receipt.amount_cents,
      discountCents: receipt.discount_cents,
      cashbackAppliedCents: receipt.cashback_used_cents,
      totalCents: receipt.total_cents,
      pointsEarned: receipt.points_earned,
      cashbackEarnedCents: receipt.cashback_earned_cents,
    },
  };
}

function toPurchase(movement: BackendMovement): Purchase {
  return {
    id: String(movement.id),
    memberCode: movement.customer.code,
    memberName: movement.customer.full_name,
    concept: movement.concept ?? "",
    createdAt: movement.created_at,
    cashierName: movement.cashier_name,
    cardStatus: movement.card_status,
    discountPercent: movement.discount_percent,
    breakdown: {
      amountCents: movement.amount_cents,
      discountCents: movement.discount_cents,
      cashbackAppliedCents: movement.cashback_used_cents,
      totalCents: movement.total_cents,
      pointsEarned: movement.points_delta,
      cashbackEarnedCents: movement.cashback_earned_cents,
    },
  };
}

type RegisterPurchaseInput = {
  memberId: number;
  amountCents: number;
  concept: string;
  useCashback: boolean;
  idempotencyKey: string;
};

export type RegisterPurchaseResult =
  | { ok: true; receiptId: string }
  | { ok: false; reason: "memberNotFound" | "invalidAmount" | "conflict" | "unavailable" };

export async function registerPurchase({
  memberId,
  amountCents,
  concept,
  useCashback,
  idempotencyKey,
}: RegisterPurchaseInput): Promise<RegisterPurchaseResult> {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { ok: false, reason: "invalidAmount" };
  }

  const result = await backendCall<BackendReceipt>("POST", "/checkout/create", {
    body: {
      customer_id: memberId,
      amount_cents: amountCents,
      concept: concept || null,
      use_cashback: useCashback,
    },
    headers: { "Idempotency-Key": idempotencyKey },
  });
  if (result.ok) return { ok: true, receiptId: String(result.data.id) };

  if (result.code === "customer_not_found") return { ok: false, reason: "memberNotFound" };
  if (result.code === "amount_invalid") return { ok: false, reason: "invalidAmount" };
  if (result.code === "idempotency_conflict") return { ok: false, reason: "conflict" };

  return { ok: false, reason: "unavailable" };
}

export async function findReceipt(receiptId: string): Promise<Receipt | null> {
  if (!/^\d+$/.test(receiptId)) return null;

  const result = await backendCall<BackendReceipt>("GET", `/checkout/${receiptId}`);
  if (result.ok) return toReceipt(result.data);
  if (result.status === 404) return null;

  throw new Error(`Receipt lookup failed with status ${result.status}`);
}

export async function listPurchasesByMember(memberId: number, page: number): Promise<Page<Purchase>> {
  const result = await backendGet<BackendMovementPage>("/movement/list", {
    customer_id: memberId,
    page,
    page_size: 6,
  });

  return toPage(result, toPurchase);
}

export type MovementPeriod = "7d" | "30d" | "90d" | "all";

export const movementPeriods: readonly MovementPeriod[] = ["7d", "30d", "90d", "all"];
export const defaultMovementPeriod: MovementPeriod = "30d";

const periodDays: Record<Exclude<MovementPeriod, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };
const dayInMilliseconds = 24 * 60 * 60 * 1000;

function periodStart(period: MovementPeriod): string | undefined {
  if (period === "all") return undefined;

  return new Date(Date.now() - periodDays[period] * dayInMilliseconds).toISOString();
}

export type MovementFilters = {
  query?: string;
  period?: MovementPeriod;
  page: number;
};

export type MovementSummary = {
  count: number;
  collectedCents: number;
  discountCents: number;
  cashbackUsedCents: number;
};

export async function listMovements({ query, period = defaultMovementPeriod, page }: MovementFilters): Promise<{
  page: Page<Purchase>;
  summary: MovementSummary;
}> {
  const result = await backendGet<BackendMovementPage>("/movement/list", {
    q: query,
    from: periodStart(period),
    page,
  });

  return {
    page: toPage(result, toPurchase),
    summary: {
      count: result.summary.count,
      collectedCents: result.summary.collected_cents,
      discountCents: result.summary.discount_cents,
      cashbackUsedCents: result.summary.cashback_used_cents,
    },
  };
}

export async function exportMovementsCsv({ query, period = defaultMovementPeriod }: Omit<MovementFilters, "page">): Promise<string> {
  const result = await backendCall<string>("GET", "/movement/export", {
    query: { q: query, from: periodStart(period) },
  });
  if (!result.ok) throw new Error(`Movement export failed with status ${result.status}`);

  return result.data;
}
