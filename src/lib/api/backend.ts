import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Page } from "@/lib/domain";
import { sessionCookieName } from "@/lib/session-cookie";

const defaultBackendUrl = "http://127.0.0.1:8000";
const apiPrefix = "/api/v1";

export function backendUrl(path: string): string {
  const base = process.env.API_INTERNAL_URL ?? defaultBackendUrl;

  return `${base}${path}`;
}

type QueryValue = string | number | boolean | null | undefined;

export type BackendQuery = Record<string, QueryValue>;

export type BackendResult<T> =
  | { ok: true; status: number; data: T; headers: Headers }
  | { ok: false; status: number; code: string | null; detail: unknown };

type BackendOptions = {
  query?: BackendQuery;
  body?: unknown;
  headers?: Record<string, string>;
};

function buildPath(path: string, query?: BackendQuery): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(name, String(value));
  }
  const queryString = params.toString();

  return `${apiPrefix}${path}${queryString ? `?${queryString}` : ""}`;
}

export async function backendCall<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  { query, body, headers }: BackendOptions = {},
): Promise<BackendResult<T>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(sessionCookieName)?.value;

  let response: Response;
  try {
    response = await fetch(backendUrl(buildPath(path, query)), {
      method,
      cache: "no-store",
      headers: {
        ...(accessToken ? { Cookie: `${sessionCookieName}=${accessToken}` } : {}),
        ...(body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, code: null, detail: null };
  }

  if (response.status === 401) redirect("/login?toast=sessionExpired");

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const failure = (payload ?? {}) as { code?: string; detail?: unknown };
    const code = typeof failure.code === "string" ? failure.code : null;

    if (response.status === 403 && (code === "business_suspended" || code === "user_inactive")) {
      redirect("/login?toast=noAccess");
    }

    return { ok: false, status: response.status, code, detail: failure.detail ?? null };
  }

  return { ok: true, status: response.status, data: payload as T, headers: response.headers };
}

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
  ) {
    super(`Backend request failed with status ${status}${code ? ` (${code})` : ""}`);
  }
}

export async function backendGet<T>(path: string, query?: BackendQuery): Promise<T> {
  const result = await backendCall<T>("GET", path, { query });
  if (!result.ok) throw new BackendError(result.status, result.code);

  return result.data;
}

export type BackendPage<T> = { items: T[]; total: number; page: number; page_size: number };

export function toPage<Source, Target>(
  source: BackendPage<Source>,
  convert: (item: Source) => Target,
): Page<Target> {
  return {
    items: source.items.map(convert),
    total: source.total,
    page: source.page,
    pageCount: Math.max(1, Math.ceil(source.total / source.page_size)),
    pageSize: source.page_size,
  };
}

export function fieldFromValidationError(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;
  const location = (detail[0] as { loc?: unknown[] } | undefined)?.loc;
  const field = location?.[location.length - 1];

  return typeof field === "string" ? field : null;
}
