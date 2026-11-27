"use client";

import { SquarePen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AssistantComposer } from "./assistant-composer";
import { AssistantMark } from "./assistant-mark";
import { AssistantThread } from "./assistant-thread";
import type { AssistantChat } from "./use-assistant-chat";

type AssistantPanelProps = {
  open: boolean;
  userName: string;
  chat: AssistantChat;
  onClose: () => void;
};

const headerButtonClasses =
  "flex size-11 items-center justify-center rounded-md text-muted transition-[background-color,color,opacity,transform] duration-150 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97 disabled:pointer-events-none disabled:opacity-40";

export function AssistantPanel({ open, userName, chat, onClose }: AssistantPanelProps) {
  const t = useTranslations("assistant");
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function startOver() {
    chat.reset();
    setConfirming(false);
    inputRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (event.target !== dialogRef.current) return;
        event.preventDefault();
        onClose();
      }}
      onClose={(event) => {
        if (event.target === dialogRef.current && open) onClose();
      }}
      className="group/assistant fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 text-foreground transition-[display,overlay] duration-300 transition-discrete backdrop:bg-transparent"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 bottom-17 size-24 scale-50 rounded-full bg-primary opacity-0 transition-[scale,opacity] delay-50 duration-250 ease-in-out group-open/assistant:scale-2500 group-open/assistant:opacity-100 group-open/assistant:delay-0 group-open/assistant:duration-300 group-has-data-sticky-bar/shell:bottom-37 motion-reduce:hidden md:group-open/assistant:scale-3500 lg:right-1 lg:bottom-1 lg:group-has-data-sticky-bar/shell:bottom-21 xl:group-open/assistant:scale-5000 2xl:group-open/assistant:scale-7000 starting:group-open/assistant:scale-50"
      />
      <div className="relative flex h-full translate-y-6 flex-col bg-background opacity-0 transition-[opacity,translate] duration-150 ease-out group-open/assistant:translate-y-0 group-open/assistant:opacity-100 group-open/assistant:delay-150 group-open/assistant:duration-200 starting:group-open/assistant:translate-y-6 starting:group-open/assistant:opacity-0">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-18 w-full max-w-form items-center gap-3 px-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <AssistantMark className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 id={titleId} className="truncate text-subheading text-foreground">
                {t("title")}
              </h2>
              <p className="truncate text-sm text-muted">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={chat.messages.length === 0}
              aria-label={t("newChat")}
              className={headerButtonClasses}
            >
              <SquarePen aria-hidden strokeWidth={1.75} className="size-5" />
            </button>
            <button type="button" onClick={onClose} aria-label={t("close")} className={headerButtonClasses}>
              <X aria-hidden strokeWidth={1.75} className="size-5" />
            </button>
          </div>
        </header>
        <AssistantThread chat={chat} open={open} userName={userName} onNavigate={onClose} />
        <AssistantComposer chat={chat} inputRef={inputRef} />
      </div>
      <Dialog open={confirming} onClose={() => setConfirming(false)} title={t("newChatTitle")}>
        <p className="text-base text-muted">{t("newChatBody")}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            {t("newChatKeep")}
          </Button>
          <Button variant="danger" onClick={startOver}>
            {t("newChatConfirm")}
          </Button>
        </div>
      </Dialog>
    </dialog>
  );
}
