import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { countMembers, listMembers } from "@/lib/api/members";
import { listMovements } from "@/lib/api/purchases";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const instant = false;

const listLimit = 5;
const expiringPoolSize = 50;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.dashboard");

  return { title: t("metaTitle") };
}

export default async function DashboardPage() {
  await connection();
  const user = await requireSession();
  const t = await getTranslations("business.dashboard");
  const format = await getFormatter();

  const [counts, movements, expiringPool] = await Promise.all([
    countMembers(),
    listMovements({ period: "30d", page: 1, pageSize: listLimit }),
    listMembers({ status: "expiring", page: 1, pageSize: expiringPoolSize }),
  ]);

  const { summary } = movements;
  const recentPurchases = movements.page.items.slice(0, listLimit);
  const expiring = [...expiringPool.items]
    .sort((first, second) => first.validUntil.localeCompare(second.validUntil))
    .slice(0, listLimit);

  const membershipRows = [
    { key: "active", count: counts.active, dot: "bg-success" },
    { key: "expiring", count: counts.expiring, dot: "bg-warning" },
    { key: "expired", count: counts.expired, dot: "bg-danger" },
    { key: "cancelled", count: counts.cancelled, dot: "bg-border-strong" },
  ] as const;

  const formatDate = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short" });
  const formatTime = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  const viewAllClasses = buttonStyles({ variant: "ghost", size: "sm", className: "shrink-0" });

  return (
    <>
      <Reveal>
        <PageHeader title={t("title")} subtitle={t("subtitle", { business: user.businessName })} />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal index={1} className="lg:col-span-2">
          <section className="flex h-full flex-col justify-between gap-8 rounded-lg border border-border bg-surface p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium text-muted">{t("collected.label")}</h2>
              <p className="font-display text-display font-semibold tabular-nums text-foreground">
                {formatMoney(format, summary.collectedCents)}
              </p>
              <p className="text-base text-muted">{t("collected.purchases", { count: summary.count })}</p>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted">{t("collected.discounts")}</dt>
                <dd className="font-display text-subheading font-semibold tabular-nums text-foreground">
                  {formatMoney(format, summary.discountCents)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted">{t("collected.cashbackUsed")}</dt>
                <dd className="font-display text-subheading font-semibold tabular-nums text-foreground">
                  {formatMoney(format, summary.cashbackUsedCents)}
                </dd>
              </div>
            </dl>
          </section>
        </Reveal>

        <Reveal index={2}>
          <section className="flex h-full flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-subheading text-foreground">{t("memberships.title")}</h2>
                <p className="text-sm text-muted">{t("memberships.total", { count: counts.all })}</p>
              </div>
              <Link href="/membresias" className={viewAllClasses}>
                {t("memberships.viewAll")}
              </Link>
            </div>
            <ul className="flex flex-col gap-3">
              {membershipRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3 text-base text-foreground">
                    <span aria-hidden className={cx("size-2 rounded-full", row.dot)} />
                    {t(`memberships.${row.key}`)}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {format.number(row.count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal index={3}>
          <section className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
              <h2 className="text-subheading text-foreground">{t("recent.title")}</h2>
              <Link href="/movimientos" className={viewAllClasses}>
                {t("recent.viewAll")}
              </Link>
            </div>
            {recentPurchases.length === 0 ? (
              <div className="flex flex-col gap-1 border-t border-border px-6 py-8">
                <p className="text-base font-medium text-foreground">{t("recent.emptyTitle")}</p>
                <p className="text-sm text-muted">{t("recent.emptyDescription")}</p>
              </div>
            ) : (
              <ul>
                {recentPurchases.map((purchase) => (
                  <li key={purchase.id} className="border-t border-border">
                    <Link
                      href={`/clientes/${encodeURIComponent(purchase.memberCode)}`}
                      className="flex items-center gap-3 px-6 py-3 transition-colors duration-150 ease-out hover:bg-surface-muted"
                    >
                      <Avatar name={purchase.memberName} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base font-medium text-foreground">{purchase.memberName}</span>
                        <span className="truncate text-sm text-muted">
                          {purchase.concept || purchase.memberCode}
                        </span>
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
          </section>
        </Reveal>

        <Reveal index={4}>
          <section className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
              <h2 className="text-subheading text-foreground">{t("expiring.title")}</h2>
              <Link href="/membresias?tab=expiring" className={viewAllClasses}>
                {t("expiring.viewAll")}
              </Link>
            </div>
            {expiring.length === 0 ? (
              <div className="border-t border-border px-6 py-8">
                <p className="text-sm text-muted">{t("expiring.empty")}</p>
              </div>
            ) : (
              <ul>
                {expiring.map((member) => (
                  <li key={member.id} className="border-t border-border">
                    <Link
                      href={`/clientes/${encodeURIComponent(member.code)}`}
                      className="flex items-center gap-3 px-6 py-3 transition-colors duration-150 ease-out hover:bg-surface-muted"
                    >
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
          </section>
        </Reveal>
      </div>
    </>
  );
}
