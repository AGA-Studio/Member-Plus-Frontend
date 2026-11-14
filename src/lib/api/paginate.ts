export function parsePage(rawPage: string | undefined): number {
  const page = Number.parseInt(rawPage ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
