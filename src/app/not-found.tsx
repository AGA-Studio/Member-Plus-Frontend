import { Search } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonStyles } from "@/components/ui/button";
import { SystemMessage } from "@/components/ui/system-message";

export default async function NotFound() {
  const t = await getTranslations("system.notFound");

  return (
    <SystemMessage icon={Search} tone="primary" title={t("title")} description={t("description")}>
      <Link href="/" className={buttonStyles({ size: "md" })}>
        {t("home")}
      </Link>
    </SystemMessage>
  );
}
