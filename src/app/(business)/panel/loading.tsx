import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/features/business/skeletons";

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-36 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function CardSkeleton({ className, lines = 4 }: { className?: string; lines?: number }) {
  return (
    <div className={`flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm ${className ?? ""}`}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  );
}

function ListCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 border-t border-border px-6 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64 w-full" />
        </div>
        <CardSkeleton lines={5} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ListCardSkeleton />
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
    </LoadingRegion>
  );
}
