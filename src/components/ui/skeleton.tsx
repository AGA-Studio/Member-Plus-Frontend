import { cx } from "@/lib/cx";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cx("animate-pulse rounded-md bg-surface-muted", className)} />;
}
