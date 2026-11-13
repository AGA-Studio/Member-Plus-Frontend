"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonStyles } from "@/components/ui/button";
import { SystemMessage } from "@/components/ui/system-message";

type ErrorPageProps = {
  retry: () => void;
};

export default function ErrorPage({ retry }: ErrorPageProps) {
  const t = useTranslations("system.error");

  return (
    <SystemMessage icon={TriangleAlert} tone="warning" title={t("title")} description={t("description")}>
      <Button onClick={() => retry()}>{t("retry")}</Button>
      <Link href="/" className={buttonStyles({ variant: "outline" })}>
        {t("home")}
      </Link>
    </SystemMessage>
  );
}
