import { CashierHeader } from "@/features/cashier/cashier-header";
import { requireSession } from "@/lib/session";

export default async function CashierLayout({ children }: LayoutProps<"/caja">) {
  await requireSession();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <CashierHeader />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
