import { describe, expect, it } from "vitest";
import {
  canSignUpFor,
  collapseSpaces,
  normalizeEmail,
  toRegistrationFailure,
  validateRegistration,
  type RegistrationValues,
} from "./registration";

const validValues: RegistrationValues = {
  businessName: "Café Aurora",
  adminName: "María-José O'Connor",
  email: "laura@cafe-aurora.mx",
  password: "12345678",
  passwordConfirmation: "12345678",
  acceptsPrivacy: true,
};

describe("canSignUpFor", () => {
  it("offers free plans and plans with a trial", () => {
    expect(canSignUpFor({ priceCents: 0, trialDays: 0 })).toBe(true);
    expect(canSignUpFor({ priceCents: 39_900, trialDays: 30 })).toBe(true);
  });

  it("leaves out paid plans without a trial", () => {
    expect(canSignUpFor({ priceCents: 19_900, trialDays: 0 })).toBe(false);
  });
});

describe("normalizers", () => {
  it("collapses spaces and lowercases the email", () => {
    expect(collapseSpaces("  Café   Aurora ")).toBe("Café Aurora");
    expect(normalizeEmail("  Laura@Cafe.MX ")).toBe("laura@cafe.mx");
  });
});

describe("validateRegistration", () => {
  it("accepts valid values", () => {
    expect(validateRegistration(validValues)).toEqual({});
  });

  it("asks for every missing value", () => {
    expect(
      validateRegistration({
        businessName: "  ",
        adminName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        acceptsPrivacy: false,
      }),
    ).toEqual({
      businessName: "businessNameRequired",
      adminName: "adminNameRequired",
      email: "emailRequired",
      password: "passwordRequired",
      passwordConfirmation: "passwordConfirmationRequired",
      acceptsPrivacy: "privacyRequired",
    });
  });

  it("applies the rules of the API", () => {
    expect(
      validateRegistration({
        ...validValues,
        businessName: "A",
        adminName: "Ana2",
        email: "laura@cafe",
        password: "1234567",
        passwordConfirmation: "7654321",
      }),
    ).toEqual({
      businessName: "businessNameInvalid",
      adminName: "adminNameInvalid",
      email: "emailInvalid",
      password: "passwordInvalid",
      passwordConfirmation: "passwordMismatch",
    });
  });

  it("rejects values over the maximum length and names with one letter", () => {
    expect(
      validateRegistration({
        ...validValues,
        businessName: "a".repeat(121),
        adminName: "A -",
        password: "a".repeat(129),
        passwordConfirmation: "a".repeat(129),
      }),
    ).toEqual({
      businessName: "businessNameInvalid",
      adminName: "adminNameInvalid",
      password: "passwordInvalid",
    });
  });
});

describe("toRegistrationFailure", () => {
  it.each([
    [409, "email_taken", { kind: "fields", errors: { email: "emailTaken" } }],
    [403, "registration_closed", { kind: "closed" }],
    [422, "plan_invalid", { kind: "planInvalid" }],
    [400, "turnstile_failed", { kind: "turnstileFailed" }],
  ])("maps %i %s", (status, code, failure) => {
    expect(toRegistrationFailure(status, { code }, null)).toEqual(failure);
  });

  it("reads the wait of the rate limit", () => {
    expect(toRegistrationFailure(429, { code: "rate_limited" }, "125")).toEqual({
      kind: "rateLimited",
      minutes: 3,
    });
    expect(toRegistrationFailure(429, {}, null)).toEqual({ kind: "rateLimited", minutes: 60 });
  });

  it("points validation errors at their fields", () => {
    const detail = [{ loc: ["body", "admin_name"] }, { loc: ["body", "password"] }, { loc: ["body", "toString"] }];

    expect(toRegistrationFailure(422, { detail }, null)).toEqual({
      kind: "fields",
      errors: { adminName: "adminNameInvalid", password: "passwordInvalid" },
    });
  });

  it("falls back to unavailable", () => {
    expect(toRegistrationFailure(500, {}, null)).toEqual({ kind: "unavailable" });
    expect(toRegistrationFailure(422, { detail: "broken" }, null)).toEqual({ kind: "unavailable" });
    expect(toRegistrationFailure(422, { detail: [null] }, null)).toEqual({ kind: "unavailable" });
  });
});
