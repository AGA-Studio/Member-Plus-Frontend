import { backendUrl } from "./backend";
import { fallbackBusinessName, mockBusinessNames } from "./mock/businesses";
import type { SessionUser, UserRole } from "@/lib/domain";
import { sessionCookieName } from "@/lib/session-cookie";

type BackendRole = "platform" | "admin" | "employee";

type BackendUser = {
  id: number;
  business_id: number | null;
  name: string;
  email: string;
  role: BackendRole;
  is_active: boolean;
};

const roleMap: Record<BackendRole, UserRole> = {
  platform: "platform",
  admin: "admin",
  employee: "cashier",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type SessionLookup =
  | { status: "ok"; user: SessionUser }
  | { status: "unauthorized" }
  | { status: "unavailable" };

export async function fetchSessionUser(accessToken: string): Promise<SessionLookup> {
  let response: Response;

  try {
    response = await fetch(backendUrl("/api/v1/auth/me"), {
      headers: { Cookie: `${sessionCookieName}=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 401 || response.status === 403) return { status: "unauthorized" };
  if (!response.ok) return { status: "unavailable" };

  const user = (await response.json()) as BackendUser;
  const businessName =
    user.business_id === null
      ? fallbackBusinessName
      : (mockBusinessNames[user.business_id] ?? fallbackBusinessName);

  return {
    status: "ok",
    user: {
      role: roleMap[user.role],
      fullName: user.name,
      email: user.email,
      businessId: user.business_id,
      businessName,
      businessInitials: getInitials(businessName),
    },
  };
}
