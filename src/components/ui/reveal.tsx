import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { entranceClasses, revealClasses } from "@/lib/motion";

type RevealProps = {
  index?: number;
  variant?: "default" | "entrance";
  className?: string;
  children: ReactNode;
};

export function Reveal({ index = 0, variant = "default", className, children }: RevealProps) {
  const motion = variant === "entrance" ? entranceClasses(index) : revealClasses(index);

  return <div className={cx(motion, className)}>{children}</div>;
}
