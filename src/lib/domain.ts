export type Tier = "bronze" | "silver" | "gold" | "onyx";

export const tiers: readonly Tier[] = ["bronze", "silver", "gold", "onyx"];

export type MemberStatus = "active" | "expired" | "cancelled";

export type TierBenefits = {
  discountPercent: number;
  pointsPerTenPesos: number;
  cashbackPercent: number;
};

export type Level = {
  tier: Tier;
  minPoints: number;
  benefits: TierBenefits;
};

export type Member = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  tier: Tier;
  status: MemberStatus;
  expiringSoon: boolean;
  issuedAt: string;
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

export type Purchase = {
  id: string;
  memberCode: string;
  memberName: string;
  tier: Tier;
  concept: string;
  createdAt: string;
  registerName: string;
  breakdown: PurchaseBreakdown;
  discountPercent: number;
  pointsAfter?: number;
  cashbackBalanceAfterCents?: number;
};

export type Receipt = Purchase & {
  pointsAfter: number;
  cashbackBalanceAfterCents: number;
};

export type UserRole = "cashier" | "admin" | "platform";

export type SessionUser = {
  role: UserRole;
  fullName: string;
  email: string;
  businessId: number | null;
  businessName: string;
  businessInitials: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type PublicCard = {
  businessName: string;
  fullName: string;
  code: string;
  tier: Tier;
  status: MemberStatus;
  validUntil: string;
  googleWalletEnabled: boolean;
};
