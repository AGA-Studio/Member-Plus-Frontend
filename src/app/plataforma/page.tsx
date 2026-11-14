import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import { FilterBar } from "@/features/business/filter-bar";
import { readParam } from "@/features/business/member-status";
import { parsePage } from "@/lib/api/paginate";
import { listBusinesses } from "@/lib/api/platform";
import { businessStatuses, type BusinessStatus } from "@/lib/domain";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform");

  return { title: t("metaTitle") };
}

const statusTones: Record<BusinessStatus, BadgeTone> = {
  trial: "primary",
  active: "success",
  suspended: "danger",
};

export default async function PlatformPage({ searchParams }: PageProps<"/plataforma">) {
  await connection();
  const params = await searchParams;
  const query = readParam(params.q);
  const status = businessStatuses.find((item) => item === readParam(params.status));
  const requestedPage = parsePage(readParam(params.page));

  const t = await getTranslations("platform");
  const statusLabels = await getTranslations("platform.status");
  const format = await getFormatter();
  const result = await listBusinesses({ query, status, page: requestedPage });
  const filtered = Boolean(query || status);
  const from = (result.page - 1) * result.pageSize + 1;
  const to = from + result.items.length - 1;

  const formatDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" });

  const pagination = (
    <Pagination
      pathname="/plataforma"
      params={{ q: query, status }}
      page={result.page}
      pageCount={result.pageCount}
      summary={t("range", { from, to, total: result.total })}
    />
  );

  return (
    <>
      <Reveal className="flex flex-col gap-1">
        <h1 className="text-title text-foreground">{t("title")}</h1>
        <p className="text-base text-muted">{t("subtitle", { count: result.total })}</p>
      </Reveal>
      <Reveal index={1}>
        <FilterBar
          searchLabel={t("searchLabel")}
          searchPlaceholder={t("searchPlaceholder")}
          filters={[
            {
              name: "status",
              label: t("filters.status"),
              allLabel: t("filters.allStatuses"),
              options: businessStatuses.map((item) => ({ value: item, label: statusLabels(item) })),
            },
          ]}
        />
      </Reveal>
      <Reveal index={2}>
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none">
          {result.items.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={filtered ? t("noResults.title") : t("empty.title")}
              description={filtered ? t("noResults.description") : t("empty.description")}
            />
          ) : (
            <>
              <table className="hidden w-full sm:table">
                <thead className="bg-surface-muted text-left text-sm text-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t("columns.business")}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{t("columns.status")}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t("columns.customers")}</th>
                    <th scope="col" className="px-6 py-3 text-right font-medium">{t("columns.createdAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((business) => (
                    <tr key={business.id} className="border-t border-border">
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={business.name} />
                          <span className="text-base font-medium text-foreground">{business.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTones[business.status]}>{statusLabels(business.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-base tabular-nums text-foreground">
                        {format.number(business.customersCount)}
                      </td>
                      <td className="px-6 py-3 text-right text-base text-muted">{formatDate(business.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="sm:hidden">
                {result.items.map((business) => (
                  <li key={business.id} className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
                    <Avatar name={business.name} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-medium text-foreground">{business.name}</span>
                      <span className="text-sm text-muted">
                        {t("customersCount", { count: business.customersCount })}
                      </span>
                    </span>
                    <Badge tone={statusTones[business.status]}>{statusLabels(business.status)}</Badge>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border">{pagination}</div>
            </>
          )}
        </section>
      </Reveal>
    </>
  );
}
