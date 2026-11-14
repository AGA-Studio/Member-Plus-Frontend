import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Pagination } from "@/components/ui/pagination";
import { buttonStyles } from "@/components/ui/button";
import { FilterBar } from "@/features/business/filter-bar";
import { getStatusKey, readParam, statusTones } from "@/features/business/member-status";
import { NewMembershipDialog } from "@/features/business/new-membership-dialog";
import { listLevels } from "@/lib/api/levels";
import { listMembers } from "@/lib/api/members";
import { parsePage } from "@/lib/api/paginate";
import type { MemberStatus } from "@/lib/domain";
import { formatPoints } from "@/lib/format";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.customers");

  return { title: t("metaTitle") };
}

const statusFilters = ["active", "expiring", "expired", "cancelled"] as const;

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
  const result = await listMembers({
    query,
    levelId: level?.id,
    status: status as MemberStatus | "expiring" | undefined,
    page: requestedPage,
  });
  const filtered = Boolean(query || level || status);
  const from = (result.page - 1) * result.pageSize + 1;
  const to = from + result.items.length - 1;

  const formatDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short" });

  return (
    <>
      <Reveal>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle", { count: result.total })}
          actions={
            <NewMembershipDialog
              triggerLabel={t("newMembership")}
              triggerClassName={buttonStyles({ size: "md" })}
              levelOptions={levelOptions}
            />
          }
        />
      </Reveal>
      <Reveal index={1}>
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
      <Reveal index={2}>
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
              <tbody>
                {result.items.map((member) => {
                  const statusKey = getStatusKey(member);
                  const lastPurchase = member.lastPurchaseAt;

                  return (
                    <tr key={member.code} className="border-t border-border transition-colors duration-150 ease-out hover:bg-surface-muted">
                      <td className="px-6 py-3">
                        <Link
                          href={`/clientes/${encodeURIComponent(member.code)}`}
                          aria-label={t("openCustomer", { name: member.fullName })}
                          className="flex items-center gap-3 rounded-sm"
                        >
                          <Avatar name={member.fullName} />
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
            <ul className="lg:hidden">
              {result.items.map((member) => {
                const statusKey = getStatusKey(member);

                return (
                  <li key={member.code} className="border-t border-border first:border-t-0">
                    <Link
                      href={`/clientes/${encodeURIComponent(member.code)}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-surface-muted"
                    >
                      <Avatar name={member.fullName} />
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
            <div className="border-t border-border">
              <Pagination
                pathname="/clientes"
                params={{ q: query, level: level ? String(level.id) : undefined, status: status }}
                page={result.page}
                pageCount={result.pageCount}
                summary={t("range", { from, to, total: result.total })}
              />
            </div>
          </>
        )}
      </section>
      </Reveal>
    </>
  );
}
