import type { Metadata } from "next";
import { ChevronRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkTabs } from "@/components/ui/link-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/features/business/filter-bar";
import { getStatusKey, readParam, statusTones } from "@/features/business/member-status";
import { NewMembershipDialog } from "@/features/business/new-membership-dialog";
import { listLevels } from "@/lib/api/levels";
import { countMembers, listMembers } from "@/lib/api/members";
import { parsePage } from "@/lib/api/paginate";
import type { MemberStatus } from "@/lib/domain";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.memberships");

  return { title: t("metaTitle") };
}

const tabKeys = ["all", "active", "expiring", "cancelled"] as const;
type TabKey = (typeof tabKeys)[number];

export default async function MembershipsPage({ searchParams }: PageProps<"/membresias">) {
  await connection();
  const params = await searchParams;
  const query = readParam(params.q);
  const tab: TabKey = tabKeys.find((item) => item === readParam(params.tab)) ?? "all";
  const requestedPage = parsePage(readParam(params.page));

  const t = await getTranslations("business.memberships");
  const statusLabels = await getTranslations("memberStatus");
  const format = await getFormatter();
  const levels = await listLevels();
  const level = levels.find((item) => String(item.id) === readParam(params.level));
  const levelOptions = levels.map((item) => ({ value: String(item.id), label: item.name }));
  const levelPrices = levels.map((item) => ({ value: String(item.id), label: item.name, priceCents: item.priceCents }));
  const counts = await countMembers();
  const result = await listMembers({
    query,
    levelId: level?.id,
    status: tab === "all" ? undefined : (tab as MemberStatus | "expiring"),
    page: requestedPage,
  });
  const filtered = Boolean(query || level || tab !== "all");
  const from = (result.page - 1) * result.pageSize + 1;
  const to = from + result.items.length - 1;

  const tabHref = (key: TabKey) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (level) search.set("level", String(level.id));
    if (key !== "all") search.set("tab", key);
    const queryString = search.toString();
    return queryString ? `/membresias?${queryString}` : "/membresias";
  };

  const formatDay = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <>
      <Reveal>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Link href="/membresias/imprimir" className={buttonStyles({ variant: "outline" })}>
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
      <Reveal index={1}>
      <LinkTabs
        label={t("tabsLabel")}
        tabs={tabKeys.map((key) => ({
          href: tabHref(key),
          label: t(`tabs.${key}`, { count: counts[key] }),
          active: key === tab,
        }))}
      />
      </Reveal>
      <Reveal index={2}>
      <FilterBar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            name: "level",
            label: t("levelFilter"),
            allLabel: t("allLevels"),
            options: levelOptions,
          },
        ]}
      />
      </Reveal>
      <Reveal index={3}>
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none">
        {result.items.length === 0 ? (
          <EmptyState
            icon={CreditCard}
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
                  <th scope="col" className="px-4 py-3 font-medium">{t("columns.issued")}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{t("columns.expires")}</th>
                  <th scope="col" className="px-6 py-3 font-medium">{t("columns.status")}</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((member) => {
                  const statusKey = getStatusKey(member);

                  return (
                    <tr key={member.code} className="border-t border-border transition-colors duration-150 ease-out hover:bg-surface-muted">
                      <td className="px-6 py-3">
                        <Link href={`/clientes/${encodeURIComponent(member.code)}`} className="flex items-center gap-3 rounded-sm text-base font-medium text-foreground">
                          <Avatar name={member.fullName} />
                          {member.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm tabular-nums text-foreground">{member.code}</td>
                      <td className="px-4 py-3"><Badge tone={member.tier}>{member.tierName}</Badge></td>
                      <td className="px-4 py-3 text-base text-muted">{formatDay(member.issuedAt)}</td>
                      <td className="px-4 py-3 text-base text-foreground">{formatDay(member.validUntil)}</td>
                      <td className="px-6 py-3"><Badge tone={statusTones[statusKey]}>{statusLabels(statusKey)}</Badge></td>
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
                pathname="/membresias"
                params={{ q: query, level: level ? String(level.id) : undefined, tab: tab === "all" ? undefined : tab }}
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
