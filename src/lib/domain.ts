export type Tier = "bronze" | "silver" | "gold" | "onyx";

export type MemberStatus = "active" | "expired" | "cancelled";

export type TierBenefits = {
  discountPercent: number;
  pointsPerTenPesos: number;
  cashbackPercent: number;
};

export type Level = {
  id: number;
  name: string;
  tier: Tier;
  priceCents: number;
  customersCount: number;
  benefits: TierBenefits;
};

export type Member = {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  tier: Tier;
  tierId: number;
  tierName: string;
  status: MemberStatus;
  expiringSoon: boolean;
  issuedAt: string;
  validUntil: string;
  points: number;
  cashbackBalanceCents: number;
  lastPurchaseAt: string | null;
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
  concept: string;
  createdAt: string;
  cashierName: string;
  cardStatus: MemberStatus;
  breakdown: PurchaseBreakdown;
  discountPercent: number;
};

export type Receipt = Purchase & {
  tier: Tier;
  tierName: string;
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
  businessLogoUrl: string | null;
  fullName: string;
  code: string;
  tier: Tier;
  tierName: string;
  status: MemberStatus;
  validUntil: string;
  googleWalletEnabled: boolean;
};

export type PaymentMethod = "cash" | "card" | "transfer";

export const paymentMethods: readonly PaymentMethod[] = ["cash", "card", "transfer"];

export type MembershipPayment = {
  id: number;
  createdAt: string;
  kind: "new" | "renewal";
  method: PaymentMethod;
  amountCents: number;
  levelName: string;
  periodStart: string;
  periodEnd: string;
  recordedByName: string;
};

export type BusinessStatus = "trial" | "active" | "suspended";

export const businessStatuses: readonly BusinessStatus[] = ["trial", "active", "suspended"];

export type PlatformBusiness = {
  id: number;
  name: string;
  status: BusinessStatus;
  customersCount: number;
  createdAt: string;
};
