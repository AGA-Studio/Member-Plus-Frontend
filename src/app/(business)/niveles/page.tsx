import type { Metadata } from "next";
import { Banknote, Gift, Percent, Wallet } from "lucide-react";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { InView } from "@/components/ui/in-view";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { KpiGrid, type KpiItem } from "@/features/business/dashboard-parts";
import { LevelCard } from "@/features/business/level-card";
import { listLevels } from "@/lib/api/levels";
import type { Level } from "@/lib/domain";
import { requireUser } from "@/lib/session";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.levels");

  return { title: t("metaTitle") };
}

const moneyOptions = { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" } as const;

function weightedAverage(levels: Level[], read: (level: Level) => number): number {
  const total = levels.reduce((sum, level) => sum + level.customersCount, 0);
  if (total === 0) return 0;

  return levels.reduce((sum, level) => sum + read(level) * level.customersCount, 0) / total;
}

function best(levels: Level[], read: (level: Level) => number): Level | null {
  return levels.reduce<Level | null>((top, level) => (!top || read(level) > read(top) ? level : top), null);
}

export default async function LevelsPage() {
  await connection();
  await requireUser(["admin"]);
  const t = await getTranslations("business.levels");
  const format = await getFormatter();
  const levels = await listLevels();

  const totalCustomers = levels.reduce((sum, level) => sum + level.customersCount, 0);
  const payingCustomers = levels.reduce((sum, level) => (level.priceCents > 0 ? sum + level.customersCount : sum), 0);
  const revenueCents = levels.reduce((sum, level) => sum + level.priceCents * level.customersCount, 0);
  const averageDiscount = weightedAverage(levels, (level) => level.benefits.discountPercent);
  const averageCashback = weightedAverage(levels, (level) => level.benefits.cashbackPercent);
  const topDiscount = best(levels, (level) => level.benefits.discountPercent);
  const topCashback = best(levels, (level) => level.benefits.cashbackPercent);
  const popular = totalCustomers > 0 ? best(levels, (level) => level.customersCount) : null;
  const percentOf = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));
  const percentOptions = { style: "percent", maximumFractionDigits: 1 } as const;

  const kpis: KpiItem[] = [
    {
      key: "paying",
      icon: Banknote,
      tone: "success",
      label: t("kpi.paying.label"),
      value: <AnimatedNumber value={payingCustomers} />,
      hint: t("kpi.paying.hint", { percent: percentOf(payingCustomers, totalCustomers), total: totalCustomers }),
    },
    {
      key: "revenue",
      icon: Wallet,
      label: t("kpi.revenue.label"),
      value: <AnimatedNumber value={revenueCents} divisor={100} options={moneyOptions} />,
      hint: t("kpi.revenue.hint"),
    },
    {
      key: "discount",
      icon: Percent,
      tone: "warning",
      label: t("kpi.discount.label"),
      value: <AnimatedNumber value={averageDiscount} divisor={100} options={percentOptions} />,
      hint: t("kpi.discount.hint", {
        max: format.number((topDiscount?.benefits.discountPercent ?? 0) / 100, { style: "percent", maximumFractionDigits: 1 }),
        level: topDiscount?.name ?? "",
      }),
    },
    {
      key: "cashback",
      icon: Gift,
      label: t("kpi.cashback.label"),
      value: <AnimatedNumber value={averageCashback} divisor={100} options={percentOptions} />,
      hint: t("kpi.cashback.hint", {
        max: format.number((topCashback?.benefits.cashbackPercent ?? 0) / 100, { style: "percent", maximumFractionDigits: 1 }),
        level: topCashback?.name ?? "",
      }),
    },
  ];

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>

      <KpiGrid items={kpis} />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {levels.map((level, index) => (
          <li key={level.id}>
            <InView index={index}>
              <LevelCard
                level={level}
                sharePercent={percentOf(level.customersCount, totalCustomers)}
                popular={popular?.id === level.id}
              />
            </InView>
          </li>
        ))}
      </ul>
    </>
  );
}
