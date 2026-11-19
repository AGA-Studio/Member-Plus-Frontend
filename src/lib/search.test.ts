import { describe, expect, it } from "vitest";
import {
  findRanges,
  flattenResults,
  fold,
  highlightParts,
  scoreEntry,
  searchEntries,
  tokenize,
  type SearchEntry,
} from "./search";

function entry(overrides: Partial<SearchEntry> & Pick<SearchEntry, "id" | "title">): SearchEntry {
  return { group: "customers", subtitle: "", href: "/x", fields: [], ...overrides };
}

describe("fold", () => {
  it("ignores case and accents without changing the length", () => {
    expect(fold("María ÁNGEL")).toBe("maria angel");
    expect(fold("Peña").length).toBe("Peña".length);
  });
});

describe("tokenize", () => {
  it("splits on spaces and drops duplicates", () => {
    expect(tokenize("  Laura  méndez laura ")).toEqual(["laura", "mendez"]);
  });

  it("returns nothing for blank text", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("findRanges", () => {
  it("finds every occurrence of every token", () => {
    expect(findRanges("Laura Méndez", ["la", "men"])).toEqual([
      [0, 2],
      [6, 9],
    ]);
  });

  it("merges overlapping ranges", () => {
    expect(findRanges("abcdef", ["abc", "bcd"])).toEqual([[0, 4]]);
  });

  it("matches without caring about accents", () => {
    expect(findRanges("Méndez", ["mend"])).toEqual([[0, 4]]);
  });
});

describe("highlightParts", () => {
  it("marks the matching text and keeps the original casing", () => {
    expect(highlightParts("Laura Méndez", ["mend"])).toEqual([
      { text: "Laura ", match: false },
      { text: "Ménd", match: true },
      { text: "ez", match: false },
    ]);
  });

  it("returns the whole text when nothing matches", () => {
    expect(highlightParts("Laura", ["zzz"])).toEqual([{ text: "Laura", match: false }]);
  });
});

describe("scoreEntry", () => {
  const laura = entry({ id: "1", title: "Laura Méndez", fields: ["laura@correo.mx", "MP-4F7K2"] });

  it("requires every token to match somewhere", () => {
    expect(scoreEntry(laura, tokenize("laura mp-4f"))).toBeGreaterThan(0);
    expect(scoreEntry(laura, tokenize("laura zzz"))).toBe(0);
  });

  it("ranks a prefix above a plain substring", () => {
    const prefix = entry({ id: "2", title: "Mendoza" });
    const inside = entry({ id: "3", title: "Amendola" });

    expect(scoreEntry(prefix, ["mend"])).toBeGreaterThan(scoreEntry(inside, ["mend"]));
  });
});

describe("searchEntries", () => {
  const entries = [
    entry({ id: "a", title: "Laura Méndez" }),
    entry({ id: "b", title: "Mario Laurel" }),
    entry({ id: "c", title: "Ana Torres", group: "users" }),
    entry({ id: "d", title: "Laurent Oro", group: "levels" }),
  ];

  it("groups results and orders the best match first", async () => {
    const results = await searchEntries(entries, "laur");

    expect(results?.customers?.map((result) => result.id)).toEqual(["a", "b"]);
    expect(results?.levels?.map((result) => result.id)).toEqual(["d"]);
    expect(results?.users).toBeUndefined();
  });

  it("limits each group", async () => {
    const many = Array.from({ length: 10 }, (_, index) => entry({ id: String(index), title: `Laura ${index}` }));
    const results = await searchEntries(many, "laura", { limitPerGroup: 3 });

    expect(results?.customers).toHaveLength(3);
  });

  it("returns an empty result for an empty query", async () => {
    expect(await searchEntries(entries, "  ")).toEqual({});
  });

  it("stops when the request is aborted", async () => {
    const controller = new AbortController();
    const pending = searchEntries(entries, "laur", { signal: controller.signal });
    controller.abort();

    expect(await pending).toBeNull();
  });

  it("flattens groups in display order", async () => {
    const results = await searchEntries(entries, "laur");

    expect(flattenResults(results ?? {}).map((result) => result.id)).toEqual(["a", "b", "d"]);
  });
});
