import { LoadingRegion } from "@/components/ui/loading-region";
import { FilterBarSkeleton, PageHeaderSkeleton, TableCardSkeleton } from "@/features/business/skeletons";

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableCardSkeleton />
    </LoadingRegion>
  );
}
