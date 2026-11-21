import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { getInitials } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { BusinessLogo } from "@/components/ui/business-logo";
import { Reveal } from "@/components/ui/reveal";
import { BusinessStatusButton } from "@/features/platform/business-status-button";
import { getPlatformBusiness } from "@/lib/api/platform";
import type { BusinessStatus } from "@/lib/domain";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.detail");

  return { title: t("metaTitle") };
}

const statusTones: Record<BusinessStatus, BadgeTone> = {
  trial: "primary",
  active: "success",
  suspended: "danger",
};

function parseBusinessId(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null;
}

export default async function PlatformBusinessPage({ params }: PageProps<"/plataforma/[id]">) {
  await connection();
  const { id: rawId } = await params;
  const id = parseBusinessId(rawId);
  if (id === null) notFound();

  const business = await getPlatformBusiness(id);
  if (!business) notFound();

  const t = await getTranslations("platform.detail");
  const statusLabels = await getTranslations("platform.status");
  const format = await getFormatter();

  const metrics = [
    { label: t("metrics.customers"), value: format.number(business.customersCount) },
    { label: t("metrics.users"), value: format.number(business.usersCount) },
    { label: t("metrics.validity"), value: t("metrics.validityValue", { count: business.validityMonths }) },
    {
      label: t("metrics.createdAt"),
      value: format.dateTime(new Date(business.createdAt), { day: "numeric", month: "short", year: "numeric" }),
    },
  ];

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <Link
          href="/plataforma"
          className="flex w-fit items-center gap-1 rounded-sm text-base text-muted transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ChevronLeft aria-hidden strokeWidth={1.75} className="size-5" />
          {t("back")}
        </Link>
      </Reveal>

      <Reveal variant="entrance" index={2} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <BusinessLogo
            name={business.name}
            initials={getInitials(business.name)}
            logoUrl={business.logoUrl}
            className="size-16"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-title text-foreground">{business.name}</h1>
            <div>
              <Badge tone={statusTones[business.status]}>{statusLabels(business.status)}</Badge>
            </div>
          </div>
        </div>
        <BusinessStatusButton
          id={business.id}
          name={business.name}
          status={business.status}
          className="w-full sm:w-auto"
        />
      </Reveal>

      {business.status === "suspended" ? (
        <Reveal variant="entrance" index={3}>
          <Alert tone="warning">{t("suspendedNotice")}</Alert>
        </Reveal>
      ) : null}

      <Reveal variant="entrance" index={4}>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-lg border border-border bg-surface p-5 shadow-sm lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted">{metric.label}</dt>
              <dd className="font-display text-subheading font-semibold tabular-nums text-foreground">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-muted">{t("privacyHint")}</p>
      </Reveal>
    </>
  );
}
