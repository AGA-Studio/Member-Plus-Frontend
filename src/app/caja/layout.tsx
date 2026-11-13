import { ScrollArea } from "@/components/ui/scroll-area";
import { CashierHeader } from "@/features/cashier/cashier-header";
import { requireSession } from "@/lib/session";

export default async function CashierLayout({ children }: LayoutProps<"/caja">) {
  await requireSession();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <CashierHeader />
      <ScrollArea>
        <div className="flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>
      </ScrollArea>
    </div>
  );
}
