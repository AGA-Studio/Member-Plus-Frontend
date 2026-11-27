"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCardLink, sendCardEmail } from "@/lib/api/card-delivery";
import { listLevels, updateLevel } from "@/lib/api/levels";
import { removeLogo, uploadLogo } from "@/lib/api/logo";
import { cancelMember, createMember, renewMember, updateMember } from "@/lib/api/members";
import { removeMemberPhoto, uploadMemberPhoto } from "@/lib/api/member-photo";
import { toFieldErrors, type CustomerFieldErrors } from "@/lib/customer-errors";
import { exportMovementsCsv, type MovementExport, type MovementPeriod } from "@/lib/api/purchases";
import { paymentMethods, type PaymentMethod } from "@/lib/domain";
import { parseAmountToCents } from "@/lib/format";
import { requireActionUser } from "@/lib/session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function readNumber(formData: FormData, name: string): number {
  const raw = readText(formData, name).replace(/,/g, "");
  return raw === "" ? Number.NaN : Number(raw);
}

function isPaymentMethod(value: string): value is PaymentMethod {
  return paymentMethods.some((method) => method === value);
}

async function findLevelPrice(levelId: number): Promise<number | null> {
  if (Number.isNaN(levelId)) return null;

  const levels = await listLevels();

  return levels.find((level) => level.id === levelId)?.priceCents ?? null;
}

function readLevelId(formData: FormData): number {
  const levelId = Number(readText(formData, "levelId"));
  return Number.isInteger(levelId) && levelId > 0 ? levelId : Number.NaN;
}

export type NewMembershipState = {
  values: { fullName: string; email: string; phone: string; levelId: string; paymentMethod: string; amount: string };
  errors: Omit<CustomerFieldErrors, "form"> & { form?: "unavailable" | "limitReached" };
};

export async function createMembershipAction(
  _previousState: NewMembershipState,
  formData: FormData,
): Promise<NewMembershipState> {
  await requireActionUser(["admin"]);

  const values = {
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
    levelId: readText(formData, "levelId"),
    paymentMethod: readText(formData, "paymentMethod"),
    amount: readText(formData, "amount"),
  };
  const levelId = readLevelId(formData);
  const levelPrice = await findLevelPrice(levelId);
  const errors: NewMembershipState["errors"] = {};

  if (!values.fullName) errors.fullName = "fullNameRequired";
  if (!emailPattern.test(values.email)) errors.email = "emailInvalid";
  if (levelPrice === null || !isPaymentMethod(values.paymentMethod)) errors.form = "unavailable";
  if (errors.fullName || errors.email || errors.form || levelPrice === null || !isPaymentMethod(values.paymentMethod)) {
    return { values, errors };
  }

  const result = await createMember({
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    levelId,
    sendCardEmail: formData.get("sendCardEmail") === "on",
    paymentMethod: values.paymentMethod,
    amountCents: levelPrice,
  });
  if (!result.ok) {
    return {
      values,
      errors: result.reason === "limitReached" ? { form: "limitReached" } : toFieldErrors(result.reason),
    };
  }

  const photo = formData.get("photo");
  const photoResult = photo instanceof File && photo.size > 0 ? await uploadMemberPhoto(result.id, photo) : null;

  revalidatePath("/", "layout");
  const toastByEmailStatus = {
    sent: "membershipCreatedSent",
    pending: "membershipCreatedPending",
    failed: "membershipCreatedEmailFailed",
    skipped: "membershipCreated",
  } as const;

  const photoFailureToast =
    photoResult && !photoResult.ok
      ? photoResult.reason === "planRequired"
        ? "membershipCreatedPhotoPlan"
        : "membershipCreatedPhotoFailed"
      : null;
  const toast = photoFailureToast ?? toastByEmailStatus[result.cardEmail];

  redirect(`/clientes/${encodeURIComponent(result.code)}?toast=${toast}`);
}

export type SendCardEmailState = { ok: true } | { ok: false; reason: "rateLimited" | "failed" };

