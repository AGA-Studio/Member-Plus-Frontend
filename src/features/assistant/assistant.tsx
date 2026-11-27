"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AssistantMark } from "./assistant-mark";
import { AssistantPanel } from "./assistant-panel";
import { useAssistantChat } from "./use-assistant-chat";

export function Assistant({ userName }: { userName: string }) {
  const t = useTranslations("assistant");
  const router = useRouter();
  const chat = useAssistantChat();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (chat.failure === "sessionExpired") router.replace("/login?toast=sessionExpired");
  }, [chat.failure, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-4 bottom-22 z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[background-color,opacity,scale] duration-200 ease-out group-has-data-sticky-bar/shell:bottom-42 hover:scale-105 hover:bg-primary-hover active:scale-97 lg:right-6 lg:bottom-6 lg:group-has-data-sticky-bar/shell:bottom-26 print:hidden starting:scale-50 starting:opacity-0"
      >
        <AssistantMark className="size-6" />
      </button>
      <AssistantPanel open={open} userName={userName} chat={chat} onClose={() => setOpen(false)} />
    </>
  );
}
