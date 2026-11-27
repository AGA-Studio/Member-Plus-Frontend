"use client";

import { ArrowUp, Square } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { messageMaxLength } from "@/lib/assistant";
import { cx } from "@/lib/cx";
import type { AssistantChat } from "./use-assistant-chat";

const counterThreshold = messageMaxLength - 200;

type AssistantComposerProps = {
  chat: AssistantChat;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

function fitHeight(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export function AssistantComposer({ chat, inputRef }: AssistantComposerProps) {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const canSend = draft.trim() !== "" && !chat.pending;
  const privacyPath = locale.startsWith("en") ? "/en/privacy" : "/privacidad";

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!chat.send(draft)) return;

    setDraft("");
    const input = inputRef.current;
    if (input) input.style.height = "auto";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  }

  const iconClasses = "absolute size-5 transition-[opacity,scale,translate] duration-200 ease-out";

  return (
    <div className="mx-auto flex w-full max-w-form flex-col gap-2 px-4 pb-4">
      <form
        onSubmit={submit}
        className="flex items-end gap-2 rounded-xl border border-border-strong bg-surface p-2 shadow-md transition-[border-color] duration-150 ease-out focus-within:border-primary"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={messageMaxLength}
          aria-label={t("inputLabel")}
          placeholder={t("placeholder")}
          onChange={(event) => {
            setDraft(event.target.value);
            fitHeight(event.target);
          }}
          onKeyDown={handleKeyDown}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted"
        />
        <button
          type={chat.pending ? "button" : "submit"}
          onClick={
            chat.pending
              ? (event) => {
                  event.preventDefault();
                  chat.stop();
                }
              : undefined
          }
          disabled={!chat.pending && !canSend}
          aria-label={chat.pending ? t("stop") : t("send")}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[background-color,opacity,scale] duration-200 ease-out hover:bg-primary-hover active:scale-90 disabled:scale-90 disabled:opacity-40"
        >
          <ArrowUp aria-hidden strokeWidth={1.75} className={cx(iconClasses, chat.pending && "-translate-y-4 opacity-0")} />
          <Square
            aria-hidden
            strokeWidth={1.75}
            className={cx(iconClasses, "fill-current", !chat.pending && "scale-50 opacity-0")}
          />
        </button>
      </form>
      <p className="text-center text-xs text-muted">
        {draft.length > counterThreshold ? (
          <span className="mr-2 font-semibold tabular-nums">
            {t("counter", { count: draft.length, max: messageMaxLength })}
          </span>
        ) : null}
        {t.rich("privacy", {
          link: (chunks) => (
            <a href={privacyPath} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
}
