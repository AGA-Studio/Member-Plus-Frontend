import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBarSkeleton, PageHeaderSkeleton, TableCardSkeleton } from "@/features/business/skeletons";

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton withAction={false} />
      <FilterBarSkeleton />
      <Skeleton className="h-24 w-full rounded-lg" />
      <TableCardSkeleton />
    </LoadingRegion>
  );
}
