import { areaPath, linePath, type Point } from "@/lib/dashboard";

type SparklineProps = {
  values: number[];
  className?: string;
};

const width = 100;
const height = 32;
const padding = 3;

export function Sparkline({ values, className }: SparklineProps) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const points: Point[] = values.map((value, index) => ({
    x: index * step,
    y: height - padding - (value / max) * (height - padding * 2),
  }));

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className ?? "h-10 w-full"}
    >
      <path d={areaPath(points, height)} className="chart-fade fill-primary/10" />
      <path
        d={linePath(points)}
        vectorEffect="non-scaling-stroke"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-wipe fill-none stroke-primary"
      />
    </svg>
  );
}
