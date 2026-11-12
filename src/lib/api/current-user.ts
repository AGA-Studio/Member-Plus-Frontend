import type { CashierUser } from "@/lib/domain";

export async function getCashierUser(): Promise<CashierUser> {
  return {
    fullName: "Ana Torres",
    businessName: "Café Aurora",
    businessInitials: "CA",
  };
}
