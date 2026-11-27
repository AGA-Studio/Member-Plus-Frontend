import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion>
      <Skeleton className="h-11 w-56" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 flex-1 sm:max-w-sm" />
        <Skeleton className="h-11 w-48" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <Skeleton className="h-12 rounded-none" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-t border-border px-6 py-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
