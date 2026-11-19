import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cx } from "@/lib/cx";

type TrendBadgeProps = {
  percent: number | null;
  label: string;
  className?: string;
};

export function TrendBadge({ percent, label, className }: TrendBadgeProps) {
  if (percent === null) return null;

  const rounded = Math.round(percent);
  const tone = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const Icon = tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : Minus;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        tone === "up" && "bg-success-soft text-success-text",
        tone === "down" && "bg-danger-soft text-danger-text",
        tone === "flat" && "bg-surface-muted text-muted",
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2} className="size-3.5" />
      {label}
    </span>
  );
}
