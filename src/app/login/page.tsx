import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/logo";
import { LoginBrandPanel } from "@/features/auth/login-brand-panel";
import { LoginForm } from "@/features/auth/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");

  return { title: t("metaTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <main className="flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <aside className="h-80 shrink-0 lg:h-auto">
        <LoginBrandPanel />
      </aside>
      <section className="relative -mt-6 flex flex-1 flex-col items-center justify-center rounded-t-xl bg-surface px-6 py-10 lg:mt-0 lg:rounded-none">
        <div className="flex w-full max-w-auth flex-col gap-10">
          <Logo className="h-10 w-auto self-start lg:h-12" />
          <div className="flex flex-col gap-1.5 transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0">
            <h1 className="text-title text-foreground">{t("title")}</h1>
            <p className="text-base text-muted">{t("subtitle")}</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
