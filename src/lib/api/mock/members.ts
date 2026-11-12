import type { Member, TierBenefits } from "@/lib/domain";

export const tierBenefits = {
  bronze: { discountPercent: 5, pointsPerTenPesos: 1, cashbackPercent: 0 },
  silver: { discountPercent: 10, pointsPerTenPesos: 1, cashbackPercent: 1 },
  gold: { discountPercent: 15, pointsPerTenPesos: 1, cashbackPercent: 3 },
  onyx: { discountPercent: 20, pointsPerTenPesos: 2, cashbackPercent: 5 },
} satisfies Record<string, TierBenefits>;

export const mockMembers: Member[] = [
  {
    code: "MP-4F7K2",
    fullName: "Laura Méndez",
    tier: "gold",
    status: "active",
    validUntil: "2027-05-12",
    points: 1250,
    cashbackBalanceCents: 12000,
    benefits: tierBenefits.gold,
  },
  {
    code: "MP-8Q2LM",
    fullName: "Carlos Ibarra",
    tier: "silver",
    status: "active",
    validUntil: "2027-04-03",
    points: 640,
    cashbackBalanceCents: 0,
    benefits: tierBenefits.silver,
  },
  {
    code: "MP-3H9TX",
    fullName: "Daniela Ruiz",
    tier: "bronze",
    status: "active",
    validUntil: "2026-11-16",
    points: 120,
    cashbackBalanceCents: 0,
    benefits: tierBenefits.bronze,
  },
  {
    code: "MP-5X1QE",
    fullName: "Paola Castillo",
    tier: "bronze",
    status: "cancelled",
    validUntil: "2026-09-03",
    points: 60,
    cashbackBalanceCents: 0,
    benefits: tierBenefits.bronze,
  },
];
