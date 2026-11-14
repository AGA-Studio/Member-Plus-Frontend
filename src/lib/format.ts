import type { useFormatter } from "next-intl";

type NumberFormatter = Pick<ReturnType<typeof useFormatter>, "number">;

const moneyOptions = {
  style: "currency",
  currency: "MXN",
  currencyDisplay: "narrowSymbol",
} as const;

export function formatMoney(format: NumberFormatter, cents: number): string {
  return format.number(cents / 100, moneyOptions);
}

export function formatDiscount(format: NumberFormatter, cents: number): string {
  return `−${formatMoney(format, cents)}`;
}

export function formatPositiveMoney(format: NumberFormatter, cents: number): string {
  return `+${formatMoney(format, cents)}`;
}

export function formatPoints(format: NumberFormatter, points: number): string {
  return format.number(points);
}

export function formatSignedPoints(format: NumberFormatter, points: number): string {
  return `+${format.number(points)}`;
}

export function parseAmountToCents(rawAmount: string): number {
  const cleaned = rawAmount.replace(/[^0-9.]/g, "");
  const [whole = "", fraction = ""] = cleaned.split(".");
  const wholeDigits = whole.replace(/^0+(?=\d)/, "") || "0";
  const fractionDigits = fraction.slice(0, 2).padEnd(2, "0");

  return Number(wholeDigits) * 100 + Number(fractionDigits);
}

export function formatPlainPesos(cents: number): string {
  return (cents / 100).toFixed(2);
}
