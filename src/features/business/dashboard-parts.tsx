import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendBadge } from "@/components/charts/trend-badge";
import { InView } from "@/components/ui/in-view";
import { cx } from "@/lib/cx";

export type KpiTone = "primary" | "success" | "warning" | "danger";

const toneClasses: Record<KpiTone, string> = {
  primary: "bg-primary-soft text-primary-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
};

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint: string;
  tone?: KpiTone;
  trend?: { percent: number | null; label: string; hint?: string };
  sparkline?: number[];
};

export function KpiCard({ icon: Icon, label, value, hint, tone = "primary", trend, sparkline }: KpiCardProps) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
            <Icon aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <h2 className="text-sm font-medium text-muted">{label}</h2>
        </div>
        {trend ? <TrendBadge percent={trend.percent} label={trend.label} hint={trend.hint} /> : null}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-heading font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      {sparkline && sparkline.length > 0 ? (
        <Sparkline values={sparkline} className="mt-auto h-10 w-full" />
      ) : null}
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

export type KpiItem = KpiCardProps & { key: string };

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, ...card }, index) => (
        <InView key={key} index={1 + index}>
          <KpiCard {...card} />
        </InView>
      ))}
    </div>
  );
}
