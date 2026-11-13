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

export async function fetchSessionUser(accessToken: string): Promise<SessionUser | null> {
  let response: Response;

  try {
    response = await fetch(backendUrl("/api/v1/auth/me"), {
      headers: { Cookie: `${sessionCookieName}=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const user = (await response.json()) as BackendUser;
  const businessName =
    user.business_id === null
      ? fallbackBusinessName
      : (mockBusinessNames[user.business_id] ?? fallbackBusinessName);

  return {
    role: roleMap[user.role],
    fullName: user.name,
    email: user.email,
    businessId: user.business_id,
    businessName,
    businessInitials: getInitials(businessName),
  };
}
