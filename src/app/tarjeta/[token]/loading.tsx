import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingRegion className="flex min-h-dvh flex-col bg-brand">
      <div className="mx-auto flex w-full max-w-form flex-col items-center gap-6 px-6 pb-6 pt-8">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <Skeleton className="h-9 w-64 bg-white/20" />
        <Skeleton className="h-6 w-72 bg-white/20" />
      </div>
      <div className="relative z-10 mx-auto -mb-10 w-full max-w-form px-6">
        <Skeleton className="aspect-card rounded-card" />
      </div>
      <div className="flex flex-1 flex-col gap-3 rounded-t-xl bg-background px-6 pb-10 pt-16">
        <div className="mx-auto flex w-full max-w-form flex-col gap-3">
          <Skeleton className="h-13" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-13" />
            <Skeleton className="h-13" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
