"use client";

import { ArrowDown, ArrowRight, CircleAlert, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import type { AssistantFailure } from "@/lib/assistant";
import { cx } from "@/lib/cx";
import { revealClasses } from "@/lib/motion";
import { AssistantMark } from "./assistant-mark";
import { AssistantAvatar, AssistantMessage, ScrollReveal } from "./assistant-message";
import type { AssistantChat } from "./use-assistant-chat";

const bottomThreshold = 80;
const suggestionKeys = ["customers", "expiring", "movements", "tiers"] as const;
const typingDots = ["animate-typing-first", "animate-typing-second", "animate-typing-third"] as const;

function Typing() {
  const t = useTranslations("assistant");

  return (
    <ScrollReveal origin="left">
      <div role="status" className="flex items-center gap-3">
        <AssistantAvatar />
        <span className="flex h-10 items-center gap-1.5 rounded-xl rounded-bl-xs bg-surface-muted px-4">
          {typingDots.map((animation) => (
            <span key={animation} aria-hidden className={cx("size-2 rounded-full bg-muted", animation)} />
          ))}
          <span className="sr-only">{t("typing")}</span>
        </span>
      </div>
    </ScrollReveal>
  );
}

type FailureProps = {
  failure: AssistantFailure;
  onRetry: () => void;
  onNavigate: () => void;
};

function Failure({ failure, onRetry, onNavigate }: FailureProps) {
  const t = useTranslations("assistant");

  return (
    <ScrollReveal origin="left">
      <div role="alert" className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-warning-text" />
        <div className="flex flex-col items-start gap-3">
          <p className="text-base text-foreground">{t(`failures.${failure}`)}</p>
          {failure === "planRequired" ? (
            <Link href="/plan" onClick={onNavigate} className={buttonStyles({ variant: "secondary", size: "md" })}>
              {t("seePlans")}
              <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
            </Link>
          ) : failure === "sessionExpired" ? null : (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCcw aria-hidden strokeWidth={1.75} className="size-4" />
              {t("retry")}
            </Button>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

type WelcomeProps = {
  userName: string;
  onAsk: (question: string) => void;
};

function Welcome({ userName, onAsk }: WelcomeProps) {
  const t = useTranslations("assistant");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[opacity,scale,rotate] delay-200 duration-300 ease-out starting:-rotate-45 starting:scale-50 starting:opacity-0">
          <AssistantMark className="size-8" />
        </span>
        <h3 className={cx("text-title text-foreground", revealClasses(5))}>{t("greeting", { name: userName })}</h3>
        <p className={cx("text-base text-muted", revealClasses(5))}>{t("intro")}</p>
      </div>
      <ul className="grid w-full gap-3 sm:grid-cols-2">
        {suggestionKeys.map((key, index) => (
          <li key={key} className={revealClasses(index + 2)}>
            <button
              type="button"
              onClick={() => onAsk(t(`suggestions.${key}`))}
              className="flex h-full min-h-13 w-full items-center rounded-lg border border-border bg-surface px-4 py-3 text-left text-base text-foreground shadow-xs transition-[background-color,border-color,transform] duration-150 ease-out hover:border-primary hover:bg-primary-soft active:scale-97"
            >
              {t(`suggestions.${key}`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type AssistantThreadProps = {
  chat: AssistantChat;
  open: boolean;
  userName: string;
  onNavigate: () => void;
};

export function AssistantThread({ chat, open, userName, onNavigate }: AssistantThreadProps) {
  const t = useTranslations("assistant");
  const { messages, pending, failure } = chat;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const lastTopRef = useRef(0);
  const [atBottom, setAtBottom] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduced ? "smooth" : "auto" });
  }, []);

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollTop, scrollHeight, clientHeight } = scroller;
    const distance = scrollHeight - scrollTop - clientHeight;
    const near = distance < bottomThreshold;
    if (distance <= 1) followRef.current = true;
    else if (scrollTop < lastTopRef.current) followRef.current = false;
    else if (near) followRef.current = true;
    lastTopRef.current = scrollTop;
    setAtBottom(near || followRef.current);
    setScrolled(scrollTop > 4);
  }

  const lastRole = messages.at(-1)?.role;

  useEffect(() => {
    if (lastRole === "user") followRef.current = true;
    if (followRef.current) scrollToBottom(true);
  }, [messages.length, pending, failure, lastRole, scrollToBottom]);

  useEffect(() => {
    if (open && followRef.current) scrollToBottom(false);
  }, [open, scrollToBottom]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (followRef.current) {
        scrollToBottom(true);
        return;
      }
      const scroller = scrollerRef.current;
      if (scroller) setAtBottom(scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < bottomThreshold);
    });
    observer.observe(content);

    return () => observer.disconnect();
  }, [scrollToBottom]);

  const empty = messages.length === 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-x-0 -top-px z-10 h-px bg-border shadow-md transition-opacity duration-200 ease-out",
          !scrolled && "opacity-0",
        )}
      />
      <div ref={scrollerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overscroll-contain">
        <div ref={contentRef} className="mx-auto flex min-h-full w-full max-w-form flex-col px-4 py-6">
          {empty ? (
            <Welcome userName={userName} onAsk={chat.send} />
          ) : (
            <div className="flex flex-col gap-6">
              <ol aria-live="polite" className="flex flex-col gap-6">
                {messages.map((message) => (
                  <AssistantMessage key={message.id} message={message} onShown={chat.markShown} />
                ))}
              </ol>
              {pending ? <Typing /> : null}
              {failure ? <Failure failure={failure} onRetry={chat.retry} onNavigate={onNavigate} /> : null}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          followRef.current = true;
          scrollToBottom(true);
        }}
        aria-label={t("scrollDown")}
        tabIndex={atBottom || empty ? -1 : 0}
        aria-hidden={atBottom || empty}
        className={cx(
          "absolute bottom-3 left-1/2 z-10 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition-[opacity,translate,scale] duration-200 ease-out hover:bg-surface-muted active:scale-97",
          (atBottom || empty) && "pointer-events-none translate-y-3 scale-90 opacity-0",
        )}
      >
        <ArrowDown aria-hidden strokeWidth={1.75} className="size-5" />
      </button>
    </div>
  );
}
