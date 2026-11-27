import type { Metadata } from "next";
import { Banknote, ChevronRight, ShoppingBag, Tag, Users } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart, type BarDatum } from "@/components/charts/bar-chart";
import { DonutChart, tierDotClasses } from "@/components/charts/donut-chart";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { InView } from "@/components/ui/in-view";
import { DashCard, KpiCard, ListCard } from "@/features/business/dashboard-parts";
import { listLevels } from "@/lib/api/levels";
import { countMembers, listMembers } from "@/lib/api/members";
import { listMovements } from "@/lib/api/purchases";
import { cx } from "@/lib/cx";
import {
  addDays,
  averageTicket,
  buildDailySeries,
  carryForward,
  countIssuedBetween,
  dailyIssued,
  percentChange,
  startOfDay,
  sumSeries,
  topSpenders,
  weekdayTotals,
  type PurchasePoint,
} from "@/lib/dashboard";
import { formatMoney } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const instant = false;

const listLimit = 5;
const expiringPoolSize = 50;
const poolSize = 500;
const periodDays = 30;
const chartDays = 90;
const weekdayAnchor = 1;
const moneyOptions = { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.dashboard");

  return { title: t("metaTitle") };
}

export default async function DashboardPage() {
  await connection();
  const user = await requireUser(["admin"]);
  const t = await getTranslations("business.dashboard");
  const format = await getFormatter();
  const now = new Date();

  const [counts, recentMovements, history, memberPool, levels, expiringPool] = await Promise.all([
    countMembers(),
    listMovements({ period: "30d", page: 1, pageSize: listLimit }),
    listMovements({ period: "90d", page: 1, pageSize: poolSize }),
    listMembers({ page: 1, pageSize: poolSize }),
    listLevels(),
    listMembers({ status: "expiring", page: 1, pageSize: expiringPoolSize }),
  ]);

  const { summary } = recentMovements;
  const recentPurchases = recentMovements.page.items.slice(0, listLimit);
  const expiring = [...expiringPool.items]
    .sort((first, second) => first.validUntil.localeCompare(second.validUntil))
    .slice(0, listLimit);

  const points: PurchasePoint[] = history.page.items.map((purchase) => ({
    createdAt: purchase.createdAt,
    totalCents: purchase.breakdown.totalCents,
    amountCents: purchase.breakdown.amountCents,
    discountCents: purchase.breakdown.discountCents,
    cashbackAppliedCents: purchase.breakdown.cashbackAppliedCents,
    memberCode: purchase.memberCode,
    memberName: purchase.memberName,
  }));
  const historyIsPartial = history.page.total > history.page.items.length;

  const series = buildDailySeries(points, chartDays, now);
  const lastPeriod = series.slice(-periodDays);
  const previousPeriod = series.slice(-periodDays * 2, -periodDays);
  const previousTotals = sumSeries(previousPeriod);

  const revenue = summary.collectedCents;
  const purchaseCount = summary.count;
  const ticket = averageTicket(revenue, purchaseCount);
  const previousTicket = averageTicket(previousTotals.revenueCents, previousTotals.count);
  const comparable = !historyIsPartial;

  const dailyTicket = carryForward(
    lastPeriod.map((point) => averageTicket(point.revenueCents, point.count)),
    lastPeriod.map((point) => point.count > 0),
  );

  const membersComplete = counts.all <= memberPool.items.length;
  const issuedDates = memberPool.items.map((member) => member.issuedAt);
  const today = startOfDay(now);
  const newCustomers = countIssuedBetween(issuedDates, addDays(today, -(periodDays - 1)), addDays(today, 1));
  const previousNewCustomers = countIssuedBetween(
    issuedDates,
    addDays(today, -(periodDays * 2 - 1)),
    addDays(today, -(periodDays - 1)),
  );

  const percentLabel = (percent: number | null) =>
    percent === null
      ? ""
      : format.number(percent / 100, { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });

  const kpis = [
    {
      key: "revenue",
      icon: Banknote,
      label: t("kpi.revenue.label"),
      value: <AnimatedNumber value={revenue} divisor={100} options={moneyOptions} />,
      hint: t("kpi.period"),
      percent: comparable ? percentChange(revenue, previousTotals.revenueCents) : null,
      sparkline: lastPeriod.map((point) => point.revenueCents),
    },
    {
      key: "purchases",
      icon: ShoppingBag,
      label: t("kpi.purchases.label"),
      value: <AnimatedNumber value={purchaseCount} />,
      hint: t("kpi.purchases.count", { count: purchaseCount }),
      percent: comparable ? percentChange(purchaseCount, previousTotals.count) : null,
      sparkline: lastPeriod.map((point) => point.count),
    },
    {
      key: "ticket",
      icon: Tag,
      label: t("kpi.ticket.label"),
      value: <AnimatedNumber value={ticket} divisor={100} options={moneyOptions} />,
      hint: t("kpi.ticket.hint"),
      percent: comparable ? percentChange(ticket, previousTicket) : null,
      sparkline: dailyTicket,
    },
    {
      key: "customers",
      icon: Users,
      label: t("kpi.customers.label"),
      value: <AnimatedNumber value={counts.active} />,
      hint: `${t("kpi.customers.newCount", { count: newCustomers })} · ${t("kpi.customers.expiring", { count: counts.expiring })}`,
      percent: membersComplete ? percentChange(newCustomers, previousNewCustomers) : null,
      sparkline: membersComplete ? dailyIssued(issuedDates, periodDays, now) : [],
    },
  ];

  const levelTotal = levels.reduce((sum, level) => sum + level.customersCount, 0);
  const membershipRows = [
    { key: "active", count: counts.active, bar: "fill-success", dot: "bg-success" },
    { key: "expiring", count: counts.expiring, bar: "fill-warning", dot: "bg-warning" },
    { key: "expired", count: counts.expired, bar: "fill-danger", dot: "bg-danger" },
    { key: "cancelled", count: counts.cancelled, bar: "fill-border-strong", dot: "bg-border-strong" },
  ] as const;
  const statusTotal = membershipRows.reduce((sum, row) => sum + row.count, 0);

  const weekdays = weekdayTotals(points);
  const bestWeekday = weekdays.reduce((best, current) => (current.revenueCents > best.revenueCents ? current : best));
  const weekdayDate = (weekday: number) => new Date(2024, 0, weekdayAnchor + ((weekday + 6) % 7));
  const weekdayData: BarDatum[] = weekdays.map((day) => ({
    id: String(day.weekday),
    label: format.dateTime(weekdayDate(day.weekday), { weekday: "short" }),
    value: day.revenueCents,
    description: `${format.dateTime(weekdayDate(day.weekday), { weekday: "long" })}: ${formatMoney(format, day.revenueCents)}`,
    highlight: day.revenueCents > 0 && day.weekday === bestWeekday.weekday,
  }));
  const hasWeekdaySales = bestWeekday.revenueCents > 0;

  const grossCents = revenue + summary.discountCents + summary.cashbackUsedCents;
  const benefitRows = [
    { key: "discounts", cents: summary.discountCents, bar: "fill-primary" },
    { key: "cashback", cents: summary.cashbackUsedCents, bar: "fill-warning" },
  ] as const;

  const spenders = topSpenders(points, listLimit);

  const formatDate = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short" });
  const formatTime = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const percentOf = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

  const viewAllClasses = buttonStyles({ variant: "ghost", size: "sm", className: "shrink-0" });
  const rowClasses =
    "flex items-center gap-3 px-6 py-3 transition-colors duration-150 ease-out hover:bg-surface-muted";

  return (
    <>
      <InView index={1}>
        <PageHeader title={t("title")} subtitle={t("subtitle", { business: user.businessName })} />
      </InView>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <InView key={kpi.key} index={2 + index}>
            <KpiCard
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              hint={kpi.hint}
              trend={{ percent: kpi.percent, label: percentLabel(kpi.percent) }}
              sparkline={kpi.sparkline}
            />
          </InView>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InView index={3} className="lg:col-span-2">
          <DashCard
            title={t("chart.title")}
            subtitle={historyIsPartial ? t("chart.partial", { count: history.page.items.length }) : t("chart.subtitle")}
          >
            <AreaChart
              series={series.map((point) => ({ key: point.key, revenueCents: point.revenueCents, count: point.count }))}
              ranges={[7, 30, 90]}
              initialRange={30}
            />
          </DashCard>
        </InView>

        <InView index={4}>
          <DashCard title={t("levels.title")} subtitle={t("levels.subtitle")} bodyClassName="items-center justify-center gap-6">
            {levelTotal === 0 ? (
              <p className="my-auto text-center text-base text-muted">{t("levels.empty")}</p>
            ) : (
              <>
                <DonutChart
                  label={t("levels.chartLabel")}
                  total={levelTotal}
                  slices={levels.map((level) => ({ id: String(level.id), tier: level.tier, value: level.customersCount }))}
                  center={
                    <>
                      <span className="font-display text-heading font-semibold tabular-nums text-foreground">
                        <AnimatedNumber value={levelTotal} />
                      </span>
                      <span className="text-xs text-muted">{t("levels.centerLabel", { count: levelTotal })}</span>
                    </>
                  }
                />
                <ul className="flex w-full flex-col gap-2">
                  {levels.map((level) => (
                    <li key={level.id} className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3 text-base text-foreground">
                        <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", tierDotClasses[level.tier])} />
                        <span className="truncate">{level.name}</span>
                      </span>
                      <span className="flex shrink-0 items-baseline gap-2">
                        <span className="font-display text-base font-semibold tabular-nums text-foreground">
                          {format.number(level.customersCount)}
                        </span>
                        <span className="w-10 text-right text-sm tabular-nums text-muted">
                          {format.number(percentOf(level.customersCount, levelTotal) / 100, { style: "percent" })}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </DashCard>
        </InView>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InView index={0}>
          <DashCard
            title={t("memberships.title")}
            subtitle={t("memberships.total", { count: counts.all })}
            action={
              <Link href="/clientes" className={viewAllClasses}>
                {t("memberships.viewAll")}
              </Link>
            }
          >
            <svg
              role="img"
              aria-label={t("status.chartLabel")}
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              className="h-3 w-full overflow-hidden rounded-full bg-surface-muted"
            >
              <g className="chart-spread">
                {membershipRows.map((row, index) => {
                  const before = membershipRows.slice(0, index).reduce((sum, item) => sum + item.count, 0);
                  const x = statusTotal === 0 ? 0 : (before / statusTotal) * 100;
                  const width = statusTotal === 0 ? 0 : (row.count / statusTotal) * 100;

                  return <rect key={row.key} x={x} y={0} width={width} height={10} className={row.bar} />;
                })}
              </g>
            </svg>
            <ul className="mt-5 flex flex-col gap-3">
              {membershipRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3 text-base text-foreground">
                    <span aria-hidden className={cx("size-2 rounded-full", row.dot)} />
                    {t(`memberships.${row.key}`)}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                      {format.number(row.count)}
                    </span>
                    <span className="w-10 text-right text-sm tabular-nums text-muted">
                      {format.number(percentOf(row.count, statusTotal) / 100, { style: "percent" })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </DashCard>
        </InView>

        <InView index={1}>
          <DashCard title={t("weekday.title")} subtitle={t("weekday.subtitle")} bodyClassName="justify-between gap-4">
            {hasWeekdaySales ? (
              <>
                <BarChart data={weekdayData} label={t("weekday.chartLabel")} />
                <p className="text-sm text-muted">
                  {t("weekday.best", {
                    day: format.dateTime(weekdayDate(bestWeekday.weekday), { weekday: "long" }),
                  })}
                </p>
              </>
            ) : (
              <p className="my-auto text-center text-base text-muted">{t("weekday.empty")}</p>
            )}
          </DashCard>
        </InView>

        <InView index={2}>
          <DashCard title={t("benefits.title")} subtitle={t("benefits.subtitle")} bodyClassName="gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted">{t("benefits.gross")}</p>
              <p className="font-display text-heading font-semibold tabular-nums text-foreground">
                <AnimatedNumber value={grossCents} divisor={100} options={moneyOptions} />
              </p>
            </div>
            <ul className="flex flex-col gap-4">
              {benefitRows.map((row) => (
                <li key={row.key} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-base text-foreground">{t(`benefits.${row.key}`)}</span>
                    <span className="font-display text-base font-semibold tabular-nums text-foreground">
                      {formatMoney(format, row.cents)}
                    </span>
                  </div>
                  <svg
                    aria-hidden
                    viewBox="0 0 100 6"
                    preserveAspectRatio="none"
                    className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                  >
                    <g className="chart-spread">
                      <rect x={0} y={0} width={grossCents === 0 ? 0 : (row.cents / grossCents) * 100} height={6} className={row.bar} />
                    </g>
                  </svg>
                  <p className="text-xs text-muted">
                    {t("benefits.share", { percent: percentOf(row.cents, grossCents) })}
                  </p>
                </li>
              ))}
            </ul>
          </DashCard>
        </InView>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <InView index={0}>
          <ListCard
            title={t("recent.title")}
            action={
              <Link href="/movimientos" className={viewAllClasses}>
                {t("recent.viewAll")}
              </Link>
            }
          >
            {recentPurchases.length === 0 ? (
              <div className="flex flex-col gap-1 border-t border-border px-6 py-8">
                <p className="text-base font-medium text-foreground">{t("recent.emptyTitle")}</p>
                <p className="text-sm text-muted">{t("recent.emptyDescription")}</p>
              </div>
            ) : (
              <ul>
                {recentPurchases.map((purchase) => (
                  <li key={purchase.id} className="border-t border-border">
                    <Link href={`/clientes/${encodeURIComponent(purchase.memberCode)}`} className={rowClasses}>
                      <Avatar name={purchase.memberName} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base font-medium text-foreground">{purchase.memberName}</span>
                        <span className="truncate text-sm text-muted">{purchase.concept || purchase.memberCode}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end">
                        <span className="text-base font-medium tabular-nums text-foreground">
                          {formatMoney(format, purchase.breakdown.totalCents)}
                        </span>
                        <span className="text-xs text-muted">{formatTime(purchase.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
        </InView>

        <InView index={1}>
          <ListCard
            title={t("expiring.title")}
            action={
              <Link href="/clientes?status=expiring" className={viewAllClasses}>
                {t("expiring.viewAll")}
              </Link>
            }
          >
            {expiring.length === 0 ? (
              <div className="border-t border-border px-6 py-8">
                <p className="text-sm text-muted">{t("expiring.empty")}</p>
              </div>
            ) : (
              <ul>
                {expiring.map((member) => (
                  <li key={member.id} className="border-t border-border">
                    <Link href={`/clientes/${encodeURIComponent(member.code)}`} className={rowClasses}>
                      <Avatar name={member.fullName} photoUrl={member.photoUrl} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base font-medium text-foreground">{member.fullName}</span>
                        <span className="truncate text-sm text-muted">
                          {t("expiring.validUntil", { date: formatDate(member.validUntil) })}
                        </span>
                      </span>
                      <ChevronRight aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
        </InView>

        <InView index={2}>
          <ListCard
            title={t("top.title")}
            subtitle={t("top.subtitle")}
            action={
              <Link href="/clientes" className={viewAllClasses}>
                {t("top.viewAll")}
              </Link>
            }
          >
            {spenders.length === 0 ? (
              <div className="border-t border-border px-6 py-8">
                <p className="text-sm text-muted">{t("top.empty")}</p>
              </div>
            ) : (
              <ol>
                {spenders.map((spender, index) => (
                  <li key={spender.memberCode} className="border-t border-border">
                    <Link href={`/clientes/${encodeURIComponent(spender.memberCode)}`} className={rowClasses}>
                      <span
                        aria-hidden
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold tabular-nums text-muted"
                      >
                        {index + 1}
                      </span>
                      <Avatar name={spender.memberName} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base font-medium text-foreground">{spender.memberName}</span>
                        <span className="truncate text-sm text-muted">{t("top.purchases", { count: spender.count })}</span>
                      </span>
                      <span className="shrink-0 text-base font-medium tabular-nums text-foreground">
                        {formatMoney(format, spender.totalCents)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </ListCard>
        </InView>
      </div>
    </>
  );
}
