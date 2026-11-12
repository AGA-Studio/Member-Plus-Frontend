import type { PurchaseBreakdown, TierBenefits } from "./domain";

type PricingInput = {
  amountCents: number;
  benefits: TierBenefits;
  useCashback: boolean;
  cashbackBalanceCents: number;
};

const centsPerTenPesos = 1000;

export function calculatePurchase({
  amountCents,
  benefits,
  useCashback,
  cashbackBalanceCents,
}: PricingInput): PurchaseBreakdown {
  const safeAmount = Math.max(0, Math.round(amountCents));
  const discountCents = Math.round((safeAmount * benefits.discountPercent) / 100);
  const discountedCents = safeAmount - discountCents;
  const cashbackAppliedCents = useCashback
    ? Math.min(cashbackBalanceCents, discountedCents)
    : 0;
  const totalCents = discountedCents - cashbackAppliedCents;
  const pointsEarned =
    Math.floor(discountedCents / centsPerTenPesos) * benefits.pointsPerTenPesos;
  const cashbackEarnedCents = Math.round(
    (discountedCents * benefits.cashbackPercent) / 100,
  );

  return {
    amountCents: safeAmount,
    discountCents,
    cashbackAppliedCents,
    totalCents,
    pointsEarned,
    cashbackEarnedCents,
  };
}
