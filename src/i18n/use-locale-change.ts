"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { fromFormattingLocale, type Locale } from "./config";
import { setLocale } from "./actions";

const revealMilliseconds = 450;
const maxWaitMilliseconds = 4000;
const fallbackEasing = "cubic-bezier(0.23, 1, 0.32, 1)";

function readEasing(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim();

  return value || fallbackEasing;
}

function waitForLanguageSwap(start: () => void): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(finish);
    const timer = window.setTimeout(finish, maxWaitMilliseconds);

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    start();
  });
}

export function useLocaleChange() {
  const router = useRouter();
  const current = fromFormattingLocale(useLocale());
  const [pending, startTransition] = useTransition();

  async function change(next: Locale) {
    if (next === current) return;

    const apply = () =>
      waitForLanguageSwap(() => {
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        });
      });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      await apply();
      return;
    }

    const transition = document.startViewTransition(apply);

    try {
      await transition.ready;
    } catch {
      return;
    }

    document.documentElement.animate(
      {
        opacity: [0, 1],
        filter: ["blur(4px)", "blur(0px)"],
        transform: ["translateY(12px) scale(0.98)", "translateY(0) scale(1)"],
      },
      { duration: revealMilliseconds, easing: readEasing(), pseudoElement: "::view-transition-new(root)" },
    );
  }

  return { current, pending, change };
}
