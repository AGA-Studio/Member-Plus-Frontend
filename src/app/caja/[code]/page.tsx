import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { MemberSummary } from "@/features/cashier/member-summary";
import { PurchaseForm } from "@/features/cashier/purchase-form";
import { getCashierUser } from "@/lib/api/current-user";
import { findMemberByCode } from "@/lib/api/members";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cashier.purchase");

  return { title: t("metaTitle") };
}

export default async function PurchasePage({ params }: PageProps<"/caja/[code]">) {
  const { code } = await params;
  const member = await findMemberByCode(decodeURIComponent(code));

  if (!member) notFound();

  const t = await getTranslations("cashier.purchase");
  const tiers = await getTranslations("tiers");
  const user = await getCashierUser();

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-6">
      {member.status !== "active" ? (
        <Alert tone="warning">{t(`inactiveNotice.${member.status}`)}</Alert>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <MemberSummary member={member} businessName={user.businessName} />
        <PurchaseForm
          member={{
            code: member.code,
            status: member.status,
            cashbackBalanceCents: member.cashbackBalanceCents,
            benefits: member.benefits,
            tierLabel: tiers(member.tier),
          }}
        />
      </div>
    </div>
  );
}
