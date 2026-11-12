import type { Page } from "@/lib/domain";

export const defaultPageSize = 8;

export function parsePage(rawPage: string | undefined): number {
  const page = Number.parseInt(rawPage ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function paginate<T>(items: T[], requestedPage: number, pageSize = defaultPageSize): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageCount,
    pageSize,
  };
}

export function matchesQuery(query: string | undefined, ...fields: string[]): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field.toLowerCase().includes(needle));
}
