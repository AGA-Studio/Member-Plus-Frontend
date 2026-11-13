import type { Metadata } from "next";
import { CalendarCheck, ChevronLeft, CreditCard, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkTabs } from "@/components/ui/link-tabs";
import { MembershipCard } from "@/components/ui/membership-card";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import {
  CancelMembershipButton,
  CustomerDialogsProvider,
  EditCustomerButton,
} from "@/features/business/customer-dialogs";
import { getStatusKey, readParam, statusTones } from "@/features/business/member-status";
import { listLevels } from "@/lib/api/levels";
import { findMemberByCode } from "@/lib/api/members";
import { parsePage } from "@/lib/api/paginate";
import { listPurchasesByMember } from "@/lib/api/purchases";
import { cx } from "@/lib/cx";
import {
  formatDiscount,
  formatMoney,
  formatPoints,
  formatPositiveMoney,
  formatSignedPoints,
} from "@/lib/format";
import { revealClasses } from "@/lib/motion";
import { requireUser } from "@/lib/session";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.customer");

  return { title: t("metaTitle") };
}

const tabKeys = ["purchases", "points", "data"] as const;
type TabKey = (typeof tabKeys)[number];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function CustomerPage({
  params,
  searchParams,
}: PageProps<"/clientes/[code]">) {
  await connection();
  const { code } = await params;
  const query = await searchParams;
  const user = await requireUser(["admin"]);
  const member = await findMemberByCode(decodeURIComponent(code));

  if (!member) notFound();

  const t = await getTranslations("business.customer");
  const tierLabels = await getTranslations("tiers");
  const statusLabels = await getTranslations("memberStatus");
  const format = await getFormatter();
  const tab: TabKey = tabKeys.find((item) => item === readParam(query.tab)) ?? "purchases";
  const requestedPage = parsePage(readParam(query.page));
  const [levels, purchases] = await Promise.all([
    listLevels(),
    listPurchasesByMember(member.code, requestedPage),
  ]);
  const statusKey = getStatusKey(member);
  const basePath = `/clientes/${encodeURIComponent(member.code)}`;

  const nextLevel = levels.find((level) => level.minPoints > member.points);
  const lastPurchase = purchases.items[0];
  const formatDay = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const formatShortDay = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short" });
  const from = (purchases.page - 1) * purchases.pageSize + 1;
  const to = from + purchases.items.length - 1;

  const metrics = [
    {
      icon: Star,
      label: t("metrics.points"),
      value: formatPoints(format, member.points),
      hint: nextLevel
        ? t("metrics.toNextLevel", { points: formatPoints(format, nextLevel.minPoints - member.points), tier: tierLabels(nextLevel.tier) })
        : t("metrics.topLevel"),
      mobile: true,
    },
    {
      icon: Wallet,
      label: t("metrics.cashback"),
      value: formatMoney(format, member.cashbackBalanceCents),
      hint: t("metrics.available"),
      mobile: true,
    },
    {
      icon: CalendarCheck,
      label: t("metrics.lastPurchase"),
      value: lastPurchase ? formatShortDay(lastPurchase.createdAt) : t("metrics.noPurchases"),
      hint: lastPurchase ? capitalize(format.relativeTime(new Date(lastPurchase.createdAt), new Date())) : undefined,
      mobile: false,
    },
  ];

  const dataRows = [
    { label: t("data.code"), value: member.code, mono: true },
    { label: t("data.level"), value: tierLabels(member.tier) },
    { label: t("data.since"), value: formatDay(member.issuedAt) },
    { label: t("data.validUntil"), value: formatDay(member.validUntil) },
    { label: t("data.email"), value: member.email },
    { label: t("data.phone"), value: member.phone || "—" },
  ];

  const dataList = (
    <dl className="flex flex-col rounded-lg border border-border bg-surface px-5 py-2 shadow-sm">
      {dataRows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-t-0">
          <dt className="text-sm text-muted">{row.label}</dt>
          <dd className={row.mono ? "font-mono text-sm tabular-nums text-foreground" : "min-w-0 truncate text-base font-medium text-foreground"}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );

  const printLink = (className: string) => (
    <Link
      href={`/membresias/imprimir?code=${encodeURIComponent(member.code)}`}
      className={buttonStyles({ variant: "outline", className })}
    >
      {t("actions.printCard")}
    </Link>
  );

  const isCancelled = member.status === "cancelled";

  return (
    <CustomerDialogsProvider
      code={member.code}
      fullName={member.fullName}
      email={member.email}
      phone={member.phone}
    >
      <Reveal>
        <Link
          href="/clientes"
          className="flex w-fit items-center gap-1 rounded-sm text-base text-muted transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ChevronLeft aria-hidden strokeWidth={1.75} className="size-5" />
          {t("back")}
        </Link>
      </Reveal>

      <Reveal index={1} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-title text-foreground">{member.fullName}</h1>
            <Badge tone={statusTones[statusKey]}>{statusLabels(statusKey)}</Badge>
          </div>
          <p className="flex flex-wrap items-center gap-2 text-base text-muted">
            <span>{member.email}</span>
            {member.phone ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-border-strong" />
                <span>{member.phone}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          {isCancelled ? null : <CancelMembershipButton />}
          {printLink("")}
          <EditCustomerButton />
        </div>
      </Reveal>

      {isCancelled ? <Alert tone="warning">{t("cancelledNotice")}</Alert> : null}
      {member.status === "expired" ? <Alert tone="warning">{t("expiredNotice")}</Alert> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className={cx(revealClasses(2), "flex flex-col gap-6")}>
          <MembershipCard
            tier={member.tier}
            tierLabel={tierLabels(member.tier)}
            businessName={user.businessName}
            memberName={member.fullName}
            code={member.code}
            className={member.status === "active" ? undefined : "opacity-50"}
          />
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <EditCustomerButton />
            {printLink("")}
          </div>
          <div className="hidden lg:block">{dataList}</div>
        </div>

        <div className={cx(revealClasses(3), "flex min-w-0 flex-col gap-6")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {metrics.map(({ icon: Icon, label, value, hint, mobile }) => (
              <div
                key={label}
                className={cx(
                  "flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5",
                  mobile ? "flex" : "hidden sm:flex",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="hidden size-10 items-center justify-center rounded-full bg-primary-soft text-primary-text sm:flex">
                    <Icon aria-hidden strokeWidth={1.75} className="size-5" />
                  </span>
                  <span className="text-sm text-muted">{label}</span>
                </div>
                <p className="font-display text-heading font-semibold tabular-nums text-foreground">{value}</p>
                {hint ? <p className="text-sm text-muted">{hint}</p> : null}
              </div>
            ))}
          </div>

          <LinkTabs
            label={t("tabsLabel")}
            tabs={tabKeys.map((key) => ({
              href: key === "purchases" ? basePath : `${basePath}?tab=${key}`,
              label: t(`tabs.${key}`),
              active: key === tab,
            }))}
          />

          {tab === "data" ? (
            dataList
          ) : (
            <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              {purchases.items.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title={tab === "points" ? t("points.emptyTitle") : t("purchases.emptyTitle")}
                  description={
                    tab === "points"
                      ? t("points.emptyDescription", { name: member.fullName })
                      : t("purchases.emptyDescription", { name: member.fullName })
                  }
                />
              ) : (
                <>
                  <table className="hidden w-full sm:table">
                    <thead className="bg-surface-muted text-left text-sm text-muted">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-medium">{t("purchases.date")}</th>
                        <th scope="col" className="px-4 py-3 font-medium">{t("purchases.concept")}</th>
                        {tab === "points" ? (
                          <>
                            <th scope="col" className="px-4 py-3 text-right font-medium">{t("points.earned")}</th>
                            <th scope="col" className="px-5 py-3 text-right font-medium">{t("points.cashback")}</th>
                          </>
                        ) : (
                          <>
                            <th scope="col" className="px-4 py-3 text-right font-medium">{t("purchases.amount")}</th>
                            <th scope="col" className="px-4 py-3 text-right font-medium">{t("purchases.discount")}</th>
                            <th scope="col" className="px-5 py-3 text-right font-medium">{t("purchases.points")}</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.items.map((purchase) => {
                        const used = purchase.breakdown.cashbackAppliedCents > 0;

                        return (
                          <tr key={purchase.id} className="border-t border-border">
                            <td className="px-5 py-3 text-base text-muted">{formatShortDay(purchase.createdAt)}</td>
                            <td className="px-4 py-3 text-base font-medium text-foreground">{purchase.concept || t("purchases.noConcept")}</td>
                            {tab === "points" ? (
                              <>
                                <td className="px-4 py-3 text-right text-base tabular-nums text-foreground">{formatSignedPoints(format, purchase.breakdown.pointsEarned)}</td>
                                <td className={cx("px-5 py-3 text-right text-base tabular-nums", used ? "text-danger-text" : "text-success-text")}>
                                  {used ? formatDiscount(format, purchase.breakdown.cashbackAppliedCents) : formatPositiveMoney(format, purchase.breakdown.cashbackEarnedCents)}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 text-right text-base tabular-nums text-foreground">{formatMoney(format, purchase.breakdown.amountCents)}</td>
                                <td className="px-4 py-3 text-right text-base tabular-nums text-success-text">{formatDiscount(format, purchase.breakdown.discountCents)}</td>
                                <td className="px-5 py-3 text-right text-base tabular-nums text-foreground">{formatSignedPoints(format, purchase.breakdown.pointsEarned)}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <ul className="sm:hidden">
                    {purchases.items.map((purchase) => (
                      <li key={purchase.id} className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0">
                        <span className="flex flex-col">
                          <span className="text-base font-medium text-foreground">{purchase.concept || t("purchases.noConcept")}</span>
                          <span className="text-sm text-muted">{formatShortDay(purchase.createdAt)}</span>
                        </span>
                        <span className="flex flex-col items-end">
                          <span className="text-base font-medium tabular-nums text-foreground">{formatMoney(format, purchase.breakdown.amountCents)}</span>
                          <span className="text-sm tabular-nums text-muted">{formatSignedPoints(format, purchase.breakdown.pointsEarned)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border">
                    <Pagination
                      pathname={basePath}
                      params={{ tab: tab === "purchases" ? undefined : tab }}
                      page={purchases.page}
                      pageCount={purchases.pageCount}
                      summary={t("purchases.range", { from, to, total: purchases.total })}
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {isCancelled ? null : <CancelMembershipButton className="sm:hidden" />}
        </div>
      </div>
    </CustomerDialogsProvider>
  );
}
