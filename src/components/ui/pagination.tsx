import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cx } from "@/lib/cx";

type PaginationProps = {
  pathname: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
  summary: string;
};

function buildHref(pathname: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export async function Pagination({ pathname, params, page, pageCount, summary }: PaginationProps) {
  const t = await getTranslations("common");
  const arrowClasses =
    "flex size-11 items-center justify-center rounded-md border border-border-strong bg-surface text-foreground transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-surface-muted active:scale-97";

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <p className="text-sm text-muted">{summary}</p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(pathname, params, page - 1)} aria-label={t("previousPage")} className={arrowClasses}>
            <ChevronLeft aria-hidden strokeWidth={1.75} className="size-5" />
          </Link>
        ) : (
          <span aria-hidden className={cx(arrowClasses, "pointer-events-none opacity-50")}>
            <ChevronLeft strokeWidth={1.75} className="size-5" />
          </span>
        )}
        {page < pageCount ? (
          <Link href={buildHref(pathname, params, page + 1)} aria-label={t("nextPage")} className={arrowClasses}>
            <ChevronRight aria-hidden strokeWidth={1.75} className="size-5" />
          </Link>
        ) : (
          <span aria-hidden className={cx(arrowClasses, "pointer-events-none opacity-50")}>
            <ChevronRight strokeWidth={1.75} className="size-5" />
          </span>
        )}
      </div>
    </div>
  );
}
