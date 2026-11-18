import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/features/business/skeletons";

function CardSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: fields }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <LoadingRegion>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <CardSkeleton fields={2} />
          <CardSkeleton fields={1} />
        </div>
        <div className="lg:col-span-2">
          <CardSkeleton fields={3} />
        </div>
      </div>
    </LoadingRegion>
  );
}
