import type { SessionUser, UserRole } from "@/lib/domain";

type DemoAccount = {
  username: string;
  password: string;
  accessToken: string;
  role: UserRole;
  user: SessionUser;
};

export const demoAccounts: DemoAccount[] = [
  {
    username: "cajero",
    password: "member123",
    accessToken: "demo-cashier-token",
    role: "cashier",
    user: {
      role: "cashier",
      fullName: "Ana Torres",
      businessName: "Café Aurora",
      businessInitials: "CA",
    },
  },
  {
    username: "admin",
    password: "member123",
    accessToken: "demo-admin-token",
    role: "admin",
    user: {
      role: "admin",
      fullName: "María Ríos",
      businessName: "Café Aurora",
      businessInitials: "CA",
    },
  },
];
