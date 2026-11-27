"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  variant?: "modal" | "wide" | "drawer";
} & ({ dismissible?: true; onClose: () => void } | { dismissible: false; onClose?: never });

const variantClasses = {
  modal:
    "m-auto w-11/12 max-w-md rounded-xl scale-95 open:scale-100 starting:open:scale-95",
  wide:
    "m-auto w-11/12 max-w-2xl rounded-xl scale-95 open:scale-100 starting:open:scale-95",
  drawer:
    "mb-0 ml-0 mt-auto w-full max-w-none rounded-t-xl translate-y-8 open:translate-y-0 starting:open:translate-y-8 lg:my-0 lg:ml-auto lg:mr-0 lg:h-dvh lg:max-h-none lg:max-w-md lg:rounded-none lg:translate-y-0 lg:translate-x-8 lg:open:translate-x-0 lg:starting:open:translate-x-8",
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "modal",
  dismissible = true,
}: DialogProps) {
  const t = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: se evita el cierre nativo (que dispararía el evento `close`
        // y con él onClose) y se delega al padre, que cierra por estado.
        event.preventDefault();
        onClose?.();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}
      onKeyDown={(event) => {
        if (!dismissible && event.key === "Escape") event.preventDefault();
      }}
      className={cx(
        "overflow-hidden bg-surface p-0 text-foreground shadow-lg opacity-0 open:flex open:flex-col open:opacity-100 starting:open:opacity-0",
        "transition-[opacity,scale,translate,display,overlay] duration-200 ease-out transition-discrete",
        "backdrop:bg-foreground/40 dark:backdrop:bg-ink-950/70 backdrop:opacity-0 backdrop:backdrop-blur-md open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        "backdrop:transition-[opacity,display,overlay] backdrop:duration-200 backdrop:ease-out backdrop:transition-discrete",
        variantClasses[variant],
      )}
    >
      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-6">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <h2 id={titleId} className="text-subheading text-foreground">
            {title}
          </h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97"
            >
              <X aria-hidden strokeWidth={1.75} className="size-5" />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </dialog>
  );
}
