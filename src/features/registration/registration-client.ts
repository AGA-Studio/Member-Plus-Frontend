import {
  collapseSpaces,
  normalizeEmail,
  toRegistrationFailure,
  type RegistrationFailure,
  type RegistrationValues,
} from "@/lib/registration";

export type RegistrationOutcome = { ok: true; email: string } | { ok: false; failure: RegistrationFailure };

export async function registerBusiness(
  values: RegistrationValues,
  planId: number,
  turnstileToken: string | null,
): Promise<RegistrationOutcome> {
  const email = normalizeEmail(values.email);
  let response: Response;

  try {
    response = await fetch("/api/v1/registration/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
      },
      body: JSON.stringify({
        business_name: collapseSpaces(values.businessName),
        admin_name: collapseSpaces(values.adminName),
        email,
        password: values.password,
        plan_id: planId,
      }),
    });
  } catch {
    return { ok: false, failure: { kind: "unavailable" } };
  }

  if (response.status === 201) return { ok: true, email };

  const body = (await response.json().catch(() => null)) as { code?: unknown; detail?: unknown } | null;

  return {
    ok: false,
    failure: toRegistrationFailure(response.status, body ?? {}, response.headers.get("Retry-After")),
  };
}
