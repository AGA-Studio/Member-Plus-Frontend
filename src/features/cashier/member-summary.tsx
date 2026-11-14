import { CalendarCheck, CreditCard, Star, Wallet } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MembershipCard } from "@/components/ui/membership-card";
import { formatMoney, formatPoints } from "@/lib/format";
import type { Member } from "@/lib/domain";

type MemberSummaryProps = {
  member: Member;
  businessName: string;
};

const statusTones = {
  active: "success",
  expired: "warning",
  cancelled: "danger",
} as const;

export async function MemberSummary({ member, businessName }: MemberSummaryProps) {
  const t = await getTranslations("cashier.purchase.member");
  const format = await getFormatter();
  const validUntil = format.dateTime(new Date(member.validUntil), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const stats = [
    { icon: Star, label: t("points"), value: formatPoints(format, member.points) },
    { icon: Wallet, label: t("cashback"), value: formatMoney(format, member.cashbackBalanceCents) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <MembershipCard
        tier={member.tier}
        tierLabel={member.tierName}
        businessName={businessName}
        memberName={member.fullName}
        code={member.code}
        className="hidden lg:flex"
      />
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.fullName} className="size-14 text-base lg:hidden" />
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-heading text-foreground">{member.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={member.tier}>{member.tierName}</Badge>
              <Badge tone={statusTones[member.status]}>{t(`status.${member.status}`)}</Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <CalendarCheck aria-hidden strokeWidth={1.75} className="size-4" />
              {t("validUntil", { date: validUntil })}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {label}
              </dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export async function MemberSummaryPlaceholder() {
  const t = await getTranslations("cashier.purchase.member");
  const emptyValue = "—";
  const stats = [
    { icon: Star, label: t("points") },
    { icon: Wallet, label: t("cashback") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-hidden
        className="hidden aspect-card flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-surface-muted text-muted lg:flex"
      >
        <CreditCard strokeWidth={1.5} className="size-10" />
        <span className="text-base font-medium">{t("emptyCard")}</span>
      </div>
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="size-14 shrink-0 rounded-full bg-surface-muted lg:hidden" />
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-heading text-muted">{t("emptyTitle")}</h2>
            <p className="text-sm text-muted">{t("emptyDescription")}</p>
            <div aria-hidden className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-16 rounded-full bg-surface-muted" />
              <span className="h-6 w-20 rounded-full bg-surface-muted" />
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {label}
              </dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-muted">{emptyValue}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
