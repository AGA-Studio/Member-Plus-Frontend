import { describe, expect, it } from "vitest";
import { navItemsFor } from "../features/business/nav-items";
import { counterRoles, managementRoles, roleHomePaths, userRoleOf } from "./roles";

describe("userRoleOf", () => {
  it.each([
    ["platform", "platform"],
    ["admin", "admin"],
    ["manager", "manager"],
    ["employee", "cashier"],
  ] as const)("reads the %s role of the API as %s", (backendRole, role) => {
    expect(userRoleOf[backendRole]).toBe(role);
  });
});

describe("manager access", () => {
  it("covers the counter and the customers, starting at the customers", () => {
    expect(counterRoles).toContain("manager");
    expect(managementRoles).toContain("manager");
    expect(roleHomePaths.manager).toBe("/clientes");
  });

  it("shows customers, movements and checkout, and no settings screens", () => {
    expect(navItemsFor("manager").map((item) => item.href)).toEqual(["/clientes", "/movimientos", "/caja"]);
  });

  it("keeps the counter out of the administrator navigation", () => {
    expect(navItemsFor("admin").map((item) => item.href)).toEqual([
      "/panel",
      "/clientes",
      "/movimientos",
      "/niveles",
      "/usuarios",
      "/plan",
      "/configuracion",
    ]);
  });
});
