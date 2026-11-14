import type { MembershipPayment, Member, MemberStatus, Page, PaymentMethod, Tier } from "@/lib/domain";
import {
  backendCall,
  backendGet,
  fieldFromValidationError,
  toPage,
  type BackendPage,
} from "./backend";

export type BackendCustomer = {
  id: number;
  code: string;
  full_name: string;
  email: string;
  phone: string | null;
  level: { id: number; name: string; finish: Tier };
  status: MemberStatus;
  expiring_soon: boolean;
  issued_at: string;
  valid_until: string;
  points_balance: number;
  cashback_balance_cents: number;
  benefits: { discount_percent: number; points_per_ten: number; cashback_percent: number };
  last_purchase_at: string | null;
};

export function toMember(customer: BackendCustomer): Member {
  return {
    id: customer.id,
    code: customer.code,
    fullName: customer.full_name,
    email: customer.email,
    phone: customer.phone ?? "",
    tier: customer.level.finish,
    tierId: customer.level.id,
    tierName: customer.level.name,
    status: customer.status,
    expiringSoon: customer.expiring_soon,
    issuedAt: customer.issued_at,
    validUntil: customer.valid_until,
    points: customer.points_balance,
    cashbackBalanceCents: customer.cashback_balance_cents,
    lastPurchaseAt: customer.last_purchase_at,
    benefits: {
      discountPercent: customer.benefits.discount_percent,
      pointsPerTenPesos: customer.benefits.points_per_ten,
      cashbackPercent: customer.benefits.cashback_percent,
    },
  };
}

export function normalizeMemberCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export async function findMemberByCode(rawCode: string): Promise<Member | null> {
  const code = normalizeMemberCode(rawCode);
  if (!code) return null;

  const result = await backendCall<BackendCustomer>("GET", "/customer/lookup", { query: { code } });
  if (result.ok) return toMember(result.data);
  if (result.status === 404) return null;

  throw new Error(`Customer lookup failed with status ${result.status}`);
}

export type MemberFilters = {
  query?: string;
  levelId?: number;
  status?: MemberStatus | "expiring";
  page: number;
};

export async function listMembers({ query, levelId, status, page }: MemberFilters): Promise<Page<Member>> {
  const result = await backendGet<BackendPage<BackendCustomer>>("/customer/list", {
    q: query,
    level_id: levelId,
    status,
    page,
  });

  return toPage(result, toMember);
}

export async function countMembers(): Promise<{
  all: number;
  active: number;
  expiring: number;
  expired: number;
  cancelled: number;
}> {
  return backendGet("/customer/summary");
}

export async function listActiveMembers(): Promise<Member[]> {
  const result = await backendGet<BackendPage<BackendCustomer>>("/customer/list", {
    status: "active",
    page_size: 500,
  });

  return result.items.map(toMember);
}

type CustomerFields = {
  fullName: string;
  email: string;
  phone: string;
};

export type CustomerWriteFailure = "emailTaken" | "fullNameInvalid" | "emailInvalid" | "phoneInvalid" | "levelInvalid" | "unavailable";

function toWriteFailure(status: number, code: string | null, detail: unknown): CustomerWriteFailure {
  if (code === "email_taken") return "emailTaken";
  if (code === "tier_invalid") return "levelInvalid";
  if (status === 422) {
    const field = fieldFromValidationError(detail);
    if (field === "full_name") return "fullNameInvalid";
    if (field === "email") return "emailInvalid";
    if (field === "phone") return "phoneInvalid";
  }

  return "unavailable";
}

export type CardEmailStatus = "sent" | "failed" | "pending" | "skipped";

export type CreateMemberResult =
  | { ok: true; id: number; code: string; cardEmail: CardEmailStatus }
  | { ok: false; reason: CustomerWriteFailure };

type CreateMemberInput = CustomerFields & {
  levelId: number;
  sendCardEmail: boolean;
  paymentMethod: PaymentMethod;
  amountCents: number;
};

export async function createMember(input: CreateMemberInput): Promise<CreateMemberResult> {
  const result = await backendCall<BackendCustomer & { card_email: { status: CardEmailStatus } }>(
    "POST",
    "/customer/create",
    {
      body: {
        full_name: input.fullName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim() || null,
        level_id: input.levelId,
        send_card_email: input.sendCardEmail,
        payment_method: input.paymentMethod,
        amount_cents: input.amountCents,
      },
    },
  );
  if (!result.ok) return { ok: false, reason: toWriteFailure(result.status, result.code, result.detail) };

  return { ok: true, id: result.data.id, code: result.data.code, cardEmail: result.data.card_email.status };
}

type RenewMemberInput = {
  levelId: number;
  paymentMethod: PaymentMethod;
  amountCents: number;
};

export type RenewMemberResult = { ok: true } | { ok: false; reason: "cancelled" | "levelInvalid" | "unavailable" };

export async function renewMember(id: number, input: RenewMemberInput): Promise<RenewMemberResult> {
  const result = await backendCall<BackendCustomer>("POST", `/customer/${id}/renew`, {
    body: {
      level_id: input.levelId,
      payment_method: input.paymentMethod,
      amount_cents: input.amountCents,
    },
  });
  if (result.ok) return { ok: true };
  if (result.code === "customer_cancelled") return { ok: false, reason: "cancelled" };
  if (result.code === "tier_invalid") return { ok: false, reason: "levelInvalid" };

  return { ok: false, reason: "unavailable" };
}

type BackendPayment = {
  id: number;
  created_at: string;
  kind: "new" | "renewal";
  method: PaymentMethod;
  amount_cents: number;
  level: { id: number; name: string };
  period_start: string;
  period_end: string;
  recorded_by_name: string;
};

export async function listPayments(id: number, page: number): Promise<Page<MembershipPayment>> {
  const result = await backendGet<BackendPage<BackendPayment>>(`/customer/${id}/payment/list`, {
    page,
    page_size: 6,
  });

  return toPage(result, (payment) => ({
    id: payment.id,
    createdAt: payment.created_at,
    kind: payment.kind,
    method: payment.method,
    amountCents: payment.amount_cents,
    levelName: payment.level.name,
    periodStart: payment.period_start,
    periodEnd: payment.period_end,
    recordedByName: payment.recorded_by_name,
  }));
}

export type UpdateMemberResult = { ok: true } | { ok: false; reason: CustomerWriteFailure | "notFound" };

export async function updateMember(
  id: number,
  input: CustomerFields & { levelId?: number },
): Promise<UpdateMemberResult> {
  const result = await backendCall<BackendCustomer>("PATCH", `/customer/${id}/update`, {
    body: {
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim() || null,
      ...(input.levelId !== undefined ? { level_id: input.levelId } : {}),
    },
  });
  if (result.ok) return { ok: true };
  if (result.status === 404) return { ok: false, reason: "notFound" };

  return { ok: false, reason: toWriteFailure(result.status, result.code, result.detail) };
}

export async function cancelMember(id: number): Promise<boolean> {
  const result = await backendCall<BackendCustomer>("POST", `/customer/${id}/cancel`);

  return result.ok;
}
