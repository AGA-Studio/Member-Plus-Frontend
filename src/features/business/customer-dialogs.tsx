"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast-provider";
import { paymentMethods } from "@/lib/domain";
import { formatPlainPesos } from "@/lib/format";
import {
  cancelMembershipAction,
  renewMembershipAction,
  updateCustomerAction,
  type EditCustomerState,
  type RenewMembershipState,
} from "./actions";

type CustomerDialogsContextValue = {
  openEdit: () => void;
  openRenew: () => void;
  openCancel: () => void;
};

const CustomerDialogsContext = createContext<CustomerDialogsContextValue | null>(null);

function useCustomerDialogs(): CustomerDialogsContextValue {
  const context = useContext(CustomerDialogsContext);
  if (!context) throw new Error("Customer dialog buttons need CustomerDialogsProvider");
  return context;
}

type CustomerDialogsProviderProps = {
  id: number;
  levelId: number;
  levelOptions: { value: string; label: string; priceCents: number }[];
  fullName: string;
  email: string;
  phone: string;
  children: ReactNode;
};

export function CustomerDialogsProvider({
  id,
  levelId,
  levelOptions,
  fullName,
  email,
  phone,
  children,
}: CustomerDialogsProviderProps) {
  const t = useTranslations("business.customer");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const methods = useTranslations("paymentMethods");
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const currentLevel = levelOptions.find((option) => option.value === String(levelId));
  const [renewAmount, setRenewAmount] = useState(formatPlainPesos(currentLevel?.priceCents ?? 0));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, startCancelling] = useTransition();

  const initialState: EditCustomerState = {
    status: "idle",
    values: { fullName, email, phone, levelId: String(levelId) },
    errors: {},
  };
  const [state, formAction, saving] = useActionState(
    updateCustomerAction.bind(null, id),
    initialState,
  );

  useEffect(() => {
    if (state.status === "saved") show("success", toasts("customerUpdated"));
  }, [state, show, toasts]);

  const initialRenewState: RenewMembershipState = {
    status: "idle",
    values: { levelId: String(levelId), paymentMethod: "cash", amount: renewAmount },
    errors: {},
  };
  const [renewState, renewAction, renewing] = useActionState(
    renewMembershipAction.bind(null, id),
    initialRenewState,
  );

  useEffect(() => {
    if (renewState.status === "renewed") show("success", toasts("membershipRenewed"));
  }, [renewState, show, toasts]);

  const [acknowledgedRenew, setAcknowledgedRenew] = useState(renewState);
  const renewVisible = renewOpen && !(renewState.status === "renewed" && renewState !== acknowledgedRenew);

  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const editVisible = editOpen && !(state.status === "saved" && state !== acknowledgedState);

  const value = useMemo(
    () => ({
      openEdit: () => {
        setAcknowledgedState(state);
        setEditOpen(true);
      },
      openRenew: () => {
        setAcknowledgedRenew(renewState);
        setRenewOpen(true);
      },
      openCancel: () => setCancelOpen(true),
    }),
    [state, renewState],
  );

  function confirmCancel() {
    startCancelling(async () => {
      await cancelMembershipAction(id);
      setCancelOpen(false);
      show("success", toasts("membershipCancelled"));
    });
  }

  return (
    <CustomerDialogsContext.Provider value={value}>
      {children}

      <Dialog
        open={editVisible}
        onClose={() => setEditOpen(false)}
        title={t("editDialog.title", { name: fullName })}
      >
        <form action={formAction} noValidate className="flex flex-col gap-5">
          {state.errors.form ? (
            <Alert tone="danger">{t(`editDialog.errors.${state.errors.form}`)}</Alert>
          ) : null}
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
            error={state.errors.phone ? t(`editDialog.errors.${state.errors.phone}`) : undefined}
          />
          <SelectField
            name="levelId"
            label={t("editDialog.level")}
            defaultValue={state.values.levelId}
            options={levelOptions}
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
        open={renewVisible}
        onClose={() => setRenewOpen(false)}
        title={t("renewDialog.title", { name: fullName })}
      >
        <form action={renewAction} noValidate className="flex flex-col gap-5">
          <p className="text-base text-muted">{t("renewDialog.description")}</p>
          {renewState.errors.form ? (
            <Alert tone="danger">{t(`renewDialog.errors.${renewState.errors.form}`)}</Alert>
          ) : null}
          <SelectField
            name="levelId"
            label={t("renewDialog.level")}
            defaultValue={renewState.values.levelId}
            options={levelOptions}
            onValueChange={(selected) => {
              const level = levelOptions.find((option) => option.value === selected);
              if (level) setRenewAmount(formatPlainPesos(level.priceCents));
            }}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="paymentMethod"
              label={t("renewDialog.method")}
              defaultValue={renewState.values.paymentMethod}
              options={paymentMethods.map((method) => ({ value: method, label: methods(method) }))}
            />
            <TextField
              name="amount"
              label={t("renewDialog.amount")}
              inputMode="decimal"
              value={renewAmount}
              onChange={(event) => setRenewAmount(event.target.value)}
              autoComplete="off"
              error={renewState.errors.amount ? t(`renewDialog.errors.${renewState.errors.amount}`) : undefined}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRenewOpen(false)}>
              {common("cancel")}
            </Button>
            <Button type="submit" loading={renewing}>
              {renewing ? t("renewDialog.renewing") : t("renewDialog.submit")}
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
    </CustomerDialogsContext.Provider>
  );
}

type TriggerProps = {
  className?: string;
};

export function EditCustomerButton({ className }: TriggerProps) {
  const t = useTranslations("business.customer");
  const { openEdit } = useCustomerDialogs();

  return (
    <Button className={className} onClick={openEdit}>
      {t("actions.edit")}
    </Button>
  );
}

export function RenewMembershipButton({ className }: TriggerProps) {
  const t = useTranslations("business.customer");
  const { openRenew } = useCustomerDialogs();

  return (
    <Button variant="outline" className={className} onClick={openRenew}>
      <RefreshCw aria-hidden strokeWidth={1.75} className="size-5" />
      {t("actions.renew")}
    </Button>
  );
}

export function CancelMembershipButton({ className }: TriggerProps) {
  const t = useTranslations("business.customer");
  const { openCancel } = useCustomerDialogs();

  return (
    <Button variant="ghost" className={className} onClick={openCancel}>
      {t("actions.cancel")}
    </Button>
  );
}
