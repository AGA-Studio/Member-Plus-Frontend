import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { revealClasses } from "@/lib/motion";
import { Logo } from "./logo";

type SystemMessageTone = "primary" | "warning" | "danger";

const toneClasses: Record<SystemMessageTone, string> = {
  primary: "bg-primary-soft text-primary-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
};

type SystemMessageProps = {
  icon: LucideIcon;
  tone: SystemMessageTone;
  title: string;
  description: string;
  children: ReactNode;
};

export function SystemMessage({ icon: Icon, tone, title, description, children }: SystemMessageProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-10">
      <div className={cx(revealClasses(0), "flex flex-col items-center gap-8")}>
        <Logo className="h-10 w-auto" />
        <div className="flex w-full max-w-form flex-col items-center gap-4 text-center">
          <span className={cx("flex size-18 items-center justify-center rounded-full", toneClasses[tone])}>
            <Icon aria-hidden strokeWidth={1.75} className="size-8" />
          </span>
          <h1 className="text-heading text-foreground">{title}</h1>
          <p className="max-w-sm text-base text-muted">{description}</p>
          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">{children}</div>
        </div>
      </div>
    </main>
  );
}
