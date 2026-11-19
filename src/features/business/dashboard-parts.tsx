import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendBadge } from "@/components/charts/trend-badge";
import { cx } from "@/lib/cx";

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint: string;
  trend: { percent: number | null; label: string };
  sparkline: number[];
};

export function KpiCard({ icon: Icon, label, value, hint, trend, sparkline }: KpiCardProps) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text">
            <Icon aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <h2 className="text-sm font-medium text-muted">{label}</h2>
        </div>
        <TrendBadge percent={trend.percent} label={trend.label} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-heading font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <Sparkline values={sparkline} className="mt-auto h-10 w-full" />
    </section>
  );
}

type DashCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function DashCard({ title, subtitle, action, className, bodyClassName, children }: DashCardProps) {
  return (
    <section className={cx("flex h-full flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-subheading text-foreground">{title}</h2>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className={cx("flex flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}

type ListCardProps = {
  title: string;
  subtitle?: string;
  action: ReactNode;
  children: ReactNode;
};

export function ListCard({ title, subtitle, action, children }: ListCardProps) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-subheading text-foreground">{title}</h2>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
