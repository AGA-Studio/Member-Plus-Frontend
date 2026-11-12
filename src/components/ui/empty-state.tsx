import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center transition-opacity duration-200 ease-out starting:opacity-0">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Icon aria-hidden strokeWidth={1.75} className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-display text-subheading font-semibold text-foreground">{title}</p>
        <p className="text-base text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
