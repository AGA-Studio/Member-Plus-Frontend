"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Spinner } from "./spinner";

type PaginationProps = {
  pathname: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
  summary: string;
  className?: string;
};

type Direction = "next" | "prev";

const directionAttribute = "pageDirection";
const directionResetMilliseconds = 900;
const directionSafetyMilliseconds = 4000;

function buildHref(pathname: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function clearDirection() {
  delete document.documentElement.dataset[directionAttribute];
}

function markDirection(direction: Direction) {
  document.documentElement.dataset[directionAttribute] = direction;
  window.setTimeout(clearDirection, directionSafetyMilliseconds);
}

function Pending({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();

  return pending ? <Spinner className="size-5" /> : children;
}

export function Pagination({ pathname, params, page, pageCount, summary, className }: PaginationProps) {
  const t = useTranslations("common");
  const arrowClasses =
    "flex size-11 items-center justify-center rounded-md border border-border-strong bg-surface text-foreground transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-surface-muted active:scale-97";

  useEffect(() => {
    const timer = window.setTimeout(clearDirection, directionResetMilliseconds);

    return () => window.clearTimeout(timer);
  }, [page]);

  return (
    <div className={cx("sticky bottom-4 z-10", className)}>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 shadow-md sm:px-6">
        <p
          key={summary}
          aria-live="polite"
          className="text-sm text-muted transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0"
        >
          {summary}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={buildHref(pathname, params, page - 1)}
              aria-label={t("previousPage")}
              onClick={() => markDirection("prev")}
              className={arrowClasses}
            >
              <Pending>
                <ChevronLeft aria-hidden strokeWidth={1.75} className="size-5" />
              </Pending>
            </Link>
          ) : (
            <span aria-hidden className={cx(arrowClasses, "pointer-events-none opacity-50")}>
              <ChevronLeft strokeWidth={1.75} className="size-5" />
            </span>
          )}
          {page < pageCount ? (
            <Link
              href={buildHref(pathname, params, page + 1)}
              aria-label={t("nextPage")}
              onClick={() => markDirection("next")}
              className={arrowClasses}
            >
              <Pending>
                <ChevronRight aria-hidden strokeWidth={1.75} className="size-5" />
              </Pending>
            </Link>
          ) : (
            <span aria-hidden className={cx(arrowClasses, "pointer-events-none opacity-50")}>
              <ChevronRight strokeWidth={1.75} className="size-5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
