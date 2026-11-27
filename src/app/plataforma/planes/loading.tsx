import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion>
      <Skeleton className="h-11 w-56" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-6 w-full max-w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-8 w-36" />
            {Array.from({ length: 7 }, (_, row) => (
              <Skeleton key={row} className="h-6 w-full" />
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
