import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { MembershipCard } from "@/components/ui/membership-card";
import { PrintButton } from "@/features/business/print-button";
import { readParam } from "@/features/business/member-status";
import { findMemberByCode, listActiveMembers } from "@/lib/api/members";
import { requireUser } from "@/lib/session";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.print");

  return { title: t("metaTitle") };
}

export default async function PrintCardsPage({ searchParams }: PageProps<"/membresias/imprimir">) {
  await connection();
  const user = await requireUser(["admin"]);
  const params = await searchParams;
  const code = readParam(params.code);
  const t = await getTranslations("business.print");
  const tierLabels = await getTranslations("tiers");

  const single = code ? await findMemberByCode(code) : null;
  const members = code ? (single ? [single] : []) : await listActiveMembers();

  return (
    <main className="min-h-dvh bg-surface-muted px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 bg-white p-8 shadow-md print:max-w-none print:p-0 print:shadow-none">
        <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={code ? `/clientes/${encodeURIComponent(code)}` : "/membresias"}
            className="flex w-fit items-center gap-1 text-base text-muted transition-colors duration-150 ease-out hover:text-foreground"
          >
            <ChevronLeft aria-hidden strokeWidth={1.75} className="size-5" />
            {t("back")}
          </Link>
          <PrintButton label={t("print")} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-heading text-ink-900">{t("title")}</h1>
          <p className="text-sm text-ink-500">{t("subtitle", { count: members.length })}</p>
        </div>
        {members.length === 0 ? (
          <p className="text-base text-ink-500">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {members.map((member) => (
              <li key={member.code} className="break-inside-avoid">
                <MembershipCard
                  tier={member.tier}
                  tierLabel={tierLabels(member.tier)}
                  businessName={user.businessName}
                  memberName={member.fullName}
                  code={member.code}
                  className="shadow-none"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
