import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/cx";

type SpinnerProps = {
  className?: string;
};

export function Spinner({ className }: SpinnerProps) {
  return (
    <LoaderCircle
      aria-hidden
      strokeWidth={1.75}
      className={cx("size-5 animate-spin", className)}
    />
  );
}
