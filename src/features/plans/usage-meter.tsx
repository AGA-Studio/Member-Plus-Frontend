import { CircleAlert, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import type { PlanUsageItem } from "@/lib/domain";
import { usageLevel, usagePercent, type UsageLevel } from "@/lib/plan";

type UsageMeterProps = {
  label: string;
  hint?: string;
  item: PlanUsageItem;
  reachedMessage: string;
};

const fillClasses: Record<UsageLevel, string> = {
  ok: "fill-primary",
  near: "fill-warning",
  reached: "fill-danger",
};

export function UsageMeter({ label, hint, item, reachedMessage }: UsageMeterProps) {
  const t = useTranslations("plans.usage");
  const level = usageLevel(item);
  const { used, limit } = item;
  const count = limit === null ? t("countUnlimited", { used }) : t("count", { used, limit });
  const Icon = level === "reached" ? CircleAlert : TriangleAlert;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-sans text-base font-medium tracking-normal text-foreground">{label}</h3>
        <p className="text-base font-semibold tabular-nums text-foreground">{count}</p>
      </div>
      {limit === null ? null : (
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          aria-valuetext={count}
          className="h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          <svg
            aria-hidden
            className={cx(
              "block size-full origin-left transition-[scale] duration-300 ease-out starting:scale-x-0",
              fillClasses[level],
            )}
          >
            <rect width={`${usagePercent(item)}%`} height="100%" />
          </svg>
        </div>
      )}
      {level === "ok" ? null : (
        <p
          className={cx(
            "flex items-start gap-2 text-sm",
            level === "reached" ? "text-danger-text" : "text-warning-text",
          )}
        >
          <Icon aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
          {level === "reached" ? reachedMessage : t("near")}
        </p>
      )}
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
