import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { LogoSection } from "@/features/business/logo-section";
import { SettingsForm } from "@/features/business/settings-form";
import { requireUser } from "@/lib/session";

export const instant = false;

const defaultValidityMonths = 12;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.settings");

  return { title: t("metaTitle") };
}

export default async function SettingsPage() {
  await connection();
  const user = await requireUser(["admin"]);
  const t = await getTranslations("business.settings");

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <Reveal variant="entrance" index={2} className="mb-6">
        <LogoSection
          businessName={user.businessName}
          initials={user.businessInitials}
          logoUrl={user.businessLogoUrl}
        />
      </Reveal>
      <SettingsForm
        businessInitials={user.businessInitials}
        initialValues={{
          name: user.businessName,
          validityMonths: String(user.businessValidityMonths ?? defaultValidityMonths),
          primaryColor: user.businessPrimaryColor ?? "",
        }}
      />
    </>
  );
}
