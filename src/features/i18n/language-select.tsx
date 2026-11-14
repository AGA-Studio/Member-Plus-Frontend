"use client";

import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { isLocale, locales } from "@/i18n/config";
import { useLocaleChange } from "@/i18n/use-locale-change";

type LanguageSelectProps = {
  className?: string;
};

export function LanguageSelect({ className }: LanguageSelectProps) {
  const t = useTranslations("common.language");
  const { current, change } = useLocaleChange();

  return (
    <Select
      ariaLabel={t("title")}
      className={className}
      value={current}
      options={locales.map((locale) => ({ value: locale, label: t(`options.${locale}`) }))}
      onValueChange={(value) => {
        if (isLocale(value)) change(value);
      }}
    />
  );
}
