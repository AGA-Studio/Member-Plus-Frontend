import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ChevronRight, Hourglass, Layers, UserCheck, Users } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Pagination } from "@/components/ui/pagination";
import { buttonStyles } from "@/components/ui/button";
import { KpiGrid, type KpiItem } from "@/features/business/dashboard-parts";
import { FilterBar } from "@/features/business/filter-bar";
import { getStatusKey, readParam, statusTones } from "@/features/business/member-status";
import { NewMembershipDialog } from "@/features/business/new-membership-dialog";
import { listLevels } from "@/lib/api/levels";
import { countMembers, listMembers } from "@/lib/api/members";
import { parsePage } from "@/lib/api/paginate";
import { addDays, countIssuedBetween, percentChange, startOfDay } from "@/lib/dashboard";
import type { MemberStatus } from "@/lib/domain";
import { formatPoints } from "@/lib/format";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.customers");

  return { title: t("metaTitle") };
}

const statusFilters = ["active", "expiring", "expired", "cancelled"] as const;
const poolSize = 500;
const periodDays = 30;

export default async function CustomersPage({ searchParams }: PageProps<"/clientes">) {
  await connection();
  const params = await searchParams;
  const query = readParam(params.q);
  const statusParam = readParam(params.status);
  const status = statusFilters.find((item) => item === statusParam);
  const requestedPage = parsePage(readParam(params.page));

  const t = await getTranslations("business.customers");
  const statusLabels = await getTranslations("memberStatus");
  const format = await getFormatter();
  const levels = await listLevels();
  const level = levels.find((item) => String(item.id) === readParam(params.level));
  const levelOptions = levels.map((item) => ({ value: String(item.id), label: item.name }));
  const levelPrices = levels.map((item) => ({ value: String(item.id), label: item.name, priceCents: item.priceCents }));
  const [result, counts, memberPool] = await Promise.all([
    listMembers({
      query,
      levelId: level?.id,
      status: status as MemberStatus | "expiring" | undefined,
      page: requestedPage,
    }),
    countMembers(),
    listMembers({ page: 1, pageSize: poolSize }),
  ]);
  const filtered = Boolean(query || level || status);
  const from = (result.page - 1) * result.pageSize + 1;
  const to = from + result.items.length - 1;

  const formatDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short" });

  const now = new Date();
  const today = startOfDay(now);
  const issuedDates = memberPool.items.map((member) => member.issuedAt);
  const poolComplete = counts.all <= memberPool.items.length;
  const newCustomers = countIssuedBetween(issuedDates, addDays(today, -(periodDays - 1)), addDays(today, 1));
  const previousNewCustomers = countIssuedBetween(
    issuedDates,
    addDays(today, -(periodDays * 2 - 1)),
    addDays(today, -(periodDays - 1)),
  );
  const newTrend = poolComplete ? percentChange(newCustomers, previousNewCustomers) : null;
  const percentOf = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));
  const topLevel = levels.reduce<(typeof levels)[number] | null>(
    (best, current) => (!best || current.customersCount > best.customersCount ? current : best),
    null,
  );
  const levelTotal = levels.reduce((sum, item) => sum + item.customersCount, 0);

  const kpis: KpiItem[] = [
    {
      key: "total",
      icon: Users,
      label: t("kpi.total.label"),
      value: <AnimatedNumber value={counts.all} />,
      hint: t("kpi.total.hint", { count: newCustomers }),
      trend: {
        percent: newTrend,
        label: newTrend === null ? "" : format.number(newTrend / 100, { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" }),
        hint: t("kpi.vsPrevious"),
      },
    },
    {
      key: "active",
      icon: UserCheck,
      tone: "success",
      label: t("kpi.active.label"),
      value: <AnimatedNumber value={counts.active} />,
      hint: t("kpi.active.hint", { percent: percentOf(counts.active, counts.all) }),
    },
    {
      key: "expiring",
      icon: Hourglass,
      tone: "warning",
      label: t("kpi.expiring.label"),
      value: <AnimatedNumber value={counts.expiring} />,
      hint: t("kpi.expiring.hint", { expired: counts.expired, cancelled: counts.cancelled }),
    },
    {
      key: "topLevel",
      icon: Layers,
      label: t("kpi.topLevel.label"),
      value: topLevel && topLevel.customersCount > 0 ? topLevel.name : "—",
      hint:
        topLevel && topLevel.customersCount > 0
          ? t("kpi.topLevel.hint", { count: topLevel.customersCount, percent: percentOf(topLevel.customersCount, levelTotal) })
          : t("kpi.topLevel.none"),
    },
  ];

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle", { count: result.total })}
          actions={
            <>
              <Link href="/imprimir" className={buttonStyles({ variant: "outline" })}>
                {t("printSheet")}
              </Link>
              <NewMembershipDialog
                triggerLabel={t("newMembership")}
                triggerClassName={buttonStyles({ size: "md" })}
                levelOptions={levelPrices}
              />
            </>
          }
        />
      </Reveal>
      <KpiGrid items={kpis} />
      <Reveal variant="entrance" index={5}>
      <FilterBar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            name: "level",
            label: t("filters.tier"),
            allLabel: t("filters.allTiers"),
            options: levelOptions,
          },
          {
            name: "status",
            label: t("filters.status"),
            allLabel: t("filters.allStatuses"),
            options: statusFilters.map((item) => ({ value: item, label: statusLabels(item) })),
          },
        ]}
      />
      </Reveal>
      <Reveal variant="entrance" index={6}>
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none">
        {result.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title={filtered ? t("noResults.title") : t("empty.title")}
            description={filtered ? t("noResults.description") : t("empty.description")}
          />
        ) : (
          <>
            <table className="hidden w-full lg:table">
              <thead className="bg-surface-muted text-left text-sm text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">{t("columns.customer")}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{t("columns.code")}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{t("columns.level")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{t("columns.points")}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{t("columns.lastPurchase")}</th>
                  <th scope="col" className="px-6 py-3 font-medium">{t("columns.status")}</th>
                  <th aria-hidden className="w-12 pr-6" />
                </tr>
              </thead>
              <tbody className="table-reveal">
                {result.items.map((member) => {
                  const statusKey = getStatusKey(member);
                  const lastPurchase = member.lastPurchaseAt;

                  return (
                    <tr
                      key={member.code}
                      className="relative cursor-pointer border-t border-border transition-colors duration-150 ease-out hover:bg-surface-muted"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/clientes/${encodeURIComponent(member.code)}`}
                          aria-label={t("openCustomer", { name: member.fullName })}
                          className="flex items-center gap-3 rounded-sm after:absolute after:inset-0"
                        >
                          <Avatar name={member.fullName} photoUrl={member.photoUrl} />
                          <span className="flex flex-col">
                            <span className="text-base font-medium text-foreground">{member.fullName}</span>
                            <span className="text-sm text-muted">{member.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm tabular-nums text-foreground">{member.code}</td>
                      <td className="px-4 py-3"><Badge tone={member.tier}>{member.tierName}</Badge></td>
                      <td className="px-4 py-3 text-right text-base tabular-nums text-foreground">{formatPoints(format, member.points)}</td>
                      <td className="px-4 py-3 text-base text-foreground">{lastPurchase ? formatDate(lastPurchase) : t("noLastPurchase")}</td>
                      <td className="px-6 py-3"><Badge tone={statusTones[statusKey]}>{statusLabels(statusKey)}</Badge></td>
                      <td aria-hidden className="pr-6 text-muted"><ChevronRight strokeWidth={1.75} className="size-5" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ul className="row-reveal lg:hidden">
              {result.items.map((member) => {
                const statusKey = getStatusKey(member);

                return (
                  <li key={member.code} className="border-t border-border first:border-t-0">
                    <Link
                      href={`/clientes/${encodeURIComponent(member.code)}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-surface-muted"
                    >
                      <Avatar name={member.fullName} photoUrl={member.photoUrl} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base font-medium text-foreground">{member.fullName}</span>
                        <span className="flex items-center gap-2 text-sm text-muted">
                          <span className="font-mono tabular-nums">{member.code}</span>
                          <span aria-hidden className="size-1 rounded-full bg-border-strong" />
                          <span>{member.tierName}</span>
                        </span>
                      </span>
                      <Badge tone={statusTones[statusKey]}>{statusLabels(statusKey)}</Badge>
                      <ChevronRight aria-hidden strokeWidth={1.75} className="size-5 shrink-0 text-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
      {result.items.length > 0 ? (
        <Pagination
          className="mt-4"
        pathname="/clientes"
        params={{ q: query, level: level ? String(level.id) : undefined, status: status }}
        page={result.page}
        pageCount={result.pageCount}
        summary={t("range", { from, to, total: result.total })}
        />
      ) : null}
      </Reveal>
    </>
  );
}
