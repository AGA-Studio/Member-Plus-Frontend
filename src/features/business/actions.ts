"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateLevel } from "@/lib/api/levels";
import { cancelMember, createMember, updateMember } from "@/lib/api/members";
import { listAllMovements, type MovementPeriod } from "@/lib/api/purchases";
import { tiers, type Tier } from "@/lib/domain";
import { requireUser } from "@/lib/session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function readNumber(formData: FormData, name: string): number {
  const raw = readText(formData, name).replace(/,/g, "");
  return raw === "" ? Number.NaN : Number(raw);
}

function isTier(value: string): value is Tier {
  return tiers.some((tier) => tier === value);
}

export type NewMembershipState = {
  values: { fullName: string; email: string; phone: string; tier: string };
  errors: {
    fullName?: "fullNameRequired";
    email?: "emailInvalid" | "emailTaken";
    form?: "unavailable";
  };
};

export async function createMembershipAction(
  _previousState: NewMembershipState,
  formData: FormData,
): Promise<NewMembershipState> {
  await requireUser(["admin"]);

  const values = {
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
    tier: readText(formData, "tier"),
  };
  const errors: NewMembershipState["errors"] = {};

  if (!values.fullName) errors.fullName = "fullNameRequired";
  if (!emailPattern.test(values.email)) errors.email = "emailInvalid";
  if (!isTier(values.tier)) errors.form = "unavailable";
  if (errors.fullName || errors.email || errors.form || !isTier(values.tier)) {
    return { values, errors };
  }

  const result = await createMember({ ...values, tier: values.tier });
  if (!result.ok) return { values, errors: { email: result.reason } };

  revalidatePath("/", "layout");
  redirect(`/clientes/${encodeURIComponent(result.code)}?toast=membershipCreated`);
}

export type EditCustomerState = {
  status: "idle" | "saved";
  values: { fullName: string; email: string; phone: string };
  errors: {
    fullName?: "fullNameRequired";
    email?: "emailInvalid" | "emailTaken";
    form?: "unavailable";
  };
};

export async function updateCustomerAction(
  code: string,
  _previousState: EditCustomerState,
  formData: FormData,
): Promise<EditCustomerState> {
  await requireUser(["admin"]);

  const values = {
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
  };
  const errors: EditCustomerState["errors"] = {};

  if (!values.fullName) errors.fullName = "fullNameRequired";
  if (!emailPattern.test(values.email)) errors.email = "emailInvalid";
  if (errors.fullName || errors.email) return { status: "idle", values, errors };

  const result = await updateMember({ code, ...values });
  if (!result.ok) {
    return {
      status: "idle",
      values,
      errors: result.reason === "emailTaken" ? { email: "emailTaken" } : { form: "unavailable" },
    };
  }

  revalidatePath("/", "layout");
  return { status: "saved", values, errors: {} };
}

export async function cancelMembershipAction(code: string): Promise<void> {
  await requireUser(["admin"]);

  await cancelMember(code);
  revalidatePath("/", "layout");
}

export type EditLevelState = {
  status: "idle" | "saved";
  values: { minPoints: string; discount: string; pointsPerTen: string; cashback: string };
  errors: {
    minPoints?: "minPointsInvalid";
    discount?: "discountInvalid";
    pointsPerTen?: "pointsPerTenInvalid";
    cashback?: "cashbackInvalid";
  };
};

function isPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function isCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export async function updateLevelAction(
  tier: Tier,
  _previousState: EditLevelState,
  formData: FormData,
): Promise<EditLevelState> {
  await requireUser(["admin"]);

  const values = {
    minPoints: readText(formData, "minPoints"),
    discount: readText(formData, "discount"),
    pointsPerTen: readText(formData, "pointsPerTen"),
    cashback: readText(formData, "cashback"),
  };
  const minPoints = readNumber(formData, "minPoints");
  const discount = readNumber(formData, "discount");
  const pointsPerTen = readNumber(formData, "pointsPerTen");
  const cashback = readNumber(formData, "cashback");
  const errors: EditLevelState["errors"] = {};

  if (!isCount(minPoints)) errors.minPoints = "minPointsInvalid";
  if (!isPercent(discount)) errors.discount = "discountInvalid";
  if (!isCount(pointsPerTen)) errors.pointsPerTen = "pointsPerTenInvalid";
  if (!isPercent(cashback)) errors.cashback = "cashbackInvalid";
  if (Object.keys(errors).length > 0) return { status: "idle", values, errors };

  await updateLevel({
    tier,
    minPoints,
    benefits: { discountPercent: discount, pointsPerTenPesos: pointsPerTen, cashbackPercent: cashback },
  });

  revalidatePath("/", "layout");
  return { status: "saved", values, errors: {} };
}

export type MovementExportRow = {
  createdAt: string;
  registerName: string;
  memberName: string;
  memberCode: string;
  concept: string;
  amount: number;
  discount: number;
  points: number;
  cashbackEarned: number;
  cashbackUsed: number;
};

export async function exportMovementsAction(filters: {
  query?: string;
  register?: string;
  period: MovementPeriod;
}): Promise<MovementExportRow[]> {
  await requireUser(["admin"]);

  const purchases = await listAllMovements(filters);

  return purchases.map((purchase) => ({
    createdAt: purchase.createdAt,
    registerName: purchase.registerName,
    memberName: purchase.memberName,
    memberCode: purchase.memberCode,
    concept: purchase.concept,
    amount: purchase.breakdown.amountCents / 100,
    discount: purchase.breakdown.discountCents / 100,
    points: purchase.breakdown.pointsEarned,
    cashbackEarned: purchase.breakdown.cashbackEarnedCents / 100,
    cashbackUsed: purchase.breakdown.cashbackAppliedCents / 100,
  }));
}
