"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { tiers } from "@/lib/domain";
import { createMembershipAction, type NewMembershipState } from "./actions";

const initialState: NewMembershipState = {
  values: { fullName: "", email: "", phone: "", tier: "bronze" },
  errors: {},
};

type NewMembershipDialogProps = {
  triggerLabel: string;
  triggerClassName: string;
};

export function NewMembershipDialog({ triggerLabel, triggerClassName }: NewMembershipDialogProps) {
  const t = useTranslations("business.memberships.newDialog");
  const tierLabels = useTranslations("tiers");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
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
          />
          <SelectField
            name="tier"
            label={t("tier")}
            defaultValue={state.values.tier}
            options={tiers.map((tier) => ({ value: tier, label: tierLabels(tier) }))}
          />
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
