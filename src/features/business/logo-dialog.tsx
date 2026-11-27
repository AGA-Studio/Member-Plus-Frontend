"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { BusinessLogo } from "@/components/ui/business-logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { cx } from "@/lib/cx";
import { useToast } from "@/components/ui/toast-provider";
import { PlanAlert } from "@/features/plans/plan-alert";
import { useAttempt, useGuardedAction } from "@/lib/use-action-guard";
import { useNotifyOnce } from "@/lib/use-notify-once";
import { useSelectedImage } from "@/lib/use-selected-image";
import { removeLogoAction, uploadLogoAction, type LogoState } from "./actions";

type LogoDialogProps = {
  businessName: string;
  initials: string;
  logoUrl: string | null;
  compact?: boolean;
};

const initialState: LogoState = { status: "idle" };
const maxLogoBytes = 2 * 1024 * 1024;

export function LogoDialog({ businessName, initials, logoUrl, compact = false }: LogoDialogProps) {
  const t = useTranslations("business.logo");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const { file, previewUrl, select: setFile } = useSelectedImage();
  const [fileTooLarge, setFileTooLarge] = useState(false);
  const [removing, startRemoving] = useTransition();
  const attempt = useAttempt();
  const guardedUpload = useGuardedAction(uploadLogoAction, t("errors.unavailable"));
  const [state, formAction, saving] = useActionState(guardedUpload, initialState);
  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = open && !(state.status === "saved" && state !== acknowledgedState);

  useNotifyOnce(state, state.status === "saved", () => show("success", toasts("logoSaved")));

  function openDialog() {
    setAcknowledgedState(state);
    setFile(null);
    setFileTooLarge(false);
    setOpen(true);
  }

  function remove() {
    startRemoving(async () => {
      const removed = await attempt(removeLogoAction, t("errors.unavailable"));
      if (removed) {
        setOpen(false);
        show("success", toasts("logoRemoved"));
      } else if (removed === false) {
        show("danger", t("errors.unavailable"));
      }
    });
  }

  return (
    <>
      <Tooltip label={businessName} description={t("editHint")} disabled={!compact} className={compact ? "w-full" : "contents"}>
        <button
          type="button"
          onClick={openDialog}
          aria-label={t("edit")}
          className={cx(
            "group flex items-center text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-97",
            compact
              ? "h-12 w-full justify-center rounded-lg hover:bg-surface-muted"
              : "min-w-0 flex-1 gap-3 rounded-lg border border-border bg-surface-muted p-2 hover:border-border-strong",
          )}
        >
          <span className="relative flex size-12 shrink-0 items-center justify-center">
            <BusinessLogo name={businessName} initials={initials} logoUrl={logoUrl} />
            {compact ? (
              <span
                aria-hidden
                className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-surface bg-primary"
              />
            ) : null}
          </span>
          {compact ? null : (
            <>
              <span className="flex min-w-0 flex-1 flex-col transition-opacity duration-200 ease-out delay-100 starting:opacity-0">
                <span className="truncate text-base font-semibold text-foreground">{businessName}</span>
                <span className="flex items-center gap-1 truncate text-sm text-muted">
                  <Pencil aria-hidden strokeWidth={2} className="size-3.5 shrink-0" />
                  {t("editHint")}
                </span>
              </span>
              <span
                aria-hidden
                className="mr-2 size-3 shrink-0 rounded-full bg-primary transition-opacity duration-200 ease-out delay-100 starting:opacity-0"
              />
            </>
          )}
        </button>
      </Tooltip>
      <Dialog open={visible} onClose={() => setOpen(false)} title={t("title")}>
        <form action={formAction} noValidate className="flex flex-col gap-5">
          <p className="text-base text-muted">{t("description")}</p>
          {fileTooLarge ? (
            <Alert tone="danger">{t("errors.tooLarge")}</Alert>
          ) : state.error === "planRequired" ? (
            <PlanAlert attempt={state} onNavigate={() => setOpen(false)}>
              {t("errors.planRequired")}
            </PlanAlert>
          ) : state.error ? (
            <Alert tone="danger">{t(`errors.${state.error}`)}</Alert>
          ) : null}
          <div className="flex items-center gap-4 rounded-md border border-border p-4">
            <BusinessLogo
              name={businessName}
              initials={initials}
              logoUrl={previewUrl ?? logoUrl}
              className="size-16"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                ref={inputRef}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                tabIndex={-1}
                aria-label={t("choose")}
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  const tooLarge = Boolean(selected && selected.size > maxLogoBytes);
                  setFileTooLarge(tooLarge);
                  if (tooLarge) event.target.value = "";
                  setFile(tooLarge ? null : (selected ?? null));
                }}
              />
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                {t("choose")}
              </Button>
              <span className="truncate text-sm text-muted">{file?.name || t("formats")}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {logoUrl ? (
              <Button variant="ghost" loading={removing} onClick={remove}>
                {removing ? t("removing") : t("remove")}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {common("cancel")}
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}
