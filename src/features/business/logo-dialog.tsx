"use client";

import { ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { BusinessLogo } from "@/components/ui/business-logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { useAttempt, useGuardedAction } from "@/lib/use-action-guard";
import { removeLogoAction, uploadLogoAction, type LogoState } from "./actions";

type LogoDialogProps = {
  businessName: string;
  initials: string;
  logoUrl: string | null;
};

const initialState: LogoState = { status: "idle" };
const maxLogoBytes = 2 * 1024 * 1024;

export function LogoDialog({ businessName, initials, logoUrl }: LogoDialogProps) {
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
      <button
        type="button"
        onClick={openDialog}
        aria-label={t("edit")}
        className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-97"
      >
        <BusinessLogo name={businessName} initials={initials} logoUrl={logoUrl} />
        <span className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">{businessName}</span>
        <ImagePlus
          aria-hidden
          strokeWidth={1.75}
          className="size-5 shrink-0 text-muted opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </button>
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
