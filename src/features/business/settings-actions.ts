"use server";

import { revalidatePath } from "next/cache";
import { updateBusinessSettings } from "@/lib/api/business";
import { requireActionUser } from "@/lib/session";
import { normalizeHexColor } from "@/lib/tenant-theme";

export type BusinessSettingsState = {
  status: "idle" | "saved";
  values: { name: string; validityMonths: string; primaryColor: string };
  errors: {
    name?: "nameInvalid";
    validityMonths?: "validityInvalid";
    primaryColor?: "colorInvalid";
    form?: "unavailable";
  };
};

const nameMinLength = 2;
const nameMaxLength = 120;
const validityMinMonths = 1;
const validityMaxMonths = 60;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateBusinessSettingsAction(
  _previousState: BusinessSettingsState,
  formData: FormData,
): Promise<BusinessSettingsState> {
  await requireActionUser(["admin"]);

  const values = {
    name: readText(formData, "name"),
    validityMonths: readText(formData, "validityMonths"),
    primaryColor: readText(formData, "primaryColor"),
  };
  const name = values.name.split(/\s+/).filter(Boolean).join(" ");
  const validityMonths = /^\d+$/.test(values.validityMonths.trim()) ? Number(values.validityMonths.trim()) : Number.NaN;
  const color = values.primaryColor.trim() === "" ? null : normalizeHexColor(values.primaryColor);
  const errors: BusinessSettingsState["errors"] = {};

  if (name.length < nameMinLength || name.length > nameMaxLength) errors.name = "nameInvalid";
  if (!(validityMonths >= validityMinMonths && validityMonths <= validityMaxMonths)) {
    errors.validityMonths = "validityInvalid";
  }
  if (values.primaryColor.trim() !== "" && color === null) errors.primaryColor = "colorInvalid";
  if (errors.name || errors.validityMonths || errors.primaryColor) return { status: "idle", values, errors };

  const result = await updateBusinessSettings({ name, validityMonths, primaryColor: color });
  if (!result.ok) {
    const failure: BusinessSettingsState["errors"] =
      result.reason === "nameInvalid"
        ? { name: "nameInvalid" }
        : result.reason === "validityInvalid"
          ? { validityMonths: "validityInvalid" }
          : result.reason === "colorInvalid"
            ? { primaryColor: "colorInvalid" }
            : { form: "unavailable" };

    return { status: "idle", values, errors: failure };
  }

  revalidatePath("/", "layout");
  return { status: "saved", values: { ...values, name, validityMonths: String(validityMonths) }, errors: {} };
}
