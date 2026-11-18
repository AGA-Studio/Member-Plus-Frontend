"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { cx } from "@/lib/cx";
import { brandPrimaryHex, buildTenantPreviewCss, normalizeHexColor, tenantPreviewClassName } from "@/lib/tenant-theme";

type ColorFieldProps = {
  name: string;
  defaultValue: string;
  businessName: string;
  businessInitials: string;
  error?: string;
};

export function ColorField({ name, defaultValue, businessName, businessInitials, error }: ColorFieldProps) {
  const t = useTranslations("business.settings.color");
  const [value, setValue] = useState(defaultValue);
  const normalized = normalizeHexColor(value);
  const previewCss = buildTenantPreviewCss(normalized);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <input
          type="color"
          aria-label={t("picker")}
          value={normalized ?? brandPrimaryHex}
          onChange={(event) => setValue(event.target.value)}
          className="mt-6 size-11 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-1 transition-transform duration-150 ease-out active:scale-97"
        />
        <div className="flex-1">
          <TextField
            name={name}
            label={t("hex")}
            placeholder={brandPrimaryHex}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            error={error}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">{t("preview.title")}</p>
        {previewCss ? <style>{previewCss}</style> : null}
        <div
          aria-hidden
          className={cx(
            tenantPreviewClassName,
            "flex flex-col gap-5 rounded-lg border border-border bg-background p-5",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              {businessInitials}
            </span>
            <span className="min-w-0 flex-1 truncate font-display text-base font-semibold text-foreground">
              {businessName}
            </span>
            <Badge tone="primary">{t("preview.badge")}</Badge>
          </div>
          <div className="flex h-12 items-center rounded-full bg-primary-soft px-5 text-base font-semibold text-primary-text">
            {t("preview.navItem")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={buttonStyles({ size: "sm" })}>{t("preview.button")}</span>
            <span className={buttonStyles({ variant: "outline", size: "sm" })}>{t("preview.secondary")}</span>
            <span className="text-sm font-medium text-primary-text">{t("preview.link")}</span>
          </div>
        </div>
        {value.trim() === "" ? (
          <p className="text-sm text-muted">{t("defaultHint")}</p>
        ) : (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setValue("")}>
              {t("reset")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
