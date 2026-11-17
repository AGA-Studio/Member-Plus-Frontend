import { describe, expect, it } from "vitest";

import type { TierBenefits } from "@/lib/domain";
import { calculatePurchase } from "@/lib/pricing";

const gold: TierBenefits = { discountPercent: 15, pointsPerTenPesos: 1, cashbackPercent: 3 };

type Overrides = {
  benefits: TierBenefits;
  useCashback: boolean;
  cashbackBalanceCents: number;
};

function calculate(amountCents: number, overrides: Partial<Overrides> = {}) {
  return calculatePurchase({
    amountCents,
    benefits: overrides.benefits ?? gold,
    useCashback: overrides.useCashback ?? false,
    cashbackBalanceCents: overrides.cashbackBalanceCents ?? 0,
  });
}

describe("calculatePurchase", () => {
  it("reproduce el ejemplo de la rúbrica: 1000 pesos en nivel oro", () => {
    const breakdown = calculate(100_000);

    expect(breakdown.discountCents).toBe(15_000);
    expect(breakdown.totalCents).toBe(85_000);
    expect(breakdown.pointsEarned).toBe(85);
    expect(breakdown.cashbackEarnedCents).toBe(2_550);
    expect(breakdown.cashbackAppliedCents).toBe(0);
  });

  it("gana puntos y cashback sobre la base, antes de restar el cashback usado", () => {
    const breakdown = calculate(10_000, { useCashback: true, cashbackBalanceCents: 2_550 });

    expect(breakdown.cashbackAppliedCents).toBe(2_550);
    expect(breakdown.totalCents).toBe(5_950);
    expect(breakdown.pointsEarned).toBe(8);
    expect(breakdown.cashbackEarnedCents).toBe(255);
  });

  it("nunca aplica más cashback que la base a pagar", () => {
    const breakdown = calculate(1_000, { useCashback: true, cashbackBalanceCents: 25_500 });

    expect(breakdown.cashbackAppliedCents).toBe(850);
    expect(breakdown.totalCents).toBe(0);
  });

  it("ignora el saldo cuando no se pide usar cashback", () => {
    expect(calculate(1_000, { cashbackBalanceCents: 500 }).cashbackAppliedCents).toBe(0);
  });

  it("no gasta nada con saldo negativo, igual que el backend", () => {
    const breakdown = calculate(1_000, { useCashback: true, cashbackBalanceCents: -5 });

    expect(breakdown.cashbackAppliedCents).toBe(0);
    expect(breakdown.totalCents).toBe(850);
  });

  it("redondea los puntos hacia abajo por cada diez pesos", () => {
    const breakdown = calculate(99_999, {
      benefits: { discountPercent: 0, pointsPerTenPesos: 2, cashbackPercent: 0 },
    });

    expect(breakdown.pointsEarned).toBe(198);
  });

  it.each([
    [850, 3, 26],
    [50, 1, 1],
    [49, 1, 0],
    [333, 33.33, 111],
  ])("redondea el descuento a la mitad hacia arriba: %i centavos al %f%%", (amount, percent, expected) => {
    const breakdown = calculate(amount, {
      benefits: { discountPercent: percent, pointsPerTenPesos: 0, cashbackPercent: 0 },
    });

    expect(breakdown.discountCents).toBe(expected);
  });

  it("cobra el monto completo con un nivel sin beneficios", () => {
    const breakdown = calculate(12_345, {
      benefits: { discountPercent: 0, pointsPerTenPesos: 0, cashbackPercent: 0 },
    });

    expect(breakdown.totalCents).toBe(12_345);
    expect(breakdown.pointsEarned).toBe(0);
    expect(breakdown.cashbackEarnedCents).toBe(0);
  });

  it("trata un monto negativo como cero", () => {
    const breakdown = calculate(-500);

    expect(breakdown.amountCents).toBe(0);
    expect(breakdown.totalCents).toBe(0);
    expect(breakdown.pointsEarned).toBe(0);
  });

  it.each([
    [1_000.4, 1_000],
    [1_000.6, 1_001],
  ])("redondea el monto a centavos enteros: %f", (amount, expected) => {
    expect(calculate(amount).amountCents).toBe(expected);
  });
});
