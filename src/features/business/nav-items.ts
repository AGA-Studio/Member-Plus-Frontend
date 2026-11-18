import { ArrowLeftRight, CreditCard, Layers, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

export type BusinessNavItem = {
  href: string;
  key: "dashboard" | "customers" | "memberships" | "levels" | "movements";
  icon: LucideIcon;
};

export const businessNavItems: BusinessNavItem[] = [
  { href: "/panel", key: "dashboard", icon: LayoutDashboard },
  { href: "/clientes", key: "customers", icon: Users },
  { href: "/membresias", key: "memberships", icon: CreditCard },
  { href: "/niveles", key: "levels", icon: Layers },
  { href: "/movimientos", key: "movements", icon: ArrowLeftRight },
];
