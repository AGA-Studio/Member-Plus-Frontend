"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast-provider";
import {
  cancelMembershipAction,
  updateCustomerAction,
  type EditCustomerState,
} from "./actions";

type CustomerActionsProps = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  cancelled: boolean;
};

export function CustomerActions({ code, fullName, email, phone, cancelled }: CustomerActionsProps) {
  const t = useTranslations("business.customer");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, startCancelling] = useTransition();

  const initialState: EditCustomerState = {
    status: "idle",
    values: { fullName, email, phone },
    errors: {},
  };
  const [state, formAction, saving] = useActionState(
    updateCustomerAction.bind(null, code),
    initialState,
  );

  useEffect(() => {
    if (state.status === "saved") show("success", toasts("customerUpdated"));
  }, [state, show, toasts]);

  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const editVisible = editOpen && !(state.status === "saved" && state !== acknowledgedState);

  function openEdit() {
    setAcknowledgedState(state);
    setEditOpen(true);
  }

  function confirmCancel() {
    startCancelling(async () => {
      await cancelMembershipAction(code);
      setCancelOpen(false);
      show("success", toasts("membershipCancelled"));
    });
  }

  return (
    <>
      {cancelled ? null : (
        <Button variant="ghost" className="order-last sm:order-first" onClick={() => setCancelOpen(true)}>
          {t("actions.cancel")}
        </Button>
      )}
      <Link
        href={`/membresias/imprimir?code=${encodeURIComponent(code)}`}
        className={buttonStyles({ variant: "outline" })}
      >
        {t("actions.printCard")}
      </Link>
      <Button onClick={openEdit}>{t("actions.edit")}</Button>

      <Dialog
        open={editVisible}
        onClose={() => setEditOpen(false)}
        title={t("editDialog.title", { name: fullName })}
      >
        <form action={formAction} noValidate className="flex flex-col gap-5">
          {state.errors.form ? <Alert tone="danger">{t(`editDialog.errors.${state.errors.form}`)}</Alert> : null}
          <TextField
            name="fullName"
            label={t("editDialog.fullName")}
            defaultValue={state.values.fullName}
            autoComplete="off"
            error={state.errors.fullName ? t(`editDialog.errors.${state.errors.fullName}`) : undefined}
          />
          <TextField
            name="email"
            type="email"
            label={t("editDialog.email")}
            defaultValue={state.values.email}
            autoComplete="off"
            error={state.errors.email ? t(`editDialog.errors.${state.errors.email}`) : undefined}
          />
          <TextField
            name="phone"
            type="tel"
            label={t("editDialog.phone")}
            optional
            defaultValue={state.values.phone}
            autoComplete="off"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? t("editDialog.saving") : t("editDialog.submit")}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t("cancelDialog.title", { name: fullName })}
      >
        <p className="text-base text-muted">{t("cancelDialog.body")}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCancelOpen(false)}>
            {t("cancelDialog.keep")}
          </Button>
          <Button variant="danger" loading={cancelling} onClick={confirmCancel}>
            {cancelling ? t("cancelDialog.confirming") : t("cancelDialog.confirm")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
