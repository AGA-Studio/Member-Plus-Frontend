export type Plan = {
  id: number;
  key: string;
  name: string;
  priceCents: number;
  maxCustomers: number | null;
  maxUsers: number | null;
  historyDays: number | null;
  imagesEnabled: boolean;
  exportsEnabled: boolean;
  trialDays: number;
  isDefault: boolean;
};

export type RegistrationValues = {
  businessName: string;
  adminName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptsPrivacy: boolean;
};

export type RegistrationErrors = {
  businessName?: "businessNameRequired" | "businessNameInvalid";
  adminName?: "adminNameRequired" | "adminNameInvalid";
  email?: "emailRequired" | "emailInvalid" | "emailTaken";
  password?: "passwordRequired" | "passwordInvalid";
  passwordConfirmation?: "passwordConfirmationRequired" | "passwordMismatch";
  acceptsPrivacy?: "privacyRequired";
};

export type RegistrationFailure =
  | { kind: "fields"; errors: RegistrationErrors }
  | { kind: "closed" }
  | { kind: "rateLimited"; minutes: number }
  | { kind: "turnstileFailed" }
  | { kind: "planInvalid" }
  | { kind: "unavailable" };

export const registrationFieldOrder = [
  "businessName",
  "adminName",
  "email",
  "password",
  "passwordConfirmation",
  "acceptsPrivacy",
] as const;

export const passwordMinLength = 8;
const passwordMaxLength = 128;
const nameMinLength = 2;
const nameMaxLength = 120;
const rateLimitFallbackMinutes = 60;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const personNamePattern = /^[\p{L} \-'’]+$/u;
const letterPattern = /\p{L}/gu;

export function canSignUpFor(plan: Pick<Plan, "priceCents" | "trialDays">): boolean {
  return plan.priceCents === 0 || plan.trialDays > 0;
}

export function collapseSpaces(value: string): string {
  return value.normalize("NFC").trim().split(/\s+/).join(" ");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function lengthOf(value: string): number {
  return [...value].length;
}

function businessNameError(value: string): RegistrationErrors["businessName"] {
  const name = collapseSpaces(value);
  if (!name) return "businessNameRequired";

  const length = lengthOf(name);
  return length < nameMinLength || length > nameMaxLength ? "businessNameInvalid" : undefined;
}

function adminNameError(value: string): RegistrationErrors["adminName"] {
  const name = collapseSpaces(value);
  if (!name) return "adminNameRequired";

  const letters = name.match(letterPattern)?.length ?? 0;
  const valid = personNamePattern.test(name) && letters >= nameMinLength && lengthOf(name) <= nameMaxLength;
  return valid ? undefined : "adminNameInvalid";
}

function emailError(value: string): RegistrationErrors["email"] {
  const email = normalizeEmail(value);
  if (!email) return "emailRequired";

  return emailPattern.test(email) ? undefined : "emailInvalid";
}

function passwordError(value: string): RegistrationErrors["password"] {
  if (!value) return "passwordRequired";

  const length = lengthOf(value);
  return length < passwordMinLength || length > passwordMaxLength ? "passwordInvalid" : undefined;
}

function confirmationError(password: string, confirmation: string): RegistrationErrors["passwordConfirmation"] {
  if (!confirmation) return "passwordConfirmationRequired";

  return confirmation === password ? undefined : "passwordMismatch";
}

export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {
    businessName: businessNameError(values.businessName),
    adminName: adminNameError(values.adminName),
    email: emailError(values.email),
    password: passwordError(values.password),
    passwordConfirmation: confirmationError(values.password, values.passwordConfirmation),
    acceptsPrivacy: values.acceptsPrivacy ? undefined : "privacyRequired",
  };

  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error !== undefined));
}

const serverFieldErrors: Record<string, RegistrationErrors> = {
  business_name: { businessName: "businessNameInvalid" },
  admin_name: { adminName: "adminNameInvalid" },
  email: { email: "emailInvalid" },
  password: { password: "passwordInvalid" },
};

function fieldErrorsFromDetail(detail: unknown): RegistrationErrors {
  if (!Array.isArray(detail)) return {};

  return detail.reduce<RegistrationErrors>((errors, item: { loc?: unknown } | null) => {
    const field = Array.isArray(item?.loc) ? String(item.loc.at(-1)) : "";

    return Object.hasOwn(serverFieldErrors, field) ? { ...errors, ...serverFieldErrors[field] } : errors;
  }, {});
}

export function toRegistrationFailure(
  status: number,
  body: { code?: unknown; detail?: unknown },
  retryAfter: string | null,
): RegistrationFailure {
  if (body.code === "email_taken") return { kind: "fields", errors: { email: "emailTaken" } };
  if (body.code === "registration_closed") return { kind: "closed" };
  if (body.code === "plan_invalid") return { kind: "planInvalid" };
  if (body.code === "turnstile_failed") return { kind: "turnstileFailed" };

  if (status === 429) {
    const seconds = Number(retryAfter);
    const minutes = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : rateLimitFallbackMinutes;

    return { kind: "rateLimited", minutes };
  }

  if (status === 422) {
    const errors = fieldErrorsFromDetail(body.detail);
    if (Object.keys(errors).length > 0) return { kind: "fields", errors };
  }

  return { kind: "unavailable" };
}
