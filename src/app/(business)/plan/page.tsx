import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { PlanOverview } from "@/features/plans/plan-overview";
import { getPlanSummary, listPublicPlans } from "@/lib/api/plans";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plans.business");

  return { title: t("metaTitle") };
}

export default async function PlanPage() {
  await connection();
  const t = await getTranslations("plans.business");
  const [summary, plans] = await Promise.all([getPlanSummary(), listPublicPlans()]);

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <PlanOverview summary={summary} audience="business" fallbackPlanName={plans.find((plan) => plan.isDefault)?.name} />
    </>
  );
}
