import type { ReactNode } from "react";
import type { Tier } from "@/lib/domain";

export type DonutSlice = { id: string; tier: Tier; value: number };

type DonutChartProps = {
  slices: DonutSlice[];
  total: number;
  center: ReactNode;
  label: string;
};

const radius = 40;
const circumference = 2 * Math.PI * radius;
const gap = 1.5;

export const tierStrokeClasses: Record<Tier, string> = {
  bronze: "stroke-tier-bronze-solid",
  silver: "stroke-tier-silver-solid",
  gold: "stroke-tier-gold-solid",
  onyx: "stroke-tier-onyx-solid",
};

export const tierDotClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze-solid",
  silver: "bg-tier-silver-solid",
  gold: "bg-tier-gold-solid",
  onyx: "bg-tier-onyx-solid",
};

export function DonutChart({ slices, total, center, label }: DonutChartProps) {
  const visible = slices.filter((slice) => slice.value > 0);
  let offset = 0;

  return (
    <div className="relative size-44 shrink-0">
      <svg role="img" aria-label={label} viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx={50} cy={50} r={radius} fill="none" strokeWidth={11} className="stroke-surface-muted" />
        <g className="chart-pop">
          {total > 0
            ? visible.map((slice) => {
                const length = (slice.value / total) * circumference;
                const dash = Math.max(length - (visible.length > 1 ? gap : 0), 0.5);
                const circle = (
                  <circle
                    key={slice.id}
                    cx={50}
                    cy={50}
                    r={radius}
                    fill="none"
                    strokeWidth={11}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    className={tierStrokeClasses[slice.tier]}
                  />
                );
                offset += length;
                return circle;
              })
            : null}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
    </div>
  );
}
