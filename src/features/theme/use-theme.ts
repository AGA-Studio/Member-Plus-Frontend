"use client";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { themeCookieMaxAgeSeconds, themeCookieName, type Theme } from "@/lib/theme";

type Origin = { x: number; y: number };

const revealMilliseconds = 480;
const fallbackEasing = "cubic-bezier(0.23, 1, 0.32, 1)";

function paint(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") root.dataset.theme = "dark";
  else delete root.dataset.theme;
}

function remember(theme: Theme) {
  document.cookie = `${themeCookieName}=${theme}; path=/; max-age=${themeCookieMaxAgeSeconds}; samesite=lax`;
}

function readEasing(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim();

  return value || fallbackEasing;
}

export function useTheme(initialTheme: Theme) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const change = useCallback(async (next: Theme, origin?: Origin) => {
    remember(next);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      paint(next);
      setTheme(next);
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        paint(next);
        setTheme(next);
      });
    });

    try {
      await transition.ready;
    } catch {
      return;
    }

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: revealMilliseconds, easing: readEasing(), pseudoElement: "::view-transition-new(root)" },
    );
  }, []);

  return { theme, change };
}
