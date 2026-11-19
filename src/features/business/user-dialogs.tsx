"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast-provider";
import type { BusinessUser } from "@/lib/api/users";
import { useAttempt, useGuardedAction } from "@/lib/use-action-guard";
import { useNotifyOnce } from "@/lib/use-notify-once";
import {
  createUserAction,
  setUserActiveAction,
  updateUserAction,
  type EditUserState,
  type NewUserState,
} from "./user-actions";

export function NewUserButton() {
  const t = useTranslations("business.users");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const initialState: NewUserState = { status: "idle", values: { name: "", email: "", role: "employee" }, errors: {} };
  const guardedCreate = useGuardedAction(createUserAction, t("errors.unavailable"));
  const [state, formAction, pending] = useActionState(guardedCreate, initialState);
  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const visible = open && !(state.status === "created" && state !== acknowledgedState);

  useNotifyOnce(state, state.status === "created", () => show("success", toasts("userCreated")));

  function openDialog() {
    setAcknowledgedState(state);
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  return (
    <>
      <Button onClick={openDialog}>
        <Plus aria-hidden strokeWidth={1.75} className="size-5" />
        {t("new.trigger")}
      </Button>
      <Dialog open={visible} onClose={() => setOpen(false)} title={t("new.title")}>
        <form key={formKey} action={formAction} noValidate className="flex flex-col gap-5">
          <p className="text-base text-muted">{t("new.description")}</p>
          {state.errors.form ? <Alert tone="danger">{t(`errors.${state.errors.form}`)}</Alert> : null}
          <TextField
            name="name"
            label={t("fields.name")}
            defaultValue={state.values.name}
            autoComplete="off"
            error={state.errors.name ? t(`errors.${state.errors.name}`) : undefined}
          />
          <TextField
            name="email"
            type="email"
            label={t("fields.email")}
            defaultValue={state.values.email}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            error={state.errors.email ? t(`errors.${state.errors.email}`) : undefined}
          />
          <SelectField
            name="role"
            label={t("fields.role")}
            defaultValue={state.values.role}
            options={[
              { value: "employee", label: t("roles.employee") },
              { value: "admin", label: t("roles.admin") },
            ]}
          />
          <TextField
            name="password"
            type="password"
            label={t("fields.password")}
            hint={t("fields.passwordHint")}
            autoComplete="new-password"
            error={state.errors.password ? t(`errors.${state.errors.password}`) : undefined}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? t("new.creating") : t("new.submit")}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

type UserRowActionsProps = {
  user: BusinessUser;
  isSelf: boolean;
};

export function UserRowActions({ user, isSelf }: UserRowActionsProps) {
  const t = useTranslations("business.users");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const attempt = useAttempt();
  const [editOpen, setEditOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [changing, startChanging] = useTransition();
  const initialState: EditUserState = { status: "idle", values: { name: user.name, email: user.email }, errors: {} };
  const guardedUpdate = useGuardedAction(updateUserAction.bind(null, user.id), t("errors.unavailable"));
  const [state, formAction, saving] = useActionState(guardedUpdate, initialState);
  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const editVisible = editOpen && !(state.status === "saved" && state !== acknowledgedState);

  useNotifyOnce(state, state.status === "saved", () => show("success", toasts("userUpdated")));

  function openEdit() {
    setAcknowledgedState(state);
    setFormKey((key) => key + 1);
    setEditOpen(true);
  }

  function changeActive(isActive: boolean) {
    startChanging(async () => {
      const result = await attempt(() => setUserActiveAction(user.id, isActive), t("errors.unavailable"));
      if (!result) return;

      if (result.ok) {
        setDeactivateOpen(false);
        show("success", toasts(isActive ? "userReactivated" : "userDeactivated"));
        return;
      }

      show("danger", t(result.reason === "cannotDeactivateSelf" ? "errors.cannotDeactivateSelf" : "errors.unavailable"));
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={openEdit}>
          {t("actions.edit")}
        </Button>
        {isSelf ? null : user.isActive ? (
          <Button variant="ghost" size="sm" onClick={() => setDeactivateOpen(true)}>
            {t("actions.deactivate")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" loading={changing} onClick={() => changeActive(true)}>
            {t("actions.reactivate")}
          </Button>
        )}
      </div>

      <Dialog open={editVisible} onClose={() => setEditOpen(false)} title={t("edit.title", { name: user.name })}>
        <form key={formKey} action={formAction} noValidate className="flex flex-col gap-5">
          {state.errors.form ? <Alert tone="danger">{t(`errors.${state.errors.form}`)}</Alert> : null}
          <TextField
            name="name"
            label={t("fields.name")}
            defaultValue={state.values.name}
            autoComplete="off"
            error={state.errors.name ? t(`errors.${state.errors.name}`) : undefined}
          />
          <TextField
            name="email"
            type="email"
            label={t("fields.email")}
            defaultValue={state.values.email}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            error={state.errors.email ? t(`errors.${state.errors.email}`) : undefined}
          />
          <TextField
            name="password"
            type="password"
            label={t("fields.newPassword")}
            optional
            hint={t("fields.newPasswordHint")}
            autoComplete="new-password"
            error={state.errors.password ? t(`errors.${state.errors.password}`) : undefined}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? t("edit.saving") : t("edit.submit")}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={deactivateOpen} onClose={() => setDeactivateOpen(false)} title={t("deactivate.title", { name: user.name })}>
        <p className="text-base text-muted">{t("deactivate.body")}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeactivateOpen(false)}>
            {t("deactivate.keep")}
          </Button>
          <Button variant="danger" loading={changing} onClick={() => changeActive(false)}>
            {changing ? t("deactivate.confirming") : t("deactivate.confirm")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
