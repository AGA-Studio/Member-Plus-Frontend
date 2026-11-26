import { CloudOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RegisterForm } from "@/features/registration/register-form";
import { RegistrationLayout } from "@/features/registration/registration-layout";
import { fetchSignUpPlans } from "@/lib/api/plans";
import { revealClasses } from "@/lib/motion";
import { getSessionUser, roleHomePaths } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("registration");

  return { title: t("metaTitle") };
}

export const instant = false;

export default async function RegisterPage() {
  await connection();
  const user = await getSessionUser();
  if (user) redirect(roleHomePaths[user.role]);

  const t = await getTranslations("registration");
  const plans = await fetchSignUpPlans();

  return (
    <RegistrationLayout>
      <div className={`flex flex-col gap-1.5 ${revealClasses(0)}`}>
        <h1 className="text-title text-foreground">{t("title")}</h1>
        <p className="text-base text-muted">{t("subtitle")}</p>
      </div>
      {plans.length > 0 ? (
        <RegisterForm plans={plans} turnstileSiteKey={process.env.TURNSTILE_SITEKEY ?? ""} />
      ) : (
        <EmptyState
          icon={CloudOff}
          title={t("unavailable.title")}
          description={t("unavailable.description")}
          action={
            <Link href="/registro" prefetch={false} className={buttonStyles()}>
              {t("unavailable.retry")}
            </Link>
          }
        />
      )}
    </RegistrationLayout>
  );
}
