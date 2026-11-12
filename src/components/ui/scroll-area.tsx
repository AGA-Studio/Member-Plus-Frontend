"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type ScrollAreaProps = {
  className?: string;
  children: ReactNode;
};

export function ScrollArea({ className, children }: ScrollAreaProps) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <main ref={ref} className={cx("flex-1 overflow-y-auto overscroll-contain", className)}>
      {children}
    </main>
  );
}
