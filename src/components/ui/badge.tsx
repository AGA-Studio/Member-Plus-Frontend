import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "bronze"
  | "silver"
  | "gold"
  | "onyx";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  primary: "bg-primary-soft text-primary-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
  bronze: "bg-tier-bronze text-tier-bronze-foreground",
  silver: "bg-tier-silver text-tier-silver-foreground",
  gold: "bg-tier-gold text-tier-gold-foreground",
  onyx: "bg-tier-onyx text-tier-onyx-foreground",
};

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
