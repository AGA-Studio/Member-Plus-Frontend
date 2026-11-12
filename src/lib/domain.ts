export type Tier = "bronze" | "silver" | "gold" | "onyx";

export type MemberStatus = "active" | "expired" | "cancelled";

export type TierBenefits = {
  discountPercent: number;
  pointsPerTenPesos: number;
  cashbackPercent: number;
};

export type Member = {
  code: string;
  fullName: string;
  tier: Tier;
  status: MemberStatus;
  validUntil: string;
  points: number;
  cashbackBalanceCents: number;
  benefits: TierBenefits;
};

export type PurchaseBreakdown = {
  amountCents: number;
  discountCents: number;
  cashbackAppliedCents: number;
  totalCents: number;
  pointsEarned: number;
  cashbackEarnedCents: number;
};

export type Receipt = {
  id: string;
  memberCode: string;
  memberName: string;
  tier: Tier;
  concept: string;
  createdAt: string;
  breakdown: PurchaseBreakdown;
  discountPercent: number;
  pointsAfter: number;
  cashbackBalanceAfterCents: number;
};

export type CashierUser = {
  fullName: string;
  businessName: string;
  businessInitials: string;
};
