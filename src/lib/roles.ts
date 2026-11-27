import type { UserRole } from "./domain";

export type BackendRole = "platform" | "admin" | "manager" | "employee";

export const userRoleOf: Record<BackendRole, UserRole> = {
  platform: "platform",
  admin: "admin",
  manager: "manager",
  employee: "cashier",
};

export const roleHomePaths: Record<UserRole, string> = {
  cashier: "/caja",
  manager: "/clientes",
  admin: "/panel",
  platform: "/plataforma",
};

export const managementRoles: UserRole[] = ["admin", "manager"];

export const counterRoles: UserRole[] = ["cashier", "manager"];
