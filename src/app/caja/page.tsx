import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { MemberSummary, MemberSummaryPlaceholder } from "@/features/cashier/member-summary";
import { PurchaseForm } from "@/features/cashier/purchase-form";
import { ScanDialog } from "@/features/cashier/scan-dialog";
import { readParam } from "@/features/business/member-status";
import { findMemberByCode } from "@/lib/api/members";
import { requireSession } from "@/lib/session";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cashier.purchase");

  return { title: t("metaTitle") };
}

export default async function CashierPage({ searchParams }: PageProps<"/caja">) {
  await connection();
  const { code } = await searchParams;
  const requestedCode = readParam(code);
  const member = requestedCode ? await findMemberByCode(requestedCode) : null;

  const t = await getTranslations("cashier.purchase");
  const user = await requireSession();

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-6">
      {requestedCode && !member ? <Alert tone="warning">{t("notFoundNotice")}</Alert> : null}
      {member && member.status !== "active" ? (
        <Alert tone="warning">{t(`inactiveNotice.${member.status}`)}</Alert>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        <div className="flex flex-col gap-4 lg:w-105 lg:shrink-0">
          <ScanDialog hasMember={member !== null} />
          {member ? (
            <MemberSummary member={member} businessName={user.businessName} />
          ) : (
            <MemberSummaryPlaceholder />
          )}
        </div>
        <div className="lg:w-140">
          <PurchaseForm
            key={member?.code ?? "empty"}
            member={
              member
                ? {
                    id: member.id,
                    status: member.status,
                    cashbackBalanceCents: member.cashbackBalanceCents,
                    benefits: member.benefits,
                    tierLabel: member.tierName,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
