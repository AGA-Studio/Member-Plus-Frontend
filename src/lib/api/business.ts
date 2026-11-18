import { backendCall, fieldFromValidationError } from "./backend";

export type BusinessSettingsInput = {
  name: string;
  validityMonths: number;
  primaryColor: string | null;
};

export type BusinessSettingsResult =
  | { ok: true }
  | { ok: false; reason: "nameInvalid" | "validityInvalid" | "colorInvalid" | "unavailable" };

export async function updateBusinessSettings(input: BusinessSettingsInput): Promise<BusinessSettingsResult> {
  const result = await backendCall<unknown>("PATCH", "/business/update", {
    body: {
      name: input.name,
      validity_months: input.validityMonths,
      primary_color: input.primaryColor,
    },
  });
  if (result.ok) return { ok: true };

  if (result.status === 422) {
    const field = fieldFromValidationError(result.detail);
    if (field === "name") return { ok: false, reason: "nameInvalid" };
    if (field === "validity_months") return { ok: false, reason: "validityInvalid" };
    if (field === "primary_color") return { ok: false, reason: "colorInvalid" };
  }

  return { ok: false, reason: "unavailable" };
}
