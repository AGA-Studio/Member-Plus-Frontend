import { describe, expect, it } from "vitest";

import { toFieldErrors } from "./customer-errors";

/**
 * El fallo del API se convierte en el error del campo que lo muestra. Cada clave
 * tiene su mensaje en los locales, así que un mapeo equivocado se ve como un
 * aviso que pide algo distinto de lo que pasó: `fullNameInvalid` es la regla del
 * nombre, no el campo vacío.
 */
describe("toFieldErrors", () => {
  it.each([
    { reason: "emailTaken", expected: { email: "emailTaken" } },
    { reason: "emailInvalid", expected: { email: "emailInvalid" } },
    { reason: "fullNameInvalid", expected: { fullName: "fullNameInvalid" } },
    { reason: "phoneInvalid", expected: { phone: "phoneInvalid" } },
    { reason: "levelInvalid", expected: { form: "unavailable" } },
    { reason: "unavailable", expected: { form: "unavailable" } },
    { reason: "notFound", expected: { form: "unavailable" } },
  ] as const)("traduce $reason", ({ reason, expected }) => {
    expect(toFieldErrors(reason)).toEqual(expected);
  });

  it("no confunde el nombre que no cumple la regla con el campo vacío", () => {
    expect(toFieldErrors("fullNameInvalid")).not.toEqual({ fullName: "fullNameRequired" });
  });
});
