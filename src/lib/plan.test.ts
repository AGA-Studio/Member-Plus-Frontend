import { describe, expect, it } from "vitest";
import type { PlanSummary } from "./domain";
import { isTrialRunning, monthlyPriceCents, usageLevel, usagePercent } from "./plan";

describe("usageLevel", () => {
  it.each([
    [0, 50, "ok"],
    [39, 50, "ok"],
    [40, 50, "near"],
    [49, 50, "near"],
    [50, 50, "reached"],
    [60, 50, "reached"],
    [0, 0, "reached"],
    [5000, null, "ok"],
  ] as const)("reads %i of %s as %s", (used, limit, level) => {
    expect(usageLevel({ used, limit })).toBe(level);
  });
});

describe("usagePercent", () => {
  it.each([
    [0, 50, 0],
    [25, 50, 50],
    [60, 50, 100],
    [0, 0, 100],
    [12, null, 0],
  ] as const)("fills %i of %s as %i", (used, limit, percent) => {
    expect(usagePercent({ used, limit })).toBe(percent);
  });
});

function summaryWith(overrides: Partial<PlanSummary>): PlanSummary {
  return {
    plan: {
      id: 2,
      key: "counter",
      name: "Mostrador",
      priceCents: 19900,
      maxCustomers: 300,
      maxUsers: 3,
      maxDevices: 1,
      historyDays: 365,
      imagesEnabled: true,
      exportsEnabled: true,
      aiEnabled: false,
      aiMessagesMonth: 0,
      trialDays: 0,
      isDefault: false,
    },
    trialEndsAt: null,
    trialActive: false,
    unitPriceCents: null,
    usage: { customers: { used: 0, limit: 300 }, users: { used: 1, limit: 3 } },
    ...overrides,
  };
}

describe("monthlyPriceCents", () => {
  it("prefers the agreed price over the catalog price", () => {
    expect(monthlyPriceCents(summaryWith({ unitPriceCents: 15000 }))).toBe(15000);
  });

  it("keeps an agreed price of zero", () => {
    expect(monthlyPriceCents(summaryWith({ unitPriceCents: 0 }))).toBe(0);
  });

  it("falls back to the catalog price without an agreed one", () => {
    expect(monthlyPriceCents(summaryWith({}))).toBe(19900);
  });

  it("shows the effective plan price once a trial has a date", () => {
    expect(monthlyPriceCents(summaryWith({ trialEndsAt: "2026-11-01T00:00:00Z", unitPriceCents: 39900 }))).toBe(19900);
  });
});

describe("isTrialRunning", () => {
  const now = new Date("2026-11-26T12:00:00Z");

  it("is running before the end date", () => {
    expect(isTrialRunning("2026-12-25T12:00:00Z", now)).toBe(true);
  });

  it("is over after the end date", () => {
    expect(isTrialRunning("2026-11-01T12:00:00Z", now)).toBe(false);
  });

  it("is not running without a trial", () => {
    expect(isTrialRunning(null, now)).toBe(false);
  });
});
