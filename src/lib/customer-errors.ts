import type { CustomerWriteFailure } from "./api/members";

/**
 * Errores por campo del alta y la edición de una membresía. Las claves son las
 * que se traducen en los diálogos: `t(`errors.${clave}`)`.
 */
export type CustomerFieldErrors = {
  fullName?: "fullNameRequired" | "fullNameInvalid";
  email?: "emailInvalid" | "emailTaken";
  phone?: "phoneInvalid";
  amount?: "amountInvalid";
  form?: "unavailable";
};

/**
 * Traduce el fallo del API al campo que lo muestra.
 *
 * `fullNameInvalid` es la regla del nombre —solo letras, espacios, guiones y
 * apóstrofos, la misma validación `PersonName` del backend— y **no** es lo mismo
 * que el campo vacío: si se mapea a `fullNameRequired`, el diálogo pide escribir
 * un nombre que ya está escrito.
 */
export function toFieldErrors(reason: CustomerWriteFailure | "notFound"): CustomerFieldErrors {
  switch (reason) {
    case "emailTaken":
      return { email: "emailTaken" };
    case "emailInvalid":
      return { email: "emailInvalid" };
    case "fullNameInvalid":
      return { fullName: "fullNameInvalid" };
    case "phoneInvalid":
      return { phone: "phoneInvalid" };
    default:
      return { form: "unavailable" };
  }
}
