import { describe, expect, it } from "vitest";
import {
  areaPath,
  averageTicket,
  buildDailySeries,
  carryForward,
  countIssuedBetween,
  dateKey,
  linePath,
  niceCeiling,
  percentChange,
  sumSeries,
  topSpenders,
  weekdayTotals,
  type PurchasePoint,
} from "./dashboard";

const now = new Date(2026, 10, 18, 15, 30);

function purchase(overrides: Partial<PurchasePoint>): PurchasePoint {
  return {
    createdAt: new Date(2026, 10, 18, 10, 0).toISOString(),
    totalCents: 10000,
    amountCents: 12000,
    discountCents: 2000,
    cashbackAppliedCents: 0,
    memberCode: "MP-1",
    memberName: "Laura",
    ...overrides,
  };
}

describe("buildDailySeries", () => {
  it("returns one point per day ending today, with empty days at zero", () => {
    const series = buildDailySeries([], 7, now);

    expect(series).toHaveLength(7);
    expect(series.at(-1)?.key).toBe(dateKey(now));
    expect(series[0].key).toBe("2026-11-12");
    expect(sumSeries(series)).toEqual({ revenueCents: 0, count: 0 });
  });

  it("adds each purchase to its day and ignores older ones", () => {
    const series = buildDailySeries(
      [
        purchase({ totalCents: 5000 }),
        purchase({ totalCents: 2500 }),
        purchase({ createdAt: new Date(2026, 10, 15, 9, 0).toISOString(), totalCents: 700 }),
        purchase({ createdAt: new Date(2026, 9, 1, 9, 0).toISOString(), totalCents: 99999 }),
      ],
      7,
      now,
    );

    expect(series.at(-1)).toMatchObject({ revenueCents: 7500, count: 2 });
    expect(series.find((point) => point.key === "2026-11-15")).toMatchObject({ revenueCents: 700, count: 1 });
    expect(sumSeries(series)).toEqual({ revenueCents: 8200, count: 3 });
  });
});

describe("percentChange", () => {
  it("returns the change against the previous period", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it("returns null when there is nothing to compare with", () => {
    expect(percentChange(10, 0)).toBeNull();
  });
});

describe("averageTicket", () => {
  it("divides and rounds, and handles no purchases", () => {
    expect(averageTicket(10000, 3)).toBe(3333);
    expect(averageTicket(0, 0)).toBe(0);
  });
});

describe("carryForward", () => {
  it("keeps the last known value through empty days", () => {
    expect(carryForward([5, 0, 0, 8, 0], [true, false, false, true, false])).toEqual([5, 5, 5, 8, 8]);
  });
});

describe("weekdayTotals", () => {
  it("starts on Monday and groups purchases by weekday", () => {
    const monday = new Date(2026, 10, 16, 12, 0).toISOString();
    const sunday = new Date(2026, 10, 15, 12, 0).toISOString();
    const totals = weekdayTotals([
      purchase({ createdAt: monday, totalCents: 100 }),
      purchase({ createdAt: monday, totalCents: 200 }),
      purchase({ createdAt: sunday, totalCents: 50 }),
    ]);

    expect(totals.map((total) => total.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(totals[0]).toMatchObject({ revenueCents: 300, count: 2 });
    expect(totals[6]).toMatchObject({ revenueCents: 50, count: 1 });
  });
});

describe("topSpenders", () => {
  it("adds up each customer and sorts by total", () => {
    const top = topSpenders(
      [
        purchase({ memberCode: "A", memberName: "Ana", totalCents: 100 }),
        purchase({ memberCode: "B", memberName: "Beto", totalCents: 500 }),
        purchase({ memberCode: "A", memberName: "Ana", totalCents: 450 }),
      ],
      2,
    );

    expect(top.map((spender) => [spender.memberCode, spender.totalCents, spender.count])).toEqual([
      ["A", 550, 2],
      ["B", 500, 1],
    ]);
  });
});

describe("countIssuedBetween", () => {
  it("counts the dates inside the half-open range", () => {
    const from = new Date(2026, 10, 1);
    const to = new Date(2026, 10, 10);

    expect(
      countIssuedBetween(
        [new Date(2026, 10, 1).toISOString(), new Date(2026, 10, 9).toISOString(), new Date(2026, 10, 10).toISOString()],
        from,
        to,
      ),
    ).toBe(2);
  });
});

describe("niceCeiling", () => {
  it("rounds up to a readable axis maximum", () => {
    expect(niceCeiling(0)).toBe(1);
    expect(niceCeiling(730)).toBe(1000);
    expect(niceCeiling(1200)).toBe(2000);
    expect(niceCeiling(4100)).toBe(5000);
  });
});

describe("paths", () => {
  const points = [
    { x: 0, y: 10 },
    { x: 10, y: 0 },
    { x: 20, y: 5 },
  ];

  it("builds a smooth line through every point", () => {
    const path = linePath(points);

    expect(path.startsWith("M0 10")).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
    expect(path.endsWith("20 5")).toBe(true);
  });

  it("closes the area down to the baseline", () => {
    expect(areaPath(points, 20).endsWith("L20 20 L0 20 Z")).toBe(true);
  });

  it("handles a single point and an empty list", () => {
    expect(linePath([{ x: 3, y: 4 }])).toBe("M3 4");
    expect(linePath([])).toBe("");
  });
});
