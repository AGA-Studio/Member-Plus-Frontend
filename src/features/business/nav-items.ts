import {
  ArrowLeftRight,
  Gauge,
  Layers,
  LayoutDashboard,
  ScanLine,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/domain";

export type NavSection = "general" | "operation" | "management";

export type BusinessNavItem = {
  href: string;
  key: "dashboard" | "customers" | "levels" | "movements" | "checkout" | "users" | "plan" | "settings";
  icon: LucideIcon;
  section: NavSection;
  onBottomBar: boolean;
  roles: UserRole[];
};

export const navSections: readonly NavSection[] = ["general", "operation", "management"];

export const businessNavItems: BusinessNavItem[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard, section: "general", onBottomBar: true, roles: ["admin"] },
  { href: "/clientes", key: "customers", icon: Users, section: "operation", onBottomBar: true, roles: ["admin", "manager"] },
  {
    href: "/movimientos",
    key: "movements",
    icon: ArrowLeftRight,
    section: "operation",
    onBottomBar: true,
    roles: ["admin", "manager"],
  },
  { href: "/caja", key: "checkout", icon: ScanLine, section: "operation", onBottomBar: true, roles: ["manager"] },
  { href: "/niveles", key: "levels", icon: Layers, section: "management", onBottomBar: true, roles: ["admin"] },
  { href: "/usuarios", key: "users", icon: UserCog, section: "management", onBottomBar: false, roles: ["admin"] },
  { href: "/plan", key: "plan", icon: Gauge, section: "management", onBottomBar: false, roles: ["admin"] },
  { href: "/configuracion", key: "settings", icon: Settings, section: "management", onBottomBar: false, roles: ["admin"] },
];

export function navItemsFor(role: UserRole): BusinessNavItem[] {
  return businessNavItems.filter((item) => item.roles.includes(role));
}
