import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBarSkeleton, PageHeaderSkeleton, TableCardSkeleton } from "@/features/business/skeletons";

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton />
      <Skeleton className="h-11 w-full max-w-md" />
      <FilterBarSkeleton />
      <TableCardSkeleton />
    </LoadingRegion>
  );
}
