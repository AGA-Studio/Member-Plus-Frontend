import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { EditLevelDialog } from "@/features/business/edit-level-dialog";
import { listLevels } from "@/lib/api/levels";
import { cx } from "@/lib/cx";
import type { Tier } from "@/lib/domain";
import { formatMoney } from "@/lib/format";
import { revealClasses } from "@/lib/motion";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.levels");

  return { title: t("metaTitle") };
}

const swatchClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze text-tier-bronze-foreground",
  silver: "bg-tier-silver text-tier-silver-foreground",
  gold: "bg-tier-gold text-tier-gold-foreground",
  onyx: "bg-tier-onyx text-tier-onyx-foreground",
};

export default async function LevelsPage() {
  await connection();
  const t = await getTranslations("business.levels");
  const format = await getFormatter();
  const levels = await listLevels();

  return (
    <>
      <Reveal>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal index={1}>
        <Alert tone="info">{t("notice")}</Alert>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {levels.map((level, index) => {
          const rows = [
            { label: t("rows.price"), value: level.priceCents === 0 ? t("free") : formatMoney(format, level.priceCents) },
            { label: t("rows.discount"), value: format.number(level.benefits.discountPercent / 100, { style: "percent" }) },
            { label: t("rows.pointsPerTen"), value: t("pointsPerTenValue", { count: level.benefits.pointsPerTenPesos }) },
            { label: t("rows.cashback"), value: format.number(level.benefits.cashbackPercent / 100, { style: "percent" }) },
          ];

          return (
            <li key={level.id} className={cx(revealClasses(index + 2), "flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm")}>
              <div className={cx("flex h-24 items-center px-5", swatchClasses[level.tier])}>
                <h2 className="text-heading">{level.name}</h2>
              </div>
              <dl className="flex flex-1 flex-col gap-3 p-5">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-muted">{row.label}</dt>
                    <dd className="text-base font-medium tabular-nums text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                <span className="text-sm text-muted">{t("customers", { count: level.customersCount })}</span>
                <EditLevelDialog level={level} tierLabel={level.name} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
