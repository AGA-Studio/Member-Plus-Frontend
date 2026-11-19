import { cx } from "@/lib/cx";

export type BarDatum = { id: string; label: string; value: number; description: string; highlight?: boolean };

type BarChartProps = {
  data: BarDatum[];
  label: string;
};

const slot = 40;
const barWidth = 24;
const height = 120;
const minimumBar = 3;

export function BarChart({ data, label }: BarChartProps) {
  const max = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <div className="flex flex-col gap-2">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${slot * data.length} ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={0}
            x2={slot * data.length}
            y1={height - height * ratio}
            y2={height - height * ratio}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 4"
            className="stroke-border"
          />
        ))}
        <line
          x1={0}
          x2={slot * data.length}
          y1={height}
          y2={height}
          vectorEffect="non-scaling-stroke"
          className="stroke-border-strong"
        />
        <g className="chart-bars">
          {data.map((datum, index) => {
            const barHeight = datum.value === 0 ? minimumBar : Math.max((datum.value / max) * (height - 8), minimumBar);

            return (
              <rect
                key={datum.id}
                x={index * slot + (slot - barWidth) / 2}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={cx(datum.highlight ? "fill-primary" : "fill-primary/30")}
              >
                <title>{datum.description}</title>
              </rect>
            );
          })}
        </g>
      </svg>
      <div className="text-center text-xs text-muted">
        <div className="flex">
          {data.map((datum) => (
            <span
              key={datum.id}
              className={cx("flex-1 truncate", datum.highlight && "font-semibold text-foreground")}
            >
              {datum.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
