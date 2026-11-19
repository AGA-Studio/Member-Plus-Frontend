export const searchGroups = ["pages", "customers", "memberships", "users", "levels", "movements"] as const;

export type SearchGroup = (typeof searchGroups)[number];

export type Equivalent = { shown: string; others: string[] };

export type SearchEntry = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  fields: string[];
  equivalents?: Equivalent[];
};

export type SearchResult = SearchEntry & { score: number };

export type SearchResults = Partial<Record<SearchGroup, SearchResult[]>>;

export type HighlightPart = { text: string; match: boolean };

const chunkSize = 250;
const wordBoundary = /[\s@.\-_/·,]/;

export function fold(text: string): string {
  let folded = "";

  for (const character of text) {
    const base = character.normalize("NFD")[0].toLowerCase()[0];
    folded += character.length === 2 ? "  " : base;
  }

  return folded;
}

export function tokenize(query: string): string[] {
  return [...new Set(fold(query).split(/\s+/).filter(Boolean))];
}

function collectRanges(folded: string, needle: string, ranges: Array<[number, number]>) {
  if (needle.length === 0) return;

  let from = 0;
  for (;;) {
    const index = folded.indexOf(needle, from);
    if (index === -1) break;
    ranges.push([index, index + needle.length]);
    from = index + needle.length;
  }
}

export function findRanges(text: string, tokens: string[], equivalents: Equivalent[] = []): Array<[number, number]> {
  if (tokens.length === 0) return [];

  const folded = fold(text);
  const ranges: Array<[number, number]> = [];

  for (const token of tokens) collectRanges(folded, token, ranges);

  for (const equivalent of equivalents) {
    const matchesOther = tokens.some((token) => equivalent.others.some((other) => fold(other).includes(token)));
    if (matchesOther) collectRanges(folded, fold(equivalent.shown), ranges);
  }

  ranges.sort((first, second) => first[0] - second[0]);

  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }

  return merged;
}

export function highlightParts(text: string, tokens: string[], equivalents: Equivalent[] = []): HighlightPart[] {
  const ranges = findRanges(text, tokens, equivalents);
  if (ranges.length === 0) return [{ text, match: false }];

  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

  return parts;
}

function scoreToken(fields: string[], token: string): number {
  let best = 0;

  fields.forEach((field, position) => {
    const index = field.indexOf(token);
    if (index === -1) return;

    let score = 20;
    if (field === token) score = 100;
    else if (index === 0) score = 60;
    else if (wordBoundary.test(field[index - 1])) score = 40;
    if (position === 0) score += 10;

    best = Math.max(best, score);
  });

  return best;
}

export function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  const fields = [entry.title, ...entry.fields].map(fold);
  let total = 0;

  for (const token of tokens) {
    const score = scoreToken(fields, token);
    if (score === 0) return 0;
    total += score;
  }

  return total;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

type SearchOptions = {
  limitPerGroup?: number;
  signal?: AbortSignal;
};

export async function searchEntries(
  entries: SearchEntry[],
  query: string,
  { limitPerGroup = 4, signal }: SearchOptions = {},
): Promise<SearchResults | null> {
  const tokens = tokenize(query);
  if (tokens.length === 0) return {};

  const matches: SearchResult[] = [];

  for (let start = 0; start < entries.length; start += chunkSize) {
    if (signal?.aborted) return null;

    for (const entry of entries.slice(start, start + chunkSize)) {
      const score = scoreEntry(entry, tokens);
      if (score > 0) matches.push({ ...entry, score });
    }

    await yieldToMain();
  }

  if (signal?.aborted) return null;

  const results: SearchResults = {};

  for (const group of searchGroups) {
    const inGroup = matches
      .filter((match) => match.group === group)
      .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
      .slice(0, limitPerGroup);

    if (inGroup.length > 0) results[group] = inGroup;
  }

  return results;
}

export function flattenResults(results: SearchResults): SearchResult[] {
  return searchGroups.flatMap((group) => results[group] ?? []);
}
