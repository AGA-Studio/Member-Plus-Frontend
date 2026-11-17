import { describe, expect, it } from "vitest";

import {
  formatDiscount,
  formatMoney,
  formatPlainPesos,
  formatPoints,
  formatPositiveMoney,
  formatSignedPoints,
  parseAmountToCents,
} from "@/lib/format";

type Formatter = Parameters<typeof formatMoney>[0];

type Call = { value: number; options: unknown };

function recorder() {
  const calls: Call[] = [];
  const formatter = {
    number: (value: number, options?: unknown) => {
      calls.push({ value, options });
      return `<${value}>`;
    },
  } as unknown as Formatter;

  return { calls, formatter };
}

describe("formatMoney", () => {
  it("convierte centavos a pesos con el formato de moneda del negocio", () => {
    const { calls, formatter } = recorder();

    expect(formatMoney(formatter, 123_450)).toBe("<1234.5>");
    expect(calls).toEqual([
      {
        value: 1234.5,
        options: { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" },
      },
    ]);
  });

  it("antepone el signo en descuentos y en montos positivos", () => {
    const { formatter } = recorder();

    expect(formatDiscount(formatter, 15_000)).toBe("−<150>");
    expect(formatPositiveMoney(formatter, 2_550)).toBe("+<25.5>");
  });
});

describe("formatPoints", () => {
  it("deja los puntos como número y con signo cuando corresponde", () => {
    const { formatter } = recorder();

    expect(formatPoints(formatter, 85)).toBe("<85>");
    expect(formatSignedPoints(formatter, 85)).toBe("+<85>");
  });
});

describe("parseAmountToCents", () => {
  it.each([
    ["1234.50", 123_450],
    ["1,234.50", 123_450],
    ["$1,234.5", 123_450],
    ["12", 1_200],
    ["12.", 1_200],
    [".5", 50],
    ["0.005", 0],
    ["10.999", 1_099],
    ["007.5", 750],
    ["0", 0],
    ["", 0],
    ["abc", 0],
  ])("convierte %s a %i centavos", (raw, expected) => {
    expect(parseAmountToCents(raw)).toBe(expected);
  });

  it("se queda con el segundo punto como si fuera un dígito más", () => {
    expect(parseAmountToCents("1.2.3")).toBe(120);
  });

  it("descarta el signo negativo en vez de restarlo", () => {
    expect(parseAmountToCents("-5")).toBe(500);
  });
});

describe("formatPlainPesos", () => {
  it("escribe pesos con dos decimales fijos", () => {
    expect(formatPlainPesos(123_450)).toBe("1234.50");
    expect(formatPlainPesos(50)).toBe("0.50");
    expect(formatPlainPesos(0)).toBe("0.00");
  });
});
