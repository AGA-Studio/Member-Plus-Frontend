import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { revealClasses } from "@/lib/motion";

type RevealProps = {
  index?: number;
  className?: string;
  children: ReactNode;
};

export function Reveal({ index = 0, className, children }: RevealProps) {
  return <div className={cx(revealClasses(index), className)}>{children}</div>;
}
