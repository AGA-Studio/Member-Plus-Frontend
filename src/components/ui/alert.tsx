import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type AlertTone = "danger" | "warning" | "success" | "info";

const toneClasses: Record<AlertTone, string> = {
  danger: "bg-danger-soft text-danger-text",
  warning: "bg-warning-soft text-warning-text",
  success: "bg-success-soft text-success-text",
  info: "bg-primary-soft text-primary-text",
};

const toneIcons = {
  danger: CircleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
  info: Info,
} satisfies Record<AlertTone, typeof Info>;

type AlertProps = {
  tone: AlertTone;
  children: ReactNode;
  className?: string;
};

export function Alert({ tone, children, className }: AlertProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx(
        "flex items-start gap-3 rounded-md px-4 py-3 text-sm",
        "transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0",
        toneClasses[tone],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
