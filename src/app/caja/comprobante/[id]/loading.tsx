import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion quick className="mx-auto w-full max-w-form gap-0 overflow-hidden rounded-xl bg-surface shadow-md sm:max-w-xl">
      <div className="flex flex-col items-center gap-3 bg-surface-muted px-6 py-10">
        <Skeleton className="size-14 rounded-full bg-border" />
        <Skeleton className="h-5 w-40 bg-border" />
        <Skeleton className="h-12 w-48 bg-border" />
        <Skeleton className="h-4 w-44 bg-border" />
      </div>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex justify-between gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        <Skeleton className="h-16" />
      </div>
    </LoadingRegion>
  );
}
