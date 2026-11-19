import { describe, expect, it } from "vitest";
import { highlightParts, searchEntries, tokenize } from "../../lib/search";
import { buildSearchEntries, type SearchLabels } from "./search-index";
import { getSearchLocales } from "./search-locales";
import type { SearchSource } from "./search-actions";

const source: SearchSource = {
  members: [
    {
      code: "MP-4F7K2",
      fullName: "Laura Méndez",
      email: "laura@correo.com",
      phone: "6641234567",
      tierName: "Oro",
      tier: "gold",
      status: "active",
      validUntil: "2027-03-18T00:00:00Z",
    },
  ],
  users: [{ id: 1, name: "Ana Torres", email: "ana@cafe.mx", role: "admin", isActive: true }],
  levels: [{ id: 1, name: "Oro", tier: "gold", customersCount: 12 }],
  movements: [
    { id: "9", memberCode: "MP-4F7K2", memberName: "Laura Méndez", concept: "", amountCents: 10000, createdAt: "2026-11-13T10:00:00Z" },
  ],
};

function labelsFor(localeIndex: number): SearchLabels {
  return {
    localeIndex,
    locales: getSearchLocales(),
    pages: [
      { href: "/panel", key: "dashboard" },
      { href: "/niveles", key: "levels" },
      { href: "/usuarios", key: "users" },
    ],
    pageHint: localeIndex === 0 ? "Pantalla" : "Screen",
    noConcept: localeIndex === 0 ? "Sin concepto" : "No description",
    validUntil: (date) => date,
    customersCount: (count) => String(count),
    amount: (cents) => String(cents),
    date: (iso) => iso,
    inactive: "inactive",
  };
}

async function titles(localeIndex: number, query: string) {
  const entries = buildSearchEntries(source, labelsFor(localeIndex));
  const results = await searchEntries(entries, query, { limitPerGroup: 10 });

  return Object.values(results ?? {})
    .flat()
    .map((result) => `${result.group}:${result.title}`);
}

describe("bilingual search", () => {
  it("finds Spanish screens with English words and shows the Spanish title", async () => {
    expect(await titles(0, "dashboard")).toContain("pages:Panel");
    expect(await titles(0, "settings")).not.toContain("pages:Configuración");
    expect(await titles(0, "tiers")).toContain("pages:Niveles");
  });

  it("finds English screens with Spanish words and shows the English title", async () => {
    expect(await titles(1, "panel")).toContain("pages:Dashboard");
    expect(await titles(1, "usuarios")).toContain("pages:Users");
    expect(await titles(1, "niveles")).toContain("pages:Levels");
  });

  it("matches the tier in either language", async () => {
    expect(await titles(0, "gold")).toEqual(expect.arrayContaining(["levels:Oro", "memberships:MP-4F7K2"]));
    expect(await titles(1, "oro")).toEqual(expect.arrayContaining(["levels:Oro", "memberships:MP-4F7K2"]));
  });

  it("matches the membership status in either language", async () => {
    expect(await titles(0, "active")).toContain("memberships:MP-4F7K2");
    expect(await titles(1, "activa")).toContain("memberships:MP-4F7K2");
  });

  it("matches user roles in either language", async () => {
    expect(await titles(0, "administrator")).toContain("users:Ana Torres");
    expect(await titles(1, "administrador")).toContain("users:Ana Torres");
  });

  it("matches the empty concept in either language", async () => {
    expect(await titles(0, "no description")).toContain("movements:Laura Méndez");
    expect(await titles(1, "sin concepto")).toContain("movements:Laura Méndez");
  });

  it("shows text in the current language", () => {
    const spanish = buildSearchEntries(source, labelsFor(0)).find((entry) => entry.id === "membership:MP-4F7K2");
    const english = buildSearchEntries(source, labelsFor(1)).find((entry) => entry.id === "membership:MP-4F7K2");

    expect(spanish?.subtitle).toContain("Activa");
    expect(english?.subtitle).toContain("Active");
  });

  it("bolds the translated term when the query matched its other-language equivalent", () => {
    const entry = buildSearchEntries(source, labelsFor(0)).find((result) => result.id === "membership:MP-4F7K2");
    const parts = highlightParts(entry?.subtitle ?? "", tokenize("gold"), entry?.equivalents);

    expect(parts.filter((part) => part.match).map((part) => part.text)).toEqual(["Oro"]);
  });
});
