import { ArrowLeftRight, Layers, LayoutDashboard, Settings, UserCog, Users, type LucideIcon } from "lucide-react";

export type BusinessNavItem = {
  href: string;
  key: "dashboard" | "customers" | "levels" | "movements" | "users" | "settings";
  icon: LucideIcon;
  onBottomBar: boolean;
};

export const businessNavItems: BusinessNavItem[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard, onBottomBar: true },
  { href: "/clientes", key: "customers", icon: Users, onBottomBar: true },
  { href: "/niveles", key: "levels", icon: Layers, onBottomBar: true },
  { href: "/movimientos", key: "movements", icon: ArrowLeftRight, onBottomBar: true },
  { href: "/usuarios", key: "users", icon: UserCog, onBottomBar: false },
  { href: "/configuracion", key: "settings", icon: Settings, onBottomBar: false },
];
