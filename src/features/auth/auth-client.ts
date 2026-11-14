export type LoginRole = "cashier" | "admin";

export type LoginFailure =
  | { kind: "invalidCredentials" }
  | { kind: "suspended" }
  | { kind: "inactive" }
  | { kind: "locked"; minutes: number }
  | { kind: "platformUnavailable" }
  | { kind: "unavailable" };

export type LoginOutcome = { ok: true; role: LoginRole } | ({ ok: false } & LoginFailure);

type BackendMe = { role: "platform" | "admin" | "employee" };

const lockedFallbackMinutes = 15;

export async function loginWithBackend(email: string, password: string): Promise<LoginOutcome> {
  let response: Response;

  try {
    response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, kind: "unavailable" };
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

  if (me.role === "platform") {
    await logoutFromBackend();
    return { ok: false, kind: "platformUnavailable" };
  }

  return { ok: true, role: me.role === "admin" ? "admin" : "cashier" };
}

export async function logoutFromBackend(): Promise<void> {
  await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
}
