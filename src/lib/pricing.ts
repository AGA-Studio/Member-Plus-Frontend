import type { PurchaseBreakdown, TierBenefits } from "./domain";

type PricingInput = {
  amountCents: number;
  benefits: TierBenefits;
  useCashback: boolean;
  cashbackBalanceCents: number;
};

const centsPerTenPesos = 1000;
const hundredthsPerPercent = 100;
const hundredthsOfPercentPerWhole = 10_000;

function percentOf(amountCents: number, percent: number): number {
  const hundredths = Math.round(percent * hundredthsPerPercent);

  return Math.floor((amountCents * hundredths + hundredthsOfPercentPerWhole / 2) / hundredthsOfPercentPerWhole);
}

export function calculatePurchase({
  amountCents,
  benefits,
  useCashback,
  cashbackBalanceCents,
}: PricingInput): PurchaseBreakdown {
  const safeAmount = Math.max(0, Math.round(amountCents));
  const discountCents = percentOf(safeAmount, benefits.discountPercent);
  const discountedCents = safeAmount - discountCents;
  const cashbackAppliedCents = useCashback
    ? Math.min(Math.max(0, cashbackBalanceCents), discountedCents)
    : 0;
  const totalCents = discountedCents - cashbackAppliedCents;
  const pointsEarned =
    Math.floor(discountedCents / centsPerTenPesos) * benefits.pointsPerTenPesos;
  const cashbackEarnedCents = percentOf(discountedCents, benefits.cashbackPercent);

  return {
    amountCents: safeAmount,
    discountCents,
    cashbackAppliedCents,
    totalCents,
    pointsEarned,
    cashbackEarnedCents,
  };
}
