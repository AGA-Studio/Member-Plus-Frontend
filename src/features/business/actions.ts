"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCardLink, sendCardEmail } from "@/lib/api/card-delivery";
import { updateLevel } from "@/lib/api/levels";
import { cancelMember, createMember, updateMember, type CustomerWriteFailure } from "@/lib/api/members";
import { exportMovementsCsv, type MovementPeriod } from "@/lib/api/purchases";
import { parseAmountToCents } from "@/lib/format";
import { requireUser } from "@/lib/session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function readNumber(formData: FormData, name: string): number {
  const raw = readText(formData, name).replace(/,/g, "");
  return raw === "" ? Number.NaN : Number(raw);
}

function readLevelId(formData: FormData): number {
  const levelId = Number(readText(formData, "levelId"));
  return Number.isInteger(levelId) && levelId > 0 ? levelId : Number.NaN;
}

type CustomerFieldErrors = {
  fullName?: "fullNameRequired";
  email?: "emailInvalid" | "emailTaken";
  phone?: "phoneInvalid";
  form?: "unavailable";
};

function toFieldErrors(reason: CustomerWriteFailure | "notFound"): CustomerFieldErrors {
  switch (reason) {
    case "emailTaken":
      return { email: "emailTaken" };
    case "emailInvalid":
      return { email: "emailInvalid" };
    case "fullNameInvalid":
      return { fullName: "fullNameRequired" };
    case "phoneInvalid":
      return { phone: "phoneInvalid" };
    default:
      return { form: "unavailable" };
  }
}

export type NewMembershipState = {
  values: { fullName: string; email: string; phone: string; levelId: string };
  errors: CustomerFieldErrors;
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
    levelId: readText(formData, "levelId"),
  };
  const levelId = readLevelId(formData);
  const errors: CustomerFieldErrors = {};

  if (!values.fullName) errors.fullName = "fullNameRequired";
  if (!emailPattern.test(values.email)) errors.email = "emailInvalid";
  if (Number.isNaN(levelId)) errors.form = "unavailable";
  if (errors.fullName || errors.email || errors.form) return { values, errors };

  const result = await createMember({ ...values, levelId });
  if (!result.ok) return { values, errors: toFieldErrors(result.reason) };

  revalidatePath("/", "layout");
  const customerPath = `/clientes/${encodeURIComponent(result.code)}`;

  if (formData.get("sendCardEmail") !== "on") redirect(`${customerPath}?toast=membershipCreated`);

  const delivery = await sendCardEmail(result.code);
  redirect(
    `${customerPath}?toast=${delivery.ok ? "membershipCreatedSent" : "membershipCreatedEmailFailed"}`,
  );
}

export type SendCardEmailState = { ok: boolean };

export async function sendCardEmailAction(code: string): Promise<SendCardEmailState> {
  await requireUser(["admin"]);

  const result = await sendCardEmail(code);

  return { ok: result.ok };
}

export type CardLinkState = { ok: true; url: string } | { ok: false };

export async function createCardLinkAction(code: string): Promise<CardLinkState> {
  await requireUser(["admin"]);

  const result = await createCardLink(code);

  return result.ok ? { ok: true, url: result.url } : { ok: false };
}

export type EditCustomerState = {
  status: "idle" | "saved";
  values: { fullName: string; email: string; phone: string; levelId: string };
  errors: CustomerFieldErrors;
};

export async function updateCustomerAction(
  id: number,
  _previousState: EditCustomerState,
  formData: FormData,
): Promise<EditCustomerState> {
  await requireUser(["admin"]);

  const values = {
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
    levelId: readText(formData, "levelId"),
  };
  const levelId = readLevelId(formData);
  const errors: CustomerFieldErrors = {};

  if (!values.fullName) errors.fullName = "fullNameRequired";
  if (!emailPattern.test(values.email)) errors.email = "emailInvalid";
  if (errors.fullName || errors.email) return { status: "idle", values, errors };

  const result = await updateMember(id, {
    ...values,
    levelId: Number.isNaN(levelId) ? undefined : levelId,
  });
  if (!result.ok) return { status: "idle", values, errors: toFieldErrors(result.reason) };

  revalidatePath("/", "layout");
  return { status: "saved", values, errors: {} };
}

export async function cancelMembershipAction(id: number): Promise<void> {
  await requireUser(["admin"]);

  await cancelMember(id);
  revalidatePath("/", "layout");
}

export type EditLevelState = {
  status: "idle" | "saved";
  values: { price: string; discount: string; pointsPerTen: string; cashback: string };
  errors: {
    price?: "priceInvalid";
    discount?: "discountInvalid";
    pointsPerTen?: "pointsPerTenInvalid";
    cashback?: "cashbackInvalid";
    form?: "unavailable";
  };
};

function isPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function isCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export async function updateLevelAction(
  id: number,
  _previousState: EditLevelState,
  formData: FormData,
): Promise<EditLevelState> {
  await requireUser(["admin"]);

  const values = {
    price: readText(formData, "price"),
    discount: readText(formData, "discount"),
    pointsPerTen: readText(formData, "pointsPerTen"),
    cashback: readText(formData, "cashback"),
  };
  const priceCents = /^\d{1,7}(\.\d{1,2})?$/.test(values.price.replace(/,/g, ""))
    ? parseAmountToCents(values.price)
    : Number.NaN;
  const discount = readNumber(formData, "discount");
  const pointsPerTen = readNumber(formData, "pointsPerTen");
  const cashback = readNumber(formData, "cashback");
  const errors: EditLevelState["errors"] = {};

  if (!Number.isInteger(priceCents) || priceCents < 0) errors.price = "priceInvalid";
  if (!isPercent(discount)) errors.discount = "discountInvalid";
  if (!isCount(pointsPerTen)) errors.pointsPerTen = "pointsPerTenInvalid";
  if (!isPercent(cashback)) errors.cashback = "cashbackInvalid";
  if (Object.keys(errors).length > 0) return { status: "idle", values, errors };

  const result = await updateLevel({
    id,
    priceCents,
    benefits: { discountPercent: discount, pointsPerTenPesos: pointsPerTen, cashbackPercent: cashback },
  });
  if (!result.ok) {
    return { status: "idle", values, errors: result.reason === "invalid" ? { discount: "discountInvalid" } : { form: "unavailable" } };
  }

  revalidatePath("/", "layout");
  return { status: "saved", values, errors: {} };
}

export async function exportMovementsAction(filters: {
  query?: string;
  period: MovementPeriod;
}): Promise<string> {
  await requireUser(["admin"]);

  return exportMovementsCsv(filters);
}
