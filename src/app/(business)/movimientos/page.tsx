import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import { ExportCsvButton } from "@/features/business/export-csv-button";
import { FilterBar } from "@/features/business/filter-bar";
import { readParam } from "@/features/business/member-status";
import { parsePage } from "@/lib/api/paginate";
import {
  defaultMovementPeriod,
  listMovements,
  movementPeriods,
} from "@/lib/api/purchases";
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
  const { page, summary } = await listMovements({ query, period, page: requestedPage });
  const filtered = Boolean(query || period !== defaultMovementPeriod);
  const from = (page.page - 1) * page.pageSize + 1;
  const to = from + page.items.length - 1;

  const stats = [
    { label: t("summary.purchases"), value: format.number(summary.count) },
    { label: t("summary.collected"), value: formatMoney(format, summary.collectedCents) },
    { label: t("summary.discounts"), value: formatMoney(format, summary.discountCents) },
    { label: t("summary.cashbackUsed"), value: formatMoney(format, summary.cashbackUsedCents) },
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
      <Reveal>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actions={<ExportCsvButton query={query} period={period} />}
        />
      </Reveal>
      <Reveal index={1}>
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
      <Reveal index={2}>
        <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-display text-subheading font-semibold tabular-nums text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Reveal index={3} className="flex flex-col gap-6">
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
                <tbody>
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
              <div className="border-t border-border">{pagination}</div>
            </section>

            <div className="flex flex-col gap-4 lg:hidden">
              {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-2">
                  <h2 className="text-sm font-medium text-muted">{group.label}</h2>
                  <ul className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
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
              <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">{pagination}</div>
            </div>
          </>
        )}
      </Reveal>
    </>
  );
}
