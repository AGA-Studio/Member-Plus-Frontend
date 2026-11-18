import { ArrowLeftRight, CreditCard, Layers, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";

export type BusinessNavItem = {
  href: string;
  key: "dashboard" | "customers" | "memberships" | "levels" | "movements" | "settings";
  icon: LucideIcon;
  onBottomBar: boolean;
};

export const businessNavItems: BusinessNavItem[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard, onBottomBar: true },
  { href: "/clientes", key: "customers", icon: Users, onBottomBar: true },
  { href: "/membresias", key: "memberships", icon: CreditCard, onBottomBar: true },
  { href: "/niveles", key: "levels", icon: Layers, onBottomBar: true },
  { href: "/movimientos", key: "movements", icon: ArrowLeftRight, onBottomBar: true },
  { href: "/configuracion", key: "settings", icon: Settings, onBottomBar: false },
];
