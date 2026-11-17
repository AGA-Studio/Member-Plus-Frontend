import { describe, expect, it } from "vitest";
import type { TierBenefits } from "./domain";
import { calculatePurchase } from "./pricing";

const gold: TierBenefits = { discountPercent: 15, pointsPerTenPesos: 1, cashbackPercent: 3 };
const noBenefits: TierBenefits = { discountPercent: 0, pointsPerTenPesos: 0, cashbackPercent: 0 };

function checkout(amountCents: number, benefits: TierBenefits, cashbackBalanceCents = 0, useCashback = false) {
  return calculatePurchase({ amountCents, benefits, useCashback, cashbackBalanceCents });
}

describe("calculatePurchase: same cases as services/pricing_service.py", () => {
  it("rubric example: 1,000 pesos in gold", () => {
    const result = checkout(100_000, gold);

    expect(result.discountCents).toBe(15_000);
    expect(result.totalCents).toBe(85_000);
    expect(result.pointsEarned).toBe(85);
    expect(result.cashbackEarnedCents).toBe(2_550);
    expect(result.cashbackAppliedCents).toBe(0);
  });

  it("earns points and cashback before subtracting the cashback used", () => {
    const result = checkout(10_000, gold, 2_550, true);

    expect(result.totalCents).toBe(5_950);
    expect(result.cashbackAppliedCents).toBe(2_550);
    expect(result.pointsEarned).toBe(8);
    expect(result.cashbackEarnedCents).toBe(255);
  });

  it("never uses more cashback than the discounted amount", () => {
    const result = checkout(1_000, gold, 25_500, true);

    expect(result.cashbackAppliedCents).toBe(850);
    expect(result.totalCents).toBe(0);
  });

  it("ignores the balance when the cashier does not use it", () => {
    expect(checkout(1_000, gold, 500).cashbackAppliedCents).toBe(0);
  });

  it("spends nothing from a negative balance", () => {
    const result = checkout(1_000, gold, -5, true);

    expect(result.cashbackAppliedCents).toBe(0);
    expect(result.totalCents).toBe(850);
  });

  it("rounds points down for each full ten pesos", () => {
    const result = checkout(99_999, { discountPercent: 0, pointsPerTenPesos: 2, cashbackPercent: 0 });

    expect(result.pointsEarned).toBe(198);
  });

  it.each([
    [1_000, 15, 150],
    [850, 3, 26],
    [50, 1, 1],
    [49, 1, 0],
    [333, 33.33, 111],
  ])("rounds half up to the cent: %i cents at %f%% is %i", (amountCents, percent, expected) => {
    const benefits = { discountPercent: percent, pointsPerTenPesos: 0, cashbackPercent: 0 };

    expect(checkout(amountCents, benefits).discountCents).toBe(expected);
  });

  it("charges the full amount when there are no benefits", () => {
    const result = checkout(100_000, noBenefits);

    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(100_000);
    expect(result.pointsEarned).toBe(0);
    expect(result.cashbackEarnedCents).toBe(0);
  });

  it("handles a tier with every benefit at zero", () => {
    const result = checkout(12_345, noBenefits);

    expect(result.totalCents).toBe(12_345);
    expect(result.pointsEarned).toBe(0);
    expect(result.cashbackEarnedCents).toBe(0);
  });
});

describe("calculatePurchase: input safety", () => {
  it("treats a negative amount as zero", () => {
    const result = checkout(-500, gold);

    expect(result.amountCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("rounds a fractional amount to whole cents", () => {
    expect(checkout(1_000.6, noBenefits).amountCents).toBe(1_001);
  });

  it("charges 0 for a free purchase and uses no cashback", () => {
    const result = checkout(0, gold, 5_000, true);

    expect(result.totalCents).toBe(0);
    expect(result.cashbackAppliedCents).toBe(0);
  });

  it("keeps total, discount and cashback applied consistent with the amount", () => {
    const result = checkout(123_457, gold, 4_000, true);

    expect(result.amountCents - result.discountCents - result.cashbackAppliedCents).toBe(result.totalCents);
  });
});

function roundHalfUpIntegerPercent(amountCents: number, hundredthsOfPercent: number): number {
  return Number((BigInt(amountCents) * BigInt(hundredthsOfPercent) + BigInt(5_000)) / BigInt(10_000));
}

describe("calculatePurchase: exact arithmetic against integer math", () => {
  it("matches round-half-up on integer cents for every amount and percent with two decimals", () => {
    let seed = 20_261_117;
    function next(limit: number): number {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed % limit;
    }

    const mismatches: string[] = [];
    for (let attempt = 0; attempt < 200_000 && mismatches.length < 5; attempt += 1) {
      const amountCents = next(2) === 0 ? next(5_000) : next(5_000_000);
      const hundredths = next(10_001);
      const percent = hundredths / 100;
      const result = checkout(amountCents, { discountPercent: percent, pointsPerTenPesos: 1, cashbackPercent: percent });

      const expectedDiscount = roundHalfUpIntegerPercent(amountCents, hundredths);
      const expectedCashback = roundHalfUpIntegerPercent(amountCents - expectedDiscount, hundredths);
      if (result.discountCents !== expectedDiscount || result.cashbackEarnedCents !== expectedCashback) {
        mismatches.push(
          `${amountCents} cents at ${percent}%: discount ${result.discountCents} vs ${expectedDiscount}, cashback ${result.cashbackEarnedCents} vs ${expectedCashback}`,
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("matches on every exact half cent", () => {
    const mismatches: string[] = [];
    for (let hundredths = 1; hundredths <= 10_000; hundredths += 1) {
      for (let amountCents = 1; amountCents <= 400; amountCents += 1) {
        const exactlyHalf = (amountCents * hundredths) % 10_000 === 5_000;
        if (!exactlyHalf) continue;

        const result = checkout(amountCents, { discountPercent: hundredths / 100, pointsPerTenPesos: 0, cashbackPercent: 0 });
        const expected = roundHalfUpIntegerPercent(amountCents, hundredths);
        if (result.discountCents !== expected) {
          mismatches.push(`${amountCents} cents at ${hundredths / 100}%: ${result.discountCents} vs ${expected}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });
});
