import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/features/business/filter-bar";
import { readParam } from "@/features/business/member-status";
import { parsePage } from "@/lib/api/paginate";
import { listMovements, listRegisterNames } from "@/lib/api/purchases";
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
  const registers = await listRegisterNames();
  const register = registers.find((item) => item === readParam(params.register));
  const requestedPage = parsePage(readParam(params.page));

  const t = await getTranslations("business.movements");
  const format = await getFormatter();
  const { page, summary } = await listMovements({ query, register, page: requestedPage });
  const filtered = Boolean(query || register);
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

  return (
    <>
      <Reveal>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal index={1}>
      <FilterBar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            name: "register",
            label: t("filters.register"),
            allLabel: t("filters.allRegisters"),
            options: registers.map((item) => ({ value: item, label: item })),
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
      <Reveal index={3}>
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        {page.items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={filtered ? t("noResults.title") : t("empty.title")}
            description={filtered ? t("noResults.description") : t("empty.description")}
          />
        ) : (
          <>
            <table className="hidden w-full lg:table">
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
                          <span className="text-sm text-muted">{purchase.registerName}</span>
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
            <ul className="lg:hidden">
              {page.items.map((purchase) => (
                <li key={purchase.id} className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-medium text-foreground">{purchase.memberName}</span>
                    <span className="truncate text-sm text-muted">{purchase.concept || t("noConcept")}</span>
                    <span className="text-sm text-muted">{formatDateTime(purchase.createdAt)}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-base font-medium tabular-nums text-foreground">{formatMoney(format, purchase.breakdown.amountCents)}</span>
                    <span className="text-sm tabular-nums text-muted">{t("pointsLabel", { points: formatSignedPoints(format, purchase.breakdown.pointsEarned) })}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border">
              <Pagination
                pathname="/movimientos"
                params={{ q: query, register }}
                page={page.page}
                pageCount={page.pageCount}
                summary={t("range", { from, to, total: page.total })}
              />
            </div>
          </>
        )}
      </section>
      </Reveal>
    </>
  );
}
