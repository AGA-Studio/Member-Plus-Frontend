import { getTranslations } from "next-intl/server";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/features/business/bottom-nav";
import { Sidebar } from "@/features/business/sidebar";
import { requireUser } from "@/lib/session";

export default async function BusinessLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser(["admin"]);
  const t = await getTranslations("business");

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        businessName={user.businessName}
        businessInitials={user.businessInitials}
        businessLogoUrl={user.businessLogoUrl}
        userName={user.fullName}
        userRole={t("roles.admin")}
        initials={user.fullName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ScrollArea>
          <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </ScrollArea>
        <BottomNav />
      </div>
    </div>
  );
}
