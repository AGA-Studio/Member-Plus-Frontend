import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion className="mx-auto w-full max-w-page">
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="hidden aspect-card rounded-card lg:block" />
          <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 lg:grid-cols-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-16" />
          <Skeleton className="h-11" />
          <Skeleton className="h-16" />
          <Skeleton className="h-48" />
          <Skeleton className="h-16" />
        </div>
      </div>
    </LoadingRegion>
  );
}
