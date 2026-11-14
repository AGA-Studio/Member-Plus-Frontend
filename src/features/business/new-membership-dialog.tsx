"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { paymentMethods } from "@/lib/domain";
import { useGuardedAction } from "@/lib/use-action-guard";
import { formatPlainPesos } from "@/lib/format";
import { TextField } from "@/components/ui/text-field";
import { createMembershipAction, type NewMembershipState } from "./actions";

type NewMembershipDialogProps = {
  triggerLabel: string;
  triggerClassName: string;
  levelOptions: { value: string; label: string; priceCents: number }[];
};

export function NewMembershipDialog({ triggerLabel, triggerClassName, levelOptions }: NewMembershipDialogProps) {
  const t = useTranslations("business.memberships.newDialog");
  const methods = useTranslations("paymentMethods");
  const common = useTranslations("common");
  const initialState: NewMembershipState = {
    values: {
      fullName: "",
      email: "",
      phone: "",
      levelId: levelOptions[0]?.value ?? "",
      paymentMethod: "cash",
      amount: formatPlainPesos(levelOptions[0]?.priceCents ?? 0),
    },
    errors: {},
  };
  const [open, setOpen] = useState(false);
  const [sendCard, setSendCard] = useState(true);
  const [amount, setAmount] = useState(initialState.values.amount);
  const sendCardLabelId = useId();
  const sendCardHintId = useId();
  const guardedCreate = useGuardedAction(createMembershipAction, t("errors.unavailable"));
  const [state, formAction, pending] = useActionState(guardedCreate, initialState);

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
            onValueChange={(levelId) => {
              const level = levelOptions.find((option) => option.value === levelId);
              if (level) setAmount(formatPlainPesos(level.priceCents));
            }}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="paymentMethod"
              label={t("paymentMethod")}
              defaultValue={state.values.paymentMethod}
              options={paymentMethods.map((method) => ({ value: method, label: methods(method) }))}
            />
            <TextField
              name="amount"
              label={t("amount")}
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoComplete="off"
              error={state.errors.amount ? t(`errors.${state.errors.amount}`) : undefined}
            />
          </div>
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
