"use client";

import { Check, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { iconButtonClasses, type IconButtonTone } from "@/components/ui/icon-button";
import { cx } from "@/lib/cx";
import { locales } from "@/i18n/config";
import { useLocaleChange } from "@/i18n/use-locale-change";

type LanguageDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function LanguageDialog({ open, onClose }: LanguageDialogProps) {
  const t = useTranslations("common.language");
  const { current, pending, change } = useLocaleChange();

  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      <div role="radiogroup" aria-label={t("title")} className="flex flex-col gap-2">
        {locales.map((locale) => {
          const selected = locale === current;

          return (
            <button
              key={locale}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => {
                change(locale);
                onClose();
              }}
              className={cx(
                "flex h-12 items-center justify-between rounded-md border px-4 text-left text-base transition-[border-color,background-color,color,transform] duration-150 ease-out active:scale-97 disabled:opacity-60",
                selected
                  ? "border-primary bg-primary-soft font-medium text-primary-text"
                  : "border-border-strong bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              {t(`options.${locale}`)}
              {selected ? <Check aria-hidden strokeWidth={2} className="size-4" /> : null}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}

type LanguageButtonProps = {
  tone?: IconButtonTone;
};

export function LanguageButton({ tone = "muted" }: LanguageButtonProps) {
  const t = useTranslations("common.language");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t("title")} className={iconButtonClasses(tone)}>
        <Languages aria-hidden strokeWidth={1.75} className="size-5" />
      </button>
      <LanguageDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
