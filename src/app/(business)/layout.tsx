import { Reveal } from "@/components/ui/reveal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TenantTheme } from "@/components/ui/tenant-theme";
import { BottomNav } from "@/features/business/bottom-nav";
import { Sidebar } from "@/features/business/sidebar";
import { requireUser } from "@/lib/session";

export default async function BusinessLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser(["admin"]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <TenantTheme color={user.businessPrimaryColor} foreground={user.businessPrimaryForeground} />
      <Reveal variant="entrance" className="hidden shrink-0 origin-top-left lg:flex">
        <Sidebar
          businessName={user.businessName}
          businessInitials={user.businessInitials}
          businessLogoUrl={user.businessLogoUrl}
          userName={user.fullName}
          userPhotoUrl={user.photoUrl}
        />
      </Reveal>
      <div className="flex min-w-0 flex-1 flex-col">
        <ScrollArea>
          <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </ScrollArea>
        <Reveal variant="entrance" className="shrink-0 lg:hidden">
          <BottomNav />
        </Reveal>
      </div>
    </div>
  );
}
