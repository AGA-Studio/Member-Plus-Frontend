import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { ScanCard } from "@/features/cashier/scan-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cashier.scan");

  return { title: t("metaTitle") };
}

export default async function ScanPage() {
  const t = await getTranslations("cashier.scan");

  return (
    <div className="mx-auto flex w-full max-w-cashier flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge tone="success">{t("readerConnected")}</Badge>
        <h1 className="text-title text-foreground">{t("title")}</h1>
        <p className="max-w-md text-base text-muted">{t("subtitle")}</p>
      </div>
      <ScanCard />
    </div>
  );
}
