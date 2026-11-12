import { LogoutButton } from "@/features/auth/logout-button";

type MobileHeaderProps = {
  businessName: string;
  businessInitials: string;
};

export async function MobileHeader({ businessName, businessInitials }: MobileHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground"
        >
          {businessInitials}
        </span>
        <span className="font-display text-lg font-semibold text-foreground">{businessName}</span>
      </div>
      <LogoutButton />
    </header>
  );
}
