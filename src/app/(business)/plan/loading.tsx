import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanOverviewSkeleton } from "@/features/plans/plan-overview-skeleton";

export default function Loading() {
  return (
    <LoadingRegion>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-full max-w-80" />
      </div>
      <PlanOverviewSkeleton />
    </LoadingRegion>
  );
}
