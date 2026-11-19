"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { viewClasses } from "@/lib/motion";
import { useInView } from "@/lib/use-in-view";

type InViewProps = {
  index?: number;
  className?: string;
  children: ReactNode;
};

export function InView({ index = 0, className, children }: InViewProps) {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} data-inview={visible} className={cx(viewClasses(index, visible), className)}>
      {children}
    </div>
  );
}
