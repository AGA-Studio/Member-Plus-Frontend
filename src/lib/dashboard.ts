export type PurchasePoint = {
  createdAt: string;
  totalCents: number;
  amountCents: number;
  discountCents: number;
  cashbackAppliedCents: number;
  memberCode: string;
  memberName: string;
};

export type DailyPoint = {
  key: string;
  date: Date;
  revenueCents: number;
  count: number;
};

export type WeekdayPoint = {
  weekday: number;
  revenueCents: number;
  count: number;
};

export type Spender = {
  memberCode: string;
  memberName: string;
  totalCents: number;
  count: number;
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

export function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function buildDailySeries(
  purchases: Array<Pick<PurchasePoint, "createdAt" | "totalCents">>,
  days: number,
  now: Date,
): DailyPoint[] {
  const last = startOfDay(now);
  const series: DailyPoint[] = [];
  const byKey = new Map<string, DailyPoint>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(last, -offset);
    const point: DailyPoint = { key: dateKey(date), date, revenueCents: 0, count: 0 };
    series.push(point);
    byKey.set(point.key, point);
  }

  for (const purchase of purchases) {
    const point = byKey.get(dateKey(new Date(purchase.createdAt)));
    if (!point) continue;
    point.revenueCents += purchase.totalCents;
    point.count += 1;
  }

  return series;
}

export function sumSeries(series: DailyPoint[]): { revenueCents: number; count: number } {
  return series.reduce(
    (total, point) => ({ revenueCents: total.revenueCents + point.revenueCents, count: total.count + point.count }),
    { revenueCents: 0, count: 0 },
  );
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;

  return ((current - previous) / previous) * 100;
}

export function averageTicket(revenueCents: number, count: number): number {
  return count === 0 ? 0 : Math.round(revenueCents / count);
}

export function carryForward(values: number[], hasValue: boolean[]): number[] {
  let last = 0;

  return values.map((value, index) => {
    if (hasValue[index]) last = value;
    return last;
  });
}

export function weekdayTotals(purchases: Array<Pick<PurchasePoint, "createdAt" | "totalCents">>): WeekdayPoint[] {
  const totals: WeekdayPoint[] = Array.from({ length: 7 }, (_, index) => ({
    weekday: (index + 1) % 7,
    revenueCents: 0,
    count: 0,
  }));

  for (const purchase of purchases) {
    const weekday = new Date(purchase.createdAt).getDay();
    const slot = totals.find((total) => total.weekday === weekday);
    if (!slot) continue;
    slot.revenueCents += purchase.totalCents;
    slot.count += 1;
  }

  return totals;
}

export function topSpenders(purchases: PurchasePoint[], limit: number): Spender[] {
  const byMember = new Map<string, Spender>();

  for (const purchase of purchases) {
    const current = byMember.get(purchase.memberCode) ?? {
      memberCode: purchase.memberCode,
      memberName: purchase.memberName,
      totalCents: 0,
      count: 0,
    };
    current.totalCents += purchase.totalCents;
    current.count += 1;
    byMember.set(purchase.memberCode, current);
  }

  return [...byMember.values()]
    .sort((first, second) => second.totalCents - first.totalCents || first.memberName.localeCompare(second.memberName))
    .slice(0, limit);
}

export function countIssuedBetween(issuedAt: string[], from: Date, to: Date): number {
  return issuedAt.filter((iso) => {
    const time = new Date(iso).getTime();
    return time >= from.getTime() && time < to.getTime();
  }).length;
}

export function dailyIssued(issuedAt: string[], days: number, now: Date): number[] {
  const series = buildDailySeries(
    issuedAt.map((createdAt) => ({ createdAt, totalCents: 0 })),
    days,
    now,
  );

  return series.map((point) => point.count);
}

export function niceCeiling(value: number): number {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return step * magnitude;
}

export type Point = { x: number; y: number };

export function linePath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;

  const slopes: number[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const run = points[index + 1].x - points[index].x || 1;
    slopes.push((points[index + 1].y - points[index].y) / run);
  }

  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes[slopes.length - 1];
    if (slopes[index - 1] * slopes[index] <= 0) return 0;

    return (slopes[index - 1] + slopes[index]) / 2;
  });

  let path = `M${round(points[0].x)} ${round(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const reach = (next.x - current.x) / 3;
    path += ` C${round(current.x + reach)} ${round(current.y + tangents[index] * reach)} ${round(next.x - reach)} ${round(next.y - tangents[index + 1] * reach)} ${round(next.x)} ${round(next.y)}`;
  }

  return path;
}

export function areaPath(points: Point[], baseline: number): string {
  if (points.length === 0) return "";

  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath(points)} L${round(last.x)} ${baseline} L${round(first.x)} ${baseline} Z`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayInMilliseconds);
}
