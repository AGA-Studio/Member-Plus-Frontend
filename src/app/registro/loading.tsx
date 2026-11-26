import { LoadingRegion } from "@/components/ui/loading-region";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationLayout } from "@/features/registration/registration-layout";

export default function Loading() {
  return (
    <RegistrationLayout>
      <LoadingRegion>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-full" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-13 w-full" />
      </LoadingRegion>
    </RegistrationLayout>
  );
}
