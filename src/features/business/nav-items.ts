import { ArrowLeftRight, CreditCard, Layers, Users, type LucideIcon } from "lucide-react";

export type BusinessNavItem = {
  href: string;
  key: "customers" | "memberships" | "levels" | "movements";
  icon: LucideIcon;
};

export const businessNavItems: BusinessNavItem[] = [
  { href: "/clientes", key: "customers", icon: Users },
  { href: "/membresias", key: "memberships", icon: CreditCard },
  { href: "/niveles", key: "levels", icon: Layers },
  { href: "/movimientos", key: "movements", icon: ArrowLeftRight },
];
