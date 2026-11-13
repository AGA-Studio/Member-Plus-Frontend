import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/alert";
import { Logo } from "@/components/ui/logo";
import { MembershipCard } from "@/components/ui/membership-card";
import { CardDownloads } from "@/features/card/card-downloads";
import { getPublicCard } from "@/lib/api/card-delivery";
import { cx } from "@/lib/cx";
import { revealClasses } from "@/lib/motion";

export const instant = false;

const captureId = "membership-card-capture";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("card");

  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function PublicCardPage({ params }: PageProps<"/tarjeta/[token]">) {
  await connection();
  const { token } = await params;
  const card = await getPublicCard(decodeURIComponent(token));

  if (!card) notFound();

  const t = await getTranslations("card");
  const tiers = await getTranslations("tiers");
  const format = await getFormatter();
  const validUntil = format.dateTime(new Date(card.validUntil), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const isCancelled = card.status === "cancelled";

  return (
    <main className="flex min-h-dvh flex-col bg-brand">
      <div className="mx-auto flex w-full max-w-form flex-col items-center gap-6 px-6 pb-6 pt-8 text-center text-white">
        <Logo surface="dark" className={cx(revealClasses(0), "h-8 w-auto")} />
        <div className={cx(revealClasses(1), "flex flex-col gap-2")}>
          <h1 className="text-title">{t("heading", { business: card.businessName })}</h1>
          <p className="text-base text-white/80">{t("subtitle")}</p>
        </div>
      </div>

      <div className={cx(revealClasses(2), "relative z-10 mx-auto -mb-10 w-full max-w-form px-6")}>
        <div id={captureId} className="flex flex-col">
          <MembershipCard
            tier={card.tier}
            tierLabel={tiers(card.tier)}
            businessName={card.businessName}
            memberName={card.fullName}
            code={card.code}
            className={isCancelled ? "opacity-50" : undefined}
          />
        </div>
      </div>

      <section className="flex flex-1 flex-col rounded-t-xl bg-background px-6 pb-10 pt-16">
        <div className={cx(revealClasses(3), "mx-auto flex w-full max-w-form flex-col gap-6")}>
          <p className="flex items-center justify-center gap-2 text-sm text-muted">
            <CalendarCheck aria-hidden strokeWidth={1.75} className="size-4" />
            {t("validUntil", { date: validUntil })}
          </p>
          {card.status === "expired" ? <Alert tone="warning">{t("notices.expired")}</Alert> : null}
          {isCancelled ? (
            <Alert tone="danger">{t("notices.cancelled")}</Alert>
          ) : (
            <CardDownloads
              token={decodeURIComponent(token)}
              code={card.code}
              captureId={captureId}
              googleWalletEnabled={card.googleWalletEnabled}
            />
          )}
          {isCancelled ? null : <p className="text-center text-sm text-muted">{t("scanHint")}</p>}
        </div>
      </section>
    </main>
  );
}
