"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Avatar, getInitials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PhotoField } from "@/components/ui/photo-field";
import { useToast } from "@/components/ui/toast-provider";
import { cx } from "@/lib/cx";
import { useAttempt, useGuardedAction } from "@/lib/use-action-guard";
import { useNotifyOnce } from "@/lib/use-notify-once";
import {
  removeProfilePhotoAction,
  uploadProfilePhotoAction,
  type ProfilePhotoState,
} from "./profile-actions";

type ProfileButtonProps = {
  fullName: string;
  photoUrl: string | null;
  tone?: "default" | "inverse";
  avatarClassName?: string;
  entryOrigin?: boolean;
};

const initialState: ProfilePhotoState = { status: "idle" };

export function ProfileButton({
  fullName,
  photoUrl,
  tone = "default",
  avatarClassName,
  entryOrigin = false,
}: ProfileButtonProps) {
  const t = useTranslations("common.profile");
  const common = useTranslations("common");
  const toasts = useTranslations("toasts");
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [removing, startRemoving] = useTransition();
  const attempt = useAttempt();
  const guardedUpload = useGuardedAction(uploadProfilePhotoAction, t("errors.unavailable"));
  const [state, formAction, saving] = useActionState(guardedUpload, initialState);
  const [acknowledgedState, setAcknowledgedState] = useState(state);
  const visible = open && !(state.status === "saved" && state !== acknowledgedState);

  useNotifyOnce(state, state.status === "saved", () => show("success", toasts("profilePhotoSaved")));

  function openDialog() {
    setAcknowledgedState(state);
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  function remove() {
    startRemoving(async () => {
      const removed = await attempt(removeProfilePhotoAction, t("errors.unavailable"));
      if (removed) {
        setOpen(false);
        show("success", toasts("profilePhotoRemoved"));
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
        data-entry-target={entryOrigin ? "origin" : undefined}
        className="flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-97"
      >
        <Avatar
          name={fullName}
          photoUrl={photoUrl}
          className={cx(tone === "inverse" && "bg-white/10 text-white", avatarClassName)}
        />
      </button>
      <Dialog open={visible} onClose={() => setOpen(false)} title={t("title")}>
        <form action={formAction} noValidate className="flex flex-col gap-5">
          <p className="text-base text-muted">{t("description")}</p>
          {state.error ? <Alert tone="danger">{t(`errors.${state.error}`)}</Alert> : null}
          <PhotoField
            key={formKey}
            name="photo"
            label={t("photo")}
            currentUrl={photoUrl}
            fallback={<span aria-hidden className="text-base font-medium">{getInitials(fullName)}</span>}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {photoUrl ? (
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
