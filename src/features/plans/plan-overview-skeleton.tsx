import { Skeleton } from "@/components/ui/skeleton";

const cardClasses = "flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6";

export function PlanOverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <div className={cardClasses}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <Skeleton className="h-7 w-36" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-6 w-full max-w-64" />
          ))}
        </div>
      </div>
      <div className={cardClasses}>
        <Skeleton className="h-7 w-20" />
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
