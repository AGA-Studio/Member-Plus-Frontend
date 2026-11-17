import { createFormatter } from "use-intl/core";
import { describe, expect, it } from "vitest";
import {
  formatDiscount,
  formatPlainPesos,
  formatPoints,
  formatPositiveMoney,
  formatMoney,
  formatSignedPoints,
  parseAmountToCents,
} from "./format";

const spanish = createFormatter({ locale: "es-MX" });
const english = createFormatter({ locale: "en-US" });

describe("money formatting", () => {
  it("shows pesos with the narrow symbol in both languages", () => {
    expect(formatMoney(spanish, 123_450)).toBe("$1,234.50");
    expect(formatMoney(english, 123_450)).toBe("$1,234.50");
    expect(formatMoney(spanish, 0)).toBe("$0.00");
    expect(formatMoney(spanish, 5)).toBe("$0.05");
  });

  it("marks a discount with a real minus sign", () => {
    expect(formatDiscount(spanish, 15_000)).toBe("−$150.00");
  });

  it("marks an amount earned with a plus sign", () => {
    expect(formatPositiveMoney(spanish, 2_550)).toBe("+$25.50");
  });
});

describe("points formatting", () => {
  it("groups thousands", () => {
    expect(formatPoints(spanish, 1_234)).toBe("1,234");
  });

  it("marks points earned with a plus sign", () => {
    expect(formatSignedPoints(spanish, 85)).toBe("+85");
  });
});

describe("parseAmountToCents", () => {
  it.each([
    ["12", 1_200],
    ["12.5", 1_250],
    ["12.50", 1_250],
    ["0.5", 50],
    [".5", 50],
    ["1,234.50", 123_450],
    ["$ 100.9", 10_090],
    ["007", 700],
    ["00.50", 50],
    ["12.", 1_200],
    ["1.2.3", 120],
    ["-5", 500],
    ["", 0],
    ["abc", 0],
    ["0", 0],
  ])("reads %j as %i cents", (raw, expected) => {
    expect(parseAmountToCents(raw)).toBe(expected);
  });

  it("drops digits beyond the cents instead of rounding", () => {
    expect(parseAmountToCents("1.999")).toBe(199);
  });

  it("round-trips with formatPlainPesos", () => {
    for (const cents of [0, 1, 5, 99, 100, 101, 12_345, 100_000, 999_999]) {
      expect(parseAmountToCents(formatPlainPesos(cents))).toBe(cents);
    }
  });
});

describe("formatPlainPesos", () => {
  it("always shows two decimals and no grouping", () => {
    expect(formatPlainPesos(123_450)).toBe("1234.50");
    expect(formatPlainPesos(0)).toBe("0.00");
    expect(formatPlainPesos(7)).toBe("0.07");
  });
});
