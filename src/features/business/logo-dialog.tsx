"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { BusinessLogo } from "@/components/ui/business-logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { cx } from "@/lib/cx";
import { useToast } from "@/components/ui/toast-provider";
import { useAttempt, useGuardedAction } from "@/lib/use-action-guard";
import { removeLogoAction, uploadLogoAction, type LogoState } from "./actions";

type LogoDialogProps = {
  businessName: string;
  initials: string;
  logoUrl: string | null;
  userName: string;
  compact?: boolean;
};

const initialState: LogoState = { status: "idle" };
const maxLogoBytes = 2 * 1024 * 1024;

export function LogoDialog({ businessName, initials, logoUrl, userName, compact = false }: LogoDialogProps) {
  const t = useTranslations("business.logo");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileTooLarge, setFileTooLarge] = useState(false);
  const [removing, startRemoving] = useTransition();
  const attempt = useAttempt();
  const guardedUpload = useGuardedAction(uploadLogoAction, t("errors.unavailable"));
  const [state, formAction, saving] = useActionState(guardedUpload, initialState);
  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = open && !(state.status === "saved" && state !== acknowledgedState);

  useEffect(() => {
    if (state.status === "saved") show("success", toasts("logoSaved"));
  }, [state, show, toasts]);

  function openDialog() {
    setAcknowledgedState(state);
    setFileName("");
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
          "group flex items-center rounded-full text-left transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97",
          compact ? "h-12 w-full justify-center" : "min-w-0 flex-1 gap-3 py-1 pl-1 pr-4",
        )}
      >
        <span className="relative flex size-12 shrink-0 items-center justify-center">
          <BusinessLogo name={businessName} initials={initials} logoUrl={logoUrl} />
          {compact ? (
            <span
              aria-hidden
              className="absolute bottom-0.5 right-0.5 flex size-5 scale-75 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xs transition-[opacity,scale] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            >
              <Pencil strokeWidth={2.5} className="size-3" />
            </span>
          ) : null}
        </span>
        {compact ? null : (
          <span className="flex min-w-0 flex-1 flex-col transition-opacity duration-200 ease-out delay-100 starting:opacity-0">
            <span className="truncate text-base font-semibold text-foreground">{businessName}</span>
            <span className="relative h-5 text-sm">
              <span className="absolute inset-0 truncate text-muted transition-[opacity,translate] duration-200 ease-out group-hover:-translate-y-1 group-hover:opacity-0 group-focus-visible:-translate-y-1 group-focus-visible:opacity-0">
                {userName}
              </span>
              <span className="absolute inset-0 flex translate-y-1 items-center gap-1 truncate text-primary-text opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <Pencil aria-hidden strokeWidth={2} className="size-3.5 shrink-0" />
                {t("editHint")}
              </span>
            </span>
          </span>
        )}
      </button>
      </Tooltip>
      <Dialog open={visible} onClose={() => setOpen(false)} title={t("title")}>
        <form action={formAction} noValidate className="flex flex-col gap-5">
          <p className="text-base text-muted">{t("description")}</p>
          {fileTooLarge ? (
            <Alert tone="danger">{t("errors.tooLarge")}</Alert>
          ) : state.error ? (
            <Alert tone="danger">{t(`errors.${state.error}`)}</Alert>
          ) : null}
          <div className="flex items-center gap-4 rounded-md border border-border p-4">
            <BusinessLogo
              name={businessName}
              initials={initials}
              logoUrl={logoUrl}
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
                  const file = event.target.files?.[0];
                  const tooLarge = Boolean(file && file.size > maxLogoBytes);
                  setFileTooLarge(tooLarge);
                  if (tooLarge) event.target.value = "";
                  setFileName(tooLarge ? "" : (file?.name ?? ""));
                }}
              />
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                {t("choose")}
              </Button>
              <span className="truncate text-sm text-muted">{fileName || t("formats")}</span>
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
