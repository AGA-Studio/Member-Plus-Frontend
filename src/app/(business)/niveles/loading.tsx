import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/features/business/skeletons";

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton withAction={false} />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <Skeleton className="h-24 rounded-none" />
            <div className="flex flex-col gap-4 p-5">
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="flex justify-between gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-20" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
