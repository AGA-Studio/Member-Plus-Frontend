"use client";

import { useFormatter } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

type NumberOptions = {
  style?: "decimal" | "currency" | "percent";
  currency?: string;
  currencyDisplay?: "narrowSymbol" | "symbol" | "code";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

type AnimatedNumberProps = {
  value: number;
  divisor?: number;
  options?: NumberOptions;
  className?: string;
};

const durationMilliseconds = 900;

function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 4;
}

export function AnimatedNumber({ value, divisor = 1, options, className }: AnimatedNumberProps) {
  const format = useFormatter();
  const { ref, visible } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [displayed, setDisplayed] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    if (visible) return;

    const frame = window.requestAnimationFrame(() => {
      shown.current = 0;
      setDisplayed(0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = shown.current;
    const to = value;
    let frame = 0;

    if (reduced || from === to) {
      frame = window.requestAnimationFrame(() => {
        shown.current = to;
        setDisplayed(to);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMilliseconds, 1);
      const next = from + (to - from) * easeOut(progress);
      shown.current = next;
      setDisplayed(next);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [value, visible]);

  const fractionDigits = options?.maximumFractionDigits ?? options?.minimumFractionDigits;
  const rounded = fractionDigits === 0 || options === undefined ? Math.round(displayed) : displayed;
  const text = format.number(rounded / divisor, options);
  const finalText = format.number(value / divisor, options);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden>{text}</span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
