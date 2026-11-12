import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsSkeleton, TableCardSkeleton } from "@/features/business/skeletons";

export default function Loading() {
  return (
    <LoadingRegion>
      <Skeleton className="h-5 w-24" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="flex flex-col gap-6">
          <Skeleton className="aspect-card rounded-card" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <div className="flex flex-col gap-6">
          <StatsSkeleton />
          <TableCardSkeleton rows={5} />
        </div>
      </div>
    </LoadingRegion>
  );
}
