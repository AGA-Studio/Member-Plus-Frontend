import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { PlanCatalog } from "@/features/plans/plan-catalog";
import { PlatformTabs } from "@/features/platform/platform-tabs";
import { listPublicPlans } from "@/lib/api/plans";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plans.catalog");

  return { title: t("metaTitle") };
}

export default async function PlatformPlansPage() {
  await connection();
  const t = await getTranslations("plans.catalog");
  const plans = await listPublicPlans();

  return (
    <>
      <PlatformTabs active="plans" />
      <Reveal variant="entrance" index={1}>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      {plans.length === 0 ? (
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <EmptyState icon={CreditCard} title={t("empty.title")} description={t("empty.description")} />
        </section>
      ) : (
        <>
          <PlanCatalog plans={plans} />
          <p className="text-sm text-muted">{t("hint")}</p>
        </>
      )}
    </>
  );
}
