"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";

type TooltipProps = {
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

const showDelayMilliseconds = 250;
const skipDelayWindowMilliseconds = 400;
const gap = 12;

let lastClosedAt = 0;

export function Tooltip({ label, description, disabled = false, className, children }: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [requested, setRequested] = useState(false);
  const open = requested && !disabled;

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setRequested((current) => {
      if (current) lastClosedAt = performance.now();
      return false;
    });
  }, []);

  function openAfterDelay() {
    window.clearTimeout(timer.current);
    const recentlyClosed = performance.now() - lastClosedAt < skipDelayWindowMilliseconds;
    timer.current = window.setTimeout(() => setRequested(true), recentlyClosed ? 0 : showDelayMilliseconds);
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.pointerType !== "mouse") return;
    openAfterDelay();
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    if (disabled || !event.target.matches(":focus-visible")) return;
    window.clearTimeout(timer.current);
    setRequested(true);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    const trigger = triggerRef.current;
    if (!bubble || !trigger) return;

    if (!open) {
      if (bubble.matches(":popover-open")) bubble.hidePopover();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    bubble.style.left = `${rect.right + gap}px`;
    bubble.style.top = `${rect.top + rect.height / 2}px`;
    if (!bubble.matches(":popover-open")) bubble.showPopover();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  return (
    <div
      ref={triggerRef}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={close}
      onPointerDown={close}
      onFocus={handleFocus}
      onBlur={close}
    >
      {children}
      <div
        ref={bubbleRef}
        popover="manual"
        role="tooltip"
        aria-hidden
        className={cx(
          "pointer-events-none fixed m-0 flex w-max max-w-72 -translate-y-1/2 flex-col gap-0.5 overflow-visible rounded-md border-0 bg-ink-900 px-3 py-2 text-white shadow-md ring-1 ring-white/10",
          "-translate-x-1 opacity-0 transition-[opacity,translate,display,overlay] duration-100 ease-out transition-discrete",
          "open:translate-x-0 open:opacity-100 open:duration-150 starting:open:-translate-x-1 starting:open:opacity-0",
        )}
      >
        <span className="text-sm font-medium">{label}</span>
        {description ? <span className="text-xs text-ink-300">{description}</span> : null}
      </div>
    </div>
  );
}
