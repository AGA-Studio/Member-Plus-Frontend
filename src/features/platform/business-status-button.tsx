"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { useAttempt } from "@/lib/use-action-guard";
import type { BusinessStatus } from "@/lib/domain";
import { updateBusinessStatusAction } from "./actions";

type BusinessStatusButtonProps = {
  id: number;
  name: string;
  status: BusinessStatus;
  className?: string;
};

export function BusinessStatusButton({ id, name, status, className }: BusinessStatusButtonProps) {
  const t = useTranslations("platform.detail");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const router = useRouter();
  const attempt = useAttempt();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<"notFound" | "trialNotAllowed" | "unavailable" | null>(null);
  const [pending, startTransition] = useTransition();

  // Un negocio suspendido solo se reactiva; uno activo o en prueba solo se suspende.
  const reactivating = status === "suspended";
  const action = reactivating ? "reactivate" : "suspend";

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function confirm() {
    startTransition(async () => {
      const result = await attempt(
        () => updateBusinessStatusAction(id, reactivating ? "active" : "suspended"),
        t("errors.unavailable"),
      );
      if (result === undefined) return;

      if (result === "done") {
        setOpen(false);
        show("success", toasts(reactivating ? "businessReactivated" : "businessSuspended"));
        return;
      }
      if (result === "notFound") {
        setOpen(false);
        show("danger", t("errors.notFound"));
        router.replace("/plataforma");
        return;
      }
      setError(result);
    });
  }

  return (
    <>
      <Button variant={reactivating ? "primary" : "danger"} className={className} onClick={openDialog}>
        {t(`${action}.open`)}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t(`${action}.title`, { name })}>
        <div className="flex flex-col gap-5">
          {error ? <Alert tone="danger">{t(`errors.${error}`)}</Alert> : null}
          <p className="text-base text-muted">{t(`${action}.body`)}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t(`${action}.keep`)}
            </Button>
            <Button variant={reactivating ? "primary" : "danger"} loading={pending} onClick={confirm}>
              {pending ? t(`${action}.confirming`) : t(`${action}.confirm`)}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
