import type { ReactNode } from "react";
import { UserAvatarButton } from "@/features/auth/logout-button";
import { requireSession } from "@/lib/session";
import { getInitials } from "./avatar";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export async function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const user = await requireSession();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title text-foreground">{title}</h1>
          {subtitle ? <p className="text-base text-muted">{subtitle}</p> : null}
        </div>
        <div className="lg:hidden">
          <UserAvatarButton initials={getInitials(user.fullName)} />
        </div>
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </div>
  );
}