export async function sendCardEmailAction(id: number): Promise<SendCardEmailState> {
  await requireActionUser(["admin"]);

  const result = await sendCardEmail(id);
  if (result.ok) return { ok: true };

  return { ok: false, reason: result.reason === "rateLimited" ? "rateLimited" : "failed" };
}

export type CardLinkState = { ok: true; url: string } | { ok: false };

export async function createCardLinkAction(id: number): Promise<CardLinkState> {
  await requireActionUser(["admin"]);

  const result = await createCardLink(id);

  return result.ok ? { ok: true, url: result.url } : { ok: false };
}

export type RenewMembershipState = {
  status: "idle" | "renewed";
  values: { levelId: string; paymentMethod: string; amount: string };
  errors: { amount?: "amountInvalid"; form?: "unavailable" | "cancelled" };
};

export async function renewMembershipAction(
  id: number,
  _previousState: RenewMembershipState,
  formData: FormData,
): Promise<RenewMembershipState> {
  await requireActionUser(["admin"]);

  const values = {
    levelId: readText(formData, "levelId"),
    paymentMethod: readText(formData, "paymentMethod"),
    amount: readText(formData, "amount"),
  };
  const levelId = readLevelId(formData);
  const levelPrice = await findLevelPrice(levelId);

  if (levelPrice === null || !isPaymentMethod(values.paymentMethod)) {
    return { status: "idle", values, errors: { form: "unavailable" } };
  }

  const result = await renewMember(id, { levelId, paymentMethod: values.paymentMethod, amountCents: levelPrice });
  if (!result.ok) {
    return { status: "idle", values, errors: { form: result.reason === "cancelled" ? "cancelled" : "unavailable" } };
  }

  revalidatePath("/", "layout");
  return { status: "renewed", values, errors: {} };
}

export type EditCustomerState = {
  status: "idle" | "saved";
  values: { fullName: string; email: string; phone: string; levelId: string };
  errors: Omit<CustomerFieldErrors, "form"> & {
    form?: "unavailable" | "photoFailed" | "photoCancelled" | "photoPlan";
  };
};

export async function updateCustomerAction(
  id: number,
  _previousState: EditCustomerState,
  formData: FormData,
): Promise<EditCustomerState> {
  await requireActionUser(["admin"]);

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

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const uploaded = await uploadMemberPhoto(id, photo);
    if (!uploaded.ok) {
      revalidatePath("/", "layout");
      const form =
        uploaded.reason === "cancelled"
          ? "photoCancelled"
          : uploaded.reason === "planRequired"
            ? "photoPlan"
            : "photoFailed";

      return { status: "idle", values, errors: { form } };
    }
  }

  revalidatePath("/", "layout");
  return { status: "saved", values, errors: {} };
}

export async function removeCustomerPhotoAction(id: number): Promise<boolean> {
  await requireActionUser(["admin"]);

  const removed = await removeMemberPhoto(id);
  if (removed) revalidatePath("/", "layout");

  return removed;
}

export async function cancelMembershipAction(id: number): Promise<boolean> {
  await requireActionUser(["admin"]);

  const cancelled = await cancelMember(id);
  if (cancelled) revalidatePath("/", "layout");

  return cancelled;
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
  await requireActionUser(["admin"]);

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
}): Promise<MovementExport> {
  await requireActionUser(["admin"]);

  return exportMovementsCsv(filters);
}

export type LogoState = {
  status: "idle" | "saved";
  error?: "noFile" | "tooLarge" | "invalid" | "storageUnavailable" | "planRequired" | "unavailable";
};

export async function uploadLogoAction(_previousState: LogoState, formData: FormData): Promise<LogoState> {
  await requireActionUser(["admin"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "idle", error: "noFile" };

  const result = await uploadLogo(file);
  if (!result.ok) return { status: "idle", error: result.reason };

  revalidatePath("/", "layout");
  return { status: "saved" };
}

export async function removeLogoAction(): Promise<boolean> {
  await requireActionUser(["admin"]);

  const removed = await removeLogo();
  if (removed) revalidatePath("/", "layout");

  return removed;
}
