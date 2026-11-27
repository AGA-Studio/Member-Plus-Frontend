import { ScrollArea } from "@/components/ui/scroll-area";
import { TenantTheme } from "@/components/ui/tenant-theme";
import { CashierHeader } from "@/features/cashier/cashier-header";
import { counterRoles } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { tenantThemeClassName } from "@/lib/tenant-theme";

export default async function CashierLayout({ children }: LayoutProps<"/caja">) {
  const user = await requireUser(counterRoles);

  return (
    <div className={`${tenantThemeClassName} flex h-dvh flex-col overflow-hidden bg-background`}>
      <TenantTheme color={user.businessPrimaryColor} foreground={user.businessPrimaryForeground} />
      <CashierHeader />
      <ScrollArea>
        <div className="flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>
      </ScrollArea>
    </div>
  );
}
