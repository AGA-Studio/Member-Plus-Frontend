import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { LoginBrandPanel } from "@/features/auth/login-brand-panel";
import { LanguageSelect } from "@/features/i18n/language-select";

type RegistrationLayoutProps = {
  children: ReactNode;
};

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <LoginBrandPanel />
      </aside>
      <section className="flex flex-1 flex-col items-center bg-surface px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex w-full max-w-auth flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <Logo className="h-10 w-auto lg:h-12" />
            <LanguageSelect className="w-36" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
