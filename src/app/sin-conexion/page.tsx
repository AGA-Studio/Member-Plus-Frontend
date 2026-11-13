import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonStyles } from "@/components/ui/button";
import { SystemMessage } from "@/components/ui/system-message";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("system.offline");

  return { title: t("metaTitle") };
}

export default async function OfflinePage() {
  const t = await getTranslations("system.offline");

  return (
    <SystemMessage icon={TriangleAlert} tone="danger" title={t("title")} description={t("description")}>
      <Link href="/" className={buttonStyles({ size: "md" })}>
        {t("retry")}
      </Link>
    </SystemMessage>
  );
}
