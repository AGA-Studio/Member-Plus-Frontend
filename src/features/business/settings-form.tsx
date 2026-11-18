"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useRef } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast-provider";
import { revealClasses } from "@/lib/motion";
import { useGuardedAction } from "@/lib/use-action-guard";
import { useNotifyOnce } from "@/lib/use-notify-once";
import { cx } from "@/lib/cx";
import { ColorField } from "./color-field";
import { updateBusinessSettingsAction, type BusinessSettingsState } from "./settings-actions";

type SettingsFormProps = {
  initialValues: BusinessSettingsState["values"];
  businessInitials: string;
};

const cardClasses = "flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm";

export function SettingsForm({ initialValues, businessInitials }: SettingsFormProps) {
  const t = useTranslations("business.settings");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: BusinessSettingsState = { status: "idle", values: initialValues, errors: {} };
  const guardedUpdate = useGuardedAction(updateBusinessSettingsAction, t("errors.unavailable"));
  const [state, formAction, saving] = useActionState(guardedUpdate, initialState);
  const hasErrors = Object.keys(state.errors).length > 0;

  useNotifyOnce(state, state.status === "saved", () => show("success", toasts("settingsSaved")));
  useNotifyOnce(state, hasErrors, () => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    if (state.errors.form) show("danger", t(`errors.${state.errors.form}`));
  });

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <section className={cx(cardClasses, revealClasses(1))}>
            <h2 className="text-subheading text-foreground">{t("business.title")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  name="name"
                  label={t("business.name")}
                  defaultValue={state.values.name}
                  autoComplete="off"
                  error={state.errors.name ? t(`errors.${state.errors.name}`) : undefined}
                />
              </div>
              <TextField
                name="validityMonths"
                label={t("business.validity")}
                inputMode="numeric"
                defaultValue={state.values.validityMonths}
                autoComplete="off"
                error={state.errors.validityMonths ? t(`errors.${state.errors.validityMonths}`) : undefined}
              />
              <p className="text-sm text-muted sm:pt-7">{t("business.validityHint")}</p>
            </div>
          </section>

          <section className={cx(cardClasses, revealClasses(2), "sm:flex-row sm:items-center sm:justify-between")}>
            <div className="flex flex-col gap-1">
              <h2 className="text-subheading text-foreground">{t("other.title")}</h2>
              <p className="text-sm text-muted">{t("other.description")}</p>
            </div>
            <Link href="/niveles" className={buttonStyles({ variant: "outline", size: "sm", className: "shrink-0" })}>
              {t("other.levels")}
            </Link>
          </section>
        </div>

        <section className={cx(cardClasses, revealClasses(3), "lg:col-span-2")}>
          <div className="flex flex-col gap-1">
            <h2 className="text-subheading text-foreground">{t("color.title")}</h2>
            <p className="text-sm text-muted">{t("color.description")}</p>
          </div>
          <ColorField
            name="primaryColor"
            defaultValue={state.values.primaryColor}
            businessName={state.values.name}
            businessInitials={businessInitials}
            error={state.errors.primaryColor ? t(`errors.${state.errors.primaryColor}`) : undefined}
          />
        </section>
      </div>

      <div
        className={cx(
          "sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/95 p-4 shadow-md backdrop-blur",
          revealClasses(4),
        )}
      >
        <p className="hidden text-sm text-muted sm:block">{t("footerHint")}</p>
        <Button type="submit" loading={saving} className="w-full sm:w-auto">
          {saving ? t("saving") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
