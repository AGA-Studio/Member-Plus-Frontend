import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Check, Star, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { findReceipt } from "@/lib/api/purchases";
import {
  formatDiscount,
  formatMoney,
  formatPoints,
  formatPositiveMoney,
  formatSignedPoints,
} from "@/lib/format";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cashier.receipt");

  return { title: t("metaTitle") };
}

export default async function ReceiptPage({ params }: PageProps<"/caja/comprobante/[id]">) {
  await connection();
  const { id } = await params;
  const receipt = await findReceipt(id);

  if (!receipt) notFound();

  const t = await getTranslations("cashier.receipt");
  const tiers = await getTranslations("tiers");
  const format = await getFormatter();
  const { breakdown } = receipt;

  const createdAt = format.dateTime(new Date(receipt.createdAt), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const isToday =
    format.dateTime(new Date(receipt.createdAt), { year: "numeric", month: "numeric", day: "numeric" }) ===
    format.dateTime(new Date(), { year: "numeric", month: "numeric", day: "numeric" });

  const rows = [
    { label: t("date"), value: isToday ? t("todayDate", { date: createdAt }) : createdAt },
    { label: t("customer"), value: receipt.memberName },
    { label: t("concept"), value: receipt.concept || t("noConcept") },
    { label: t("amount"), value: formatMoney(format, breakdown.amountCents) },
    {
      label: t("discount", {
        tier: tiers(receipt.tier),
        percent: receipt.discountPercent,
      }),
      value: formatDiscount(format, breakdown.discountCents),
      positive: true,
    },
    ...(breakdown.cashbackAppliedCents > 0
      ? [
          {
            label: t("cashbackUsed"),
            value: formatDiscount(format, breakdown.cashbackAppliedCents),
            positive: true,
          },
        ]
      : []),
  ];

  const balances = [
    {
      icon: Star,
      gained: formatSignedPoints(format, breakdown.pointsEarned) + " " + t("pointsUnit"),
      label: t("pointsBalance"),
      value: formatPoints(format, receipt.pointsAfter),
    },
    {
      icon: Wallet,
      gained: formatPositiveMoney(format, breakdown.cashbackEarnedCents),
      label: t("cashbackBalance"),
      value: formatMoney(format, receipt.cashbackBalanceAfterCents),
    },
  ];

  return (
    <article className="mx-auto flex w-full max-w-form flex-col overflow-hidden rounded-xl bg-surface shadow-md sm:max-w-xl">
      <header className="flex flex-col items-center gap-2 bg-brand px-6 py-10 text-center text-white">
        <span className="flex size-14 items-center justify-center rounded-full border border-white">
          <Check aria-hidden strokeWidth={1.75} className="size-7" />
        </span>
        <h1 className="font-display text-subheading font-semibold">{t("title")}</h1>
        <p className="font-display text-display font-bold tabular-nums">
          {formatMoney(format, breakdown.totalCents)}
        </p>
        <p className="text-base text-white/90">{t("chargedTo", { name: receipt.memberName })}</p>
      </header>

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <dl className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-base text-muted">{row.label}</dt>
              <dd
                className={
                  row.positive
                    ? "text-right text-base font-medium tabular-nums text-success-text"
                    : "text-right text-base font-medium tabular-nums text-foreground"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <dt className="text-base font-medium text-foreground">{t("total")}</dt>
            <dd className="font-display text-heading font-semibold tabular-nums text-foreground">
              {formatMoney(format, breakdown.totalCents)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">{t("newBalance")}</p>
        <div className="grid grid-cols-2 gap-3">
          {balances.map(({ icon: Icon, gained, label, value }) => (
            <section key={label} className="flex flex-col gap-2 rounded-lg bg-surface-muted p-4">
              <Badge tone="success" className="self-start">
                {gained}
              </Badge>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {label}
              </p>
              <p className="font-display text-heading font-semibold tabular-nums text-foreground">
                {value}
              </p>
            </section>
          ))}
        </div>
        </div>

        <Link href="/caja" className={buttonStyles({ size: "xl", fullWidth: true })}>
          {t("another")}
        </Link>
      </div>
    </article>
  );
}
