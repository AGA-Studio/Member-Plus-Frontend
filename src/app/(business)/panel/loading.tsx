import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/features/business/skeletons";

function ListCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 border-t border-border px-6 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col justify-between gap-8 rounded-lg border border-border bg-surface p-6 shadow-sm lg:col-span-2 lg:p-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-12 w-64 max-w-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
    </LoadingRegion>
  );
}
