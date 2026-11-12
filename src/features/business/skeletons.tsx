import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "@/lib/cx";

type PageHeaderSkeletonProps = {
  withAction?: boolean;
};

export function PageHeaderSkeleton({ withAction = true }: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-11 w-full sm:w-44" /> : null}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton className="h-11 w-full sm:max-w-sm" />
      <Skeleton className="h-11 w-full sm:w-40" />
    </div>
  );
}

type TableCardSkeletonProps = {
  rows?: number;
  className?: string;
};

export function TableCardSkeleton({ rows = 8, className }: TableCardSkeletonProps) {
  return (
    <div className={cx("overflow-hidden rounded-lg border border-border bg-surface shadow-sm", className)}>
      <div className="hidden h-11 bg-surface-muted lg:block" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-t border-border px-4 py-3 first:border-t-0 sm:px-6">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="hidden h-4 w-20 lg:block" />
          <Skeleton className="hidden h-6 w-16 rounded-full lg:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
