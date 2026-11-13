"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { isToastKey, toastTones } from "@/lib/toast-keys";
import { useToast } from "./toast-provider";

export function FlashToast() {
  const t = useTranslations("toasts");
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = searchParams.get("toast");
  const shownKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isToastKey(key)) {
      shownKey.current = null;
      return;
    }
    if (shownKey.current === key) return;
    shownKey.current = key;

    show(toastTones[key], t(key));
    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [key, pathname, router, searchParams, show, t]);

  return null;
}
