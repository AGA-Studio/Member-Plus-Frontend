import { ScrollArea } from "@/components/ui/scroll-area";
import { PlatformHeader } from "@/features/platform/platform-header";
import { requireUser } from "@/lib/session";

export default async function PlatformLayout({ children }: LayoutProps<"/plataforma">) {
  await requireUser(["platform"]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <PlatformHeader />
      <ScrollArea>
        <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
