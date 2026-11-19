"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "@/lib/cx";
import { AnimatedNumber } from "./animated-number";
import { areaPath, linePath, niceCeiling, type Point } from "@/lib/dashboard";

export type AreaRange = 7 | 30 | 90;

export type AreaDatum = { key: string; revenueCents: number; count: number };

type AreaChartProps = {
  series: AreaDatum[];
  ranges: AreaRange[];
  initialRange: AreaRange;
};

const height = 264;
const margin = { top: 16, right: 16, bottom: 30, left: 56 };
const tooltipWidth = 152;
const tooltipHeight = 58;
const tooltipGap = 14;
const gridLines = 4;
const wideTicks = 5;
const narrowTicks = 3;
const narrowWidth = 480;

const currencyOptions = { style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol" } as const;

function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function AreaChart({ series, ranges, initialRange }: AreaChartProps) {
  const t = useTranslations("business.dashboard.chart");
  const format = useFormatter();
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState<AreaRange>(initialRange);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => series.slice(-range), [range, series]);
  const total = useMemo(() => data.reduce((sum, point) => sum + point.revenueCents, 0), [data]);
  const count = useMemo(() => data.reduce((sum, point) => sum + point.count, 0), [data]);
  const max = niceCeiling(Math.max(...data.map((point) => point.revenueCents), 0));
  const innerWidth = Math.max(width - margin.left - margin.right, 0);
  const innerHeight = height - margin.top - margin.bottom;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = useMemo<Point[]>(
    () =>
      data.map((point, index) => ({
        x: margin.left + index * step,
        y: margin.top + innerHeight - (point.revenueCents / max) * innerHeight,
      })),
    [data, innerHeight, max, step],
  );

  const baseline = margin.top + innerHeight;
  const hasData = data.some((point) => point.revenueCents > 0);
  const tickIndexes = useMemo(() => {
    const ticks = Math.min(width < narrowWidth ? narrowTicks : wideTicks, data.length);

    return Array.from(new Set(Array.from({ length: ticks }, (_, index) => Math.round((index * (data.length - 1)) / Math.max(ticks - 1, 1)))));
  }, [data.length, width]);

  function money(cents: number): string {
    return format.number(cents / 100, currencyOptions);
  }

  function axisMoney(cents: number): string {
    return format.number(cents / 100, { ...currencyOptions, notation: "compact", maximumFractionDigits: 1 });
  }

  function dayLabel(key: string, long = false): string {
    return format.dateTime(
      parseKey(key),
      long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" },
    );
  }

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    if (data.length === 0 || step === 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const index = Math.round((event.clientX - bounds.left) / step);
    setHovered(Math.min(Math.max(index, 0), data.length - 1));
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setHovered((current) => Math.min((current ?? -1) + 1, data.length - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setHovered((current) => Math.max((current ?? data.length) - 1, 0));
    } else if (event.key === "Escape") {
      setHovered(null);
    }
  }

  const active = hovered !== null ? data[hovered] : null;
  const activePoint = hovered !== null ? points[hovered] : null;
  let tooltipX = 0;
  let tooltipY = 0;
  if (activePoint) {
    tooltipX = Math.min(Math.max(activePoint.x - tooltipWidth / 2, margin.left), width - margin.right - tooltipWidth);
    tooltipY = activePoint.y - tooltipHeight - tooltipGap;
    if (tooltipY < 0) tooltipY = activePoint.y + tooltipGap;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">{t("total")}</p>
          <p className="font-display text-display font-semibold tabular-nums text-foreground"><AnimatedNumber value={total} divisor={100} options={currencyOptions} />
          </p>
          <p className="text-sm text-muted">{t("purchases", { count })}</p>
        </div>
        <div
          role="radiogroup"
          aria-label={t("rangeGroup")}
          className="flex rounded-md bg-surface-muted p-1"
        >
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={range === option}
              onClick={() => {
                setRange(option);
                setHovered(null);
              }}
              className={cx(
                "h-9 rounded-sm px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-97",
                range === option ? "bg-surface text-foreground shadow-xs" : "text-muted hover:text-foreground",
              )}
            >
              {t(`ranges.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        {width > 0 ? (
          <svg
            role="img"
            aria-label={t("chart")}
            tabIndex={0}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            onKeyDown={handleKeyDown}
            onBlur={() => setHovered(null)}
            className="block overflow-visible rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            <defs>
              <linearGradient id={gradientId} x1={0} x2={0} y1={0} y2={1} className="text-primary">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>

            {Array.from({ length: gridLines + 1 }, (_, index) => {
              const value = (max / gridLines) * index;
              const y = margin.top + innerHeight - (index / gridLines) * innerHeight;

              return (
                <g key={index}>
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={y}
                    y2={y}
                    strokeDasharray={index === 0 ? undefined : "3 5"}
                    className={index === 0 ? "stroke-border-strong" : "stroke-border"}
                  />
                  <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-muted text-xs tabular-nums">
                    {axisMoney(value)}
                  </text>
                </g>
              );
            })}

            {tickIndexes.map((index) => (
              <text
                key={index}
                x={points[index]?.x ?? 0}
                y={height - 8}
                textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
                className="fill-muted text-xs"
              >
                {dayLabel(data[index].key)}
              </text>
            ))}

            <g key={range}>
              {hasData ? (
                <>
                  <path d={areaPath(points, baseline)} fill={`url(#${gradientId})`} className="chart-fade" />
                  <path
                    d={linePath(points)}
                    pathLength={1}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="chart-draw fill-none stroke-primary"
                  />
                </>
              ) : (
                <text
                  x={margin.left + innerWidth / 2}
                  y={margin.top + innerHeight / 2}
                  textAnchor="middle"
                  className="fill-muted text-base"
                >
                  {t("empty")}
                </text>
              )}
            </g>

            {active && activePoint ? (
              <g aria-hidden pointerEvents="none">
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={margin.top}
                  y2={baseline}
                  strokeDasharray="3 4"
                  className="stroke-border-strong"
                />
                <circle cx={activePoint.x} cy={activePoint.y} r={5} strokeWidth={2.5} className="fill-surface stroke-primary" />
                <g transform={`translate(${tooltipX} ${tooltipY})`}>
                  <rect width={tooltipWidth} height={tooltipHeight} rx={10} className="fill-ink-900 stroke-white/10" />
                  <text x={12} y={21} className="fill-ink-300 text-xs">
                    {dayLabel(active.key, true)}
                  </text>
                  <text x={12} y={41} className="fill-white text-sm font-semibold tabular-nums">
                    {money(active.revenueCents)}
                  </text>
                  <text x={tooltipWidth - 12} y={41} textAnchor="end" className="fill-ink-300 text-xs">
                    {t("tooltipPurchases", { count: active.count })}
                  </text>
                </g>
              </g>
            ) : null}

            <rect
              x={margin.left - step / 2}
              y={0}
              width={innerWidth + step}
              height={height}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
              onPointerLeave={() => setHovered(null)}
            />
          </svg>
        ) : (
          <div className="h-66" />
        )}
      </div>

      <table className="sr-only">
        <caption>{t("chart")}</caption>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <th scope="row">{dayLabel(point.key, true)}</th>
              <td>{money(point.revenueCents)}</td>
              <td>{t("tooltipPurchases", { count: point.count })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
