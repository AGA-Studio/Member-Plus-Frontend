"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast-provider";
import type { Level } from "@/lib/domain";
import { updateLevelAction, type EditLevelState } from "./actions";

type EditLevelDialogProps = {
  level: Level;
  tierLabel: string;
};

export function EditLevelDialog({ level, tierLabel }: EditLevelDialogProps) {
  const t = useTranslations("business.levels");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [open, setOpen] = useState(false);

  const initialState: EditLevelState = {
    status: "idle",
    values: {
      price: String(level.priceCents / 100),
      discount: String(level.benefits.discountPercent),
      pointsPerTen: String(level.benefits.pointsPerTenPesos),
      cashback: String(level.benefits.cashbackPercent),
    },
    errors: {},
  };
  const [state, formAction, saving] = useActionState(
    updateLevelAction.bind(null, level.id),
    initialState,
  );
  useEffect(() => {
    if (state.status === "saved") show("success", toasts("levelSaved"));
  }, [state, show, toasts]);

  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const visible = open && !(state.status === "saved" && state !== acknowledgedState);

  function openDialog() {
    setAcknowledgedState(state);
    setOpen(true);
  }

  return (
    <>
      <Button variant="outline" onClick={openDialog}>
        {t("edit")}
      </Button>
      <Dialog
        open={visible}
        onClose={() => setOpen(false)}
        title={t("editDialog.title", { tier: tierLabel })}
        variant="drawer"
      >
        <form action={formAction} noValidate className="flex flex-col gap-5">
          {state.errors.form ? <Alert tone="danger">{t(`editDialog.errors.${state.errors.form}`)}</Alert> : null}
          <TextField
            name="price"
            label={t("editDialog.price")}
            inputMode="decimal"
            defaultValue={state.values.price}
            error={state.errors.price ? t(`editDialog.errors.${state.errors.price}`) : undefined}
          />
          <TextField
            name="discount"
            label={t("editDialog.discount")}
            inputMode="decimal"
            defaultValue={state.values.discount}
            error={state.errors.discount ? t(`editDialog.errors.${state.errors.discount}`) : undefined}
          />
          <TextField
            name="pointsPerTen"
            label={t("editDialog.pointsPerTen")}
            inputMode="numeric"
            defaultValue={state.values.pointsPerTen}
            error={state.errors.pointsPerTen ? t(`editDialog.errors.${state.errors.pointsPerTen}`) : undefined}
          />
          <TextField
            name="cashback"
            label={t("editDialog.cashback")}
            inputMode="decimal"
            defaultValue={state.values.cashback}
            error={state.errors.cashback ? t(`editDialog.errors.${state.errors.cashback}`) : undefined}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? t("editDialog.saving") : t("editDialog.submit")}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
