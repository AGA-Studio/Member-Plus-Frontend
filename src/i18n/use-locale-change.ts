"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { fromFormattingLocale, type Locale } from "./config";
import { setLocale } from "./actions";

export function useLocaleChange() {
  const router = useRouter();
  const current = fromFormattingLocale(useLocale());
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === current) return;

    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return { current, pending, change };
}
