import type { UserRole } from "@/lib/domain";
import { userRoleOf, type BackendRole } from "@/lib/roles";

export type LoginRole = UserRole;

export type LoginFailure =
  | { kind: "invalidCredentials" }
  | { kind: "suspended" }
  | { kind: "inactive" }
  | { kind: "locked"; minutes: number }
  | { kind: "turnstileFailed" }
  | { kind: "unavailable" };

export type LoginOutcome = { ok: true; role: LoginRole } | ({ ok: false } & LoginFailure);

type BackendMe = { role: BackendRole };

const lockedFallbackMinutes = 15;

export async function loginWithBackend(
  email: string,
  password: string,
  turnstileToken?: string | null,
): Promise<LoginOutcome> {
  let response: Response;

  try {
    response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
      },
      body: new URLSearchParams({ username: email, password }),
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, kind: "unavailable" };
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => ({}))) as { code?: string };
    return { ok: false, kind: body.code === "turnstile_failed" ? "turnstileFailed" : "unavailable" };
  }

  if (response.status === 401) return { ok: false, kind: "invalidCredentials" };

  if (response.status === 429) {
    const seconds = Number(response.headers.get("Retry-After"));
    const minutes = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : lockedFallbackMinutes;
    return { ok: false, kind: "locked", minutes };
  }

  if (response.status === 403) {
    const body = (await response.json().catch(() => ({}))) as { code?: string };
    return { ok: false, kind: body.code === "business_suspended" ? "suspended" : "inactive" };
  }

  if (!response.ok) return { ok: false, kind: "unavailable" };

  const meResponse = await fetch("/api/v1/auth/me", { credentials: "same-origin" }).catch(() => null);
  if (!meResponse?.ok) return { ok: false, kind: "unavailable" };

  const me = (await meResponse.json()) as BackendMe;

  return { ok: true, role: userRoleOf[me.role] };
}

export async function logoutFromBackend(): Promise<void> {
  await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
}
