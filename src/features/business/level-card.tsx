import { Percent, Star, Wallet } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { cx } from "@/lib/cx";
import type { Level, Tier } from "@/lib/domain";
import { EditLevelDialog } from "./edit-level-dialog";

type LevelCardProps = {
  level: Level;
  sharePercent: number;
  popular: boolean;
};

const headerClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze text-tier-bronze-foreground",
  silver: "bg-tier-silver text-tier-silver-foreground",
  gold: "bg-tier-gold text-tier-gold-foreground",
  onyx: "bg-tier-onyx text-tier-onyx-foreground",
};

const shineClasses: Record<Tier, string> = {
  bronze: "tier-shine-bronze",
  silver: "tier-shine-silver",
  gold: "tier-shine-gold",
  onyx: "tier-shine-onyx",
};

const shareClasses: Record<Tier, string> = {
  bronze: "fill-tier-bronze-solid",
  silver: "fill-tier-silver-solid",
  gold: "fill-tier-gold-solid",
  onyx: "fill-tier-onyx-solid",
};

const moneyOptions = { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" } as const;

export async function LevelCard({ level, sharePercent, popular }: LevelCardProps) {
  const t = await getTranslations("business.levels");
  const format = await getFormatter();

  const benefits = [
    {
      key: "discount",
      icon: Percent,
      value: format.number(level.benefits.discountPercent / 100, { style: "percent", maximumFractionDigits: 1 }),
    },
    {
      key: "cashback",
      icon: Wallet,
      value: format.number(level.benefits.cashbackPercent / 100, { style: "percent", maximumFractionDigits: 1 }),
    },
    { key: "points", icon: Star, value: format.number(level.benefits.pointsPerTenPesos) },
  ] as const;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <header className={cx("flex min-h-32 items-start justify-between gap-3 p-5", headerClasses[level.tier])}>
        <h2 data-text={level.name} className={cx("font-display text-display font-bold", shineClasses[level.tier])}>
          {level.name}
        </h2>
        {popular ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-900">
            <Star aria-hidden strokeWidth={2} className="size-3" />
            {t("card.popular")}
          </span>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted">{t("customers", { count: level.customersCount })}</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {t("card.share", { percent: sharePercent })}
            </span>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
            className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
          >
            <g className="chart-spread">
              <rect x={0} y={0} width={sharePercent} height={6} className={shareClasses[level.tier]} />
            </g>
          </svg>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          {benefits.map(({ key, icon: Icon, value }) => (
            <div key={key} className="flex flex-col gap-1.5 rounded-md bg-surface-muted p-3">
              <Icon aria-hidden strokeWidth={1.75} className="size-4 text-primary-text" />
              <dd className="font-display text-base font-semibold tabular-nums text-foreground">{value}</dd>
              <dt className="text-xs leading-snug text-muted">{t(`card.benefits.${key}`)}</dt>
            </div>
          ))}
        </dl>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="flex min-w-0 flex-col">
          <p className="font-display text-heading font-semibold tabular-nums text-foreground">
            {level.priceCents === 0 ? (
              t("free")
            ) : (
              <AnimatedNumber value={level.priceCents} divisor={100} options={moneyOptions} />
            )}
          </p>
          <p className="text-xs text-muted">{t("card.perMembership")}</p>
        </div>
        <EditLevelDialog level={level} tierLabel={level.name} />
      </footer>
    </article>
  );
}
