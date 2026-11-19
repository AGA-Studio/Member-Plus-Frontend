import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/features/business/skeletons";

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-36 max-w-full" />
      </div>
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <Skeleton className="h-36 rounded-none" />
            <div className="flex flex-col gap-4 p-5">
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, tile) => (
                  <Skeleton key={tile} className="h-20 w-full" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-border px-5 py-3">
              <Skeleton className="h-11 w-20" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
