"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { countWords, limitBlocks, parseReply, revealStep, type AssistantMessage as Message } from "@/lib/assistant";
import { cx } from "@/lib/cx";
import { useInView } from "@/lib/use-in-view";
import { AssistantMark } from "./assistant-mark";
import { AssistantMarkdown } from "./assistant-markdown";

const revealMilliseconds = 30;
const copiedMilliseconds = 1600;

type ScrollRevealProps = {
  origin: "left" | "right";
  children: ReactNode;
};

export function ScrollReveal({ origin, children }: ScrollRevealProps) {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "0px" });

  return (
    <div
      ref={ref}
      className={cx(
        "transition-[opacity,translate,scale] duration-300 ease-out",
        origin === "right" ? "origin-bottom-right" : "origin-bottom-left",
        !visible && "translate-y-4 scale-95 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

export function AssistantAvatar() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text">
      <AssistantMark className="size-4" />
    </span>
  );
}

function CopyButton({ content }: { content: string }) {
  const t = useTranslations("assistant");
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), copiedMilliseconds);
  }

  const iconClasses = "absolute size-4 transition-[opacity,scale] duration-200 ease-out";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t("copied") : t("copy")}
      className="relative -ml-3 flex size-11 items-center justify-center rounded-md text-muted transition-[opacity,background-color,color,transform] duration-200 ease-out hover:bg-surface-muted hover:text-foreground active:scale-97 starting:opacity-0"
    >
      <Copy aria-hidden strokeWidth={1.75} className={cx(iconClasses, copied && "scale-50 opacity-0")} />
      <Check
        aria-hidden
        strokeWidth={1.75}
        className={cx(iconClasses, "text-success-text", !copied && "scale-50 opacity-0")}
      />
    </button>
  );
}

type ReplyProps = {
  message: Message;
  onShown: (id: string) => void;
};

function Reply({ message, onShown }: ReplyProps) {
  const t = useTranslations("assistant");
  const blocks = useMemo(() => parseReply(message.content), [message.content]);
  const total = useMemo(() => countWords(blocks), [blocks]);
  const [streamed] = useState(message.fresh);
  const [shown, setShown] = useState(() => (message.fresh ? 0 : total));
  const done = shown >= total;

  useEffect(() => {
    if (done) {
      if (message.fresh) onShown(message.id);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => setShown((current) => (reduced ? total : current + revealStep(total))),
      revealMilliseconds,
    );

    return () => window.clearTimeout(timer);
  }, [done, shown, total, message.fresh, message.id, onShown]);

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div aria-busy={!done} className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <span className="sr-only">{t("assistantName")}</span>
        <AssistantMarkdown blocks={done ? blocks : limitBlocks(blocks, shown)} animated={streamed} />
        {done ? <CopyButton content={message.content} /> : null}
      </div>
    </div>
  );
}

export function AssistantMessage({ message, onShown }: ReplyProps) {
  const t = useTranslations("assistant");

  if (message.role === "assistant") {
    return (
      <li>
        <ScrollReveal origin="left">
          <Reply message={message} onShown={onShown} />
        </ScrollReveal>
      </li>
    );
  }

  return (
    <li>
      <ScrollReveal origin="right">
        <div className="flex justify-end">
          <p className="max-w-5/6 whitespace-pre-wrap wrap-anywhere rounded-xl rounded-br-xs bg-primary px-4 py-3 text-base text-primary-foreground shadow-sm">
            <span className="sr-only">{t("you")} </span>
            {message.content}
          </p>
        </div>
      </ScrollReveal>
    </li>
  );
}
