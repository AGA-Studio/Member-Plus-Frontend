import { ArrowLeftRight, Layers, LayoutDashboard, Settings, UserCog, Users, type LucideIcon } from "lucide-react";

export type NavSection = "general" | "operation" | "management";

export type BusinessNavItem = {
  href: string;
  key: "dashboard" | "customers" | "levels" | "movements" | "users" | "settings";
  icon: LucideIcon;
  section: NavSection;
  onBottomBar: boolean;
};

export const navSections: readonly NavSection[] = ["general", "operation", "management"];

export const businessNavItems: BusinessNavItem[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard, section: "general", onBottomBar: true },
  { href: "/clientes", key: "customers", icon: Users, section: "operation", onBottomBar: true },
  { href: "/movimientos", key: "movements", icon: ArrowLeftRight, section: "operation", onBottomBar: true },
  { href: "/niveles", key: "levels", icon: Layers, section: "management", onBottomBar: true },
  { href: "/usuarios", key: "users", icon: UserCog, section: "management", onBottomBar: false },
  { href: "/configuracion", key: "settings", icon: Settings, section: "management", onBottomBar: false },
];
