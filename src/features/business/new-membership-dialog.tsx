"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { createMembershipAction, type NewMembershipState } from "./actions";

type NewMembershipDialogProps = {
  triggerLabel: string;
  triggerClassName: string;
  levelOptions: { value: string; label: string }[];
};

export function NewMembershipDialog({ triggerLabel, triggerClassName, levelOptions }: NewMembershipDialogProps) {
  const t = useTranslations("business.memberships.newDialog");
  const common = useTranslations("common");
  const initialState: NewMembershipState = {
    values: { fullName: "", email: "", phone: "", levelId: levelOptions[0]?.value ?? "" },
    errors: {},
  };
  const [open, setOpen] = useState(false);
  const [sendCard, setSendCard] = useState(true);
  const sendCardLabelId = useId();
  const sendCardHintId = useId();
  const [state, formAction, pending] = useActionState(createMembershipAction, initialState);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t("title")}>
        <form action={formAction} noValidate className="flex flex-col gap-5">
          {state.errors.form ? <Alert tone="danger">{t(`errors.${state.errors.form}`)}</Alert> : null}
          <TextField
            name="fullName"
            label={t("fullName")}
            placeholder={t("fullNamePlaceholder")}
            defaultValue={state.values.fullName}
            autoComplete="off"
            error={state.errors.fullName ? t(`errors.${state.errors.fullName}`) : undefined}
          />
          <TextField
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("emailPlaceholder")}
            defaultValue={state.values.email}
            autoComplete="off"
            error={state.errors.email ? t(`errors.${state.errors.email}`) : undefined}
          />
          <TextField
            name="phone"
            type="tel"
            label={t("phone")}
            optional
            placeholder={t("phonePlaceholder")}
            defaultValue={state.values.phone}
            autoComplete="off"
            error={state.errors.phone ? t(`errors.${state.errors.phone}`) : undefined}
          />
          <SelectField
            name="levelId"
            label={t("tier")}
            defaultValue={state.values.levelId}
            options={levelOptions}
          />
          <input type="hidden" name="sendCardEmail" value={sendCard ? "on" : ""} />
          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
            <div className="flex flex-col gap-0.5">
              <span id={sendCardLabelId} className="text-base font-medium text-foreground">
                {t("sendCard")}
              </span>
              <span id={sendCardHintId} className="text-sm text-muted">
                {t("sendCardHint")}
              </span>
            </div>
            <Switch
              checked={sendCard}
              onCheckedChange={setSendCard}
              aria-labelledby={sendCardLabelId}
              aria-describedby={sendCardHintId}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? t("creating") : t("submit")}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
