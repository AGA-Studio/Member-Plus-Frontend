import type { Metadata } from "next";
import { ArrowLeftRight, Banknote, Gift, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import { KpiGrid, type KpiItem } from "@/features/business/dashboard-parts";
import { ExportCsvButton } from "@/features/business/export-csv-button";
import { FilterBar } from "@/features/business/filter-bar";
import { readParam } from "@/features/business/member-status";
import { parsePage } from "@/lib/api/paginate";
import {
  defaultMovementPeriod,
  listMovements,
  movementPeriods,
  periodLength,
  summarizePreviousPeriod,
} from "@/lib/api/purchases";
import { averageTicket, percentChange } from "@/lib/dashboard";
import type { Purchase } from "@/lib/domain";
import {
  formatDiscount,
  formatMoney,
  formatPositiveMoney,
  formatSignedPoints,
} from "@/lib/format";

export const instant = false;


export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.movements");

  return { title: t("metaTitle") };
}

export default async function MovementsPage({ searchParams }: PageProps<"/movimientos">) {
  await connection();
  const params = await searchParams;
  const query = readParam(params.q);
  const period = movementPeriods.find((item) => item === readParam(params.period)) ?? defaultMovementPeriod;
  const requestedPage = parsePage(readParam(params.page));

  const t = await getTranslations("business.movements");
  const format = await getFormatter();
  const days = periodLength(period);
  const [{ page, summary }, previous] = await Promise.all([
    listMovements({ query, period, page: requestedPage }),
    days === null ? Promise.resolve(null) : summarizePreviousPeriod({ query, days }),
  ]);
  const filtered = Boolean(query || period !== defaultMovementPeriod);
  const from = (page.page - 1) * page.pageSize + 1;
  const to = from + page.items.length - 1;

  const moneyOptions = { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" } as const;
  const benefitsCents = summary.discountCents + summary.cashbackUsedCents;
  const previousBenefitsCents = previous ? previous.discountCents + previous.cashbackUsedCents : 0;
  const ticket = averageTicket(summary.collectedCents, summary.count);
  const previousTicket = previous ? averageTicket(previous.collectedCents, previous.count) : 0;
  const grossCents = summary.collectedCents + benefitsCents;
  const trend = (current: number, before: number | undefined) => {
    const percent = previous && before !== undefined ? percentChange(current, before) : null;

    return {
      percent,
      label: percent === null ? "" : format.number(percent / 100, { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" }),
      hint: t("vsPrevious"),
    };
  };

  const kpis: KpiItem[] = [
    {
      key: "collected",
      icon: Banknote,
      label: t("summary.collected"),
      value: <AnimatedNumber value={summary.collectedCents} divisor={100} options={moneyOptions} />,
      hint: t(`periods.${period}`),
      trend: trend(summary.collectedCents, previous?.collectedCents),
    },
    {
      key: "purchases",
      icon: ShoppingBag,
      label: t("summary.purchases"),
      value: <AnimatedNumber value={summary.count} />,
      hint: t("summary.purchasesHint", { count: summary.count }),
      trend: trend(summary.count, previous?.count),
    },
    {
      key: "ticket",
      icon: Tag,
      label: t("summary.ticket"),
      value: <AnimatedNumber value={ticket} divisor={100} options={moneyOptions} />,
      hint: t("summary.ticketHint"),
      trend: trend(ticket, previous ? previousTicket : undefined),
    },
    {
      key: "benefits",
      icon: Gift,
      tone: "warning",
      label: t("summary.benefits"),
      value: <AnimatedNumber value={benefitsCents} divisor={100} options={moneyOptions} />,
      hint: t("summary.benefitsHint", { percent: grossCents === 0 ? 0 : Math.round((benefitsCents / grossCents) * 100) }),
      trend: trend(benefitsCents, previous ? previousBenefitsCents : undefined),
    },
  ];

  const formatDateTime = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const formatTime = (iso: string) => format.dateTime(new Date(iso), { hour: "numeric", minute: "2-digit" });

  const dayKey = (iso: string) => format.dateTime(new Date(iso), { year: "numeric", month: "numeric", day: "numeric" });
  const now = new Date();
  const todayKey = dayKey(now.toISOString());
  const yesterdayKey = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());
  const groups: { key: string; label: string; items: Purchase[] }[] = [];
  for (const purchase of page.items) {
    const key = dayKey(purchase.createdAt);
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = {
        key,
        label:
          key === todayKey
            ? t("today")
            : key === yesterdayKey
              ? t("yesterday")
              : format.dateTime(new Date(purchase.createdAt), { day: "numeric", month: "short" }),
        items: [],
      };
      groups.push(group);
    }
    group.items.push(purchase);
  }

  const pagination = (
    <Pagination
      pathname="/movimientos"
      params={{ q: query, period: period === defaultMovementPeriod ? undefined : period }}
      page={page.page}
      pageCount={page.pageCount}
      summary={t("range", { from, to, total: page.total })}
    />
  );

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actions={<ExportCsvButton query={query} period={period} />}
        />
      </Reveal>
      <KpiGrid items={kpis} />
      <Reveal variant="entrance" index={5}>
        <FilterBar
          searchLabel={t("searchLabel")}
          searchPlaceholder={t("searchPlaceholder")}
          filters={[
            {
              name: "period",
              label: t("filters.period"),
              defaultValue: defaultMovementPeriod,
              options: movementPeriods.map((item) => ({ value: item, label: t(`periods.${item}`) })),
            },
          ]}
        />
      </Reveal>
      <Reveal variant="entrance" index={6} className="flex flex-col gap-6">
        {page.items.length === 0 ? (
          <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <EmptyState
              icon={ArrowLeftRight}
              title={filtered ? t("noResults.title") : t("empty.title")}
              description={filtered ? t("noResults.description") : t("empty.description")}
            />
          </section>
        ) : (
          <>
            <section className="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-sm lg:block">
              <table className="w-full">
                <thead className="bg-surface-muted text-left text-sm text-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t("columns.date")}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{t("columns.customer")}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{t("columns.concept")}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t("columns.amount")}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t("columns.discount")}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t("columns.points")}</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">{t("columns.cashback")}</th>
                  </tr>
                </thead>
                <tbody className="table-reveal">
                  {page.items.map((purchase) => {
                    const { breakdown } = purchase;
                    const cashbackUsed = breakdown.cashbackAppliedCents > 0;

                    return (
                      <tr key={purchase.id} className="border-t border-border">
                        <td className="px-6 py-3">
                          <span className="flex flex-col">
                            <span className="text-base text-foreground">{formatDateTime(purchase.createdAt)}</span>
                            <span className="text-sm text-muted">{purchase.cashierName}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/clientes/${encodeURIComponent(purchase.memberCode)}`} className="flex flex-col rounded-sm">
                            <span className="text-base font-medium text-foreground">{purchase.memberName}</span>
                            <span className="font-mono text-sm tabular-nums text-muted">{purchase.memberCode}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-base text-foreground">{purchase.concept || t("noConcept")}</td>
                        <td className="px-4 py-3 text-right text-base font-medium tabular-nums text-foreground">{formatMoney(format, breakdown.amountCents)}</td>
                        <td className="px-4 py-3 text-right text-base tabular-nums text-success-text">{formatDiscount(format, breakdown.discountCents)}</td>
                        <td className="px-4 py-3 text-right text-base tabular-nums text-foreground">{formatSignedPoints(format, breakdown.pointsEarned)}</td>
                        <td className={cashbackUsed ? "px-6 py-3 text-right text-base tabular-nums text-danger-text" : "px-6 py-3 text-right text-base tabular-nums text-success-text"}>
                          {cashbackUsed ? formatDiscount(format, breakdown.cashbackAppliedCents) : formatPositiveMoney(format, breakdown.cashbackEarnedCents)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <div className="flex flex-col gap-4 lg:hidden">
              {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-2">
                  <h2 className="text-sm font-medium text-muted">{group.label}</h2>
                  <ul className="row-reveal overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                    {group.items.map((purchase) => (
                      <li key={purchase.id} className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0">
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-base font-medium text-foreground">{purchase.memberName}</span>
                          <span className="truncate text-sm text-muted">
                            {purchase.concept || t("noConcept")}
                          </span>
                          <span className="text-sm text-muted">{formatTime(purchase.createdAt)}</span>
                        </span>
                        <span className="flex flex-col items-end">
                          <span className="text-base font-medium tabular-nums text-foreground">{formatMoney(format, purchase.breakdown.amountCents)}</span>
                          <span className="text-sm tabular-nums text-muted">{t("pointsLabel", { points: formatSignedPoints(format, purchase.breakdown.pointsEarned) })}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {pagination}
          </>
        )}
      </Reveal>
    </>
  );
}
