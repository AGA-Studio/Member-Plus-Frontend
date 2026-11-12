"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isToastKey } from "@/lib/toast-keys";
import { useToast } from "./toast-provider";

export function FlashToast() {
  const t = useTranslations("toasts");
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = searchParams.get("toast");

  useEffect(() => {
    if (!isToastKey(key)) return;

    show("success", t(key));
    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [key, pathname, router, searchParams, show, t]);

  return null;
}
