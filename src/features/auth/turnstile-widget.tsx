"use client";

import { useLocale, useTranslations } from "next-intl";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

export type TurnstileStatus = "pending" | "ready" | "unavailable";

type TurnstileWidgetProps = {
  siteKey: string;
  resetCount: number;
  onToken: (token: string | null) => void;
  onStatusChange: (status: TurnstileStatus) => void;
};

const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({ siteKey, resetCount, onToken, onStatusChange }: TurnstileWidgetProps) {
  const t = useTranslations("auth.login.turnstile");
  const language = useLocale().split("-")[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const onTokenRef = useRef(onToken);
  const onStatusRef = useRef(onStatusChange);

  useEffect(() => {
    onTokenRef.current = onToken;
    onStatusRef.current = onStatusChange;
  });

  const renderWidget = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.turnstile || widgetIdRef.current !== null) return;

    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      language,
      callback: (token) => {
        setFailed(false);
        onTokenRef.current(token);
        onStatusRef.current("ready");
      },
      "expired-callback": () => {
        onTokenRef.current(null);
        onStatusRef.current("pending");
      },
      "error-callback": () => {
        setFailed(true);
        onTokenRef.current(null);
        onStatusRef.current("unavailable");
      },
    });
  }, [siteKey, language]);

  useEffect(() => {
    if (resetCount === 0 || widgetIdRef.current === null) return;

    onTokenRef.current(null);
    onStatusRef.current("pending");
    window.turnstile?.reset(widgetIdRef.current);
  }, [resetCount]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, []);

  return (
    <>
      <Script
        src={scriptUrl}
        strategy="afterInteractive"
        onReady={renderWidget}
        onError={() => {
          setFailed(true);
          onStatusRef.current("unavailable");
        }}
      />
      <div ref={containerRef} role="group" aria-label={t("label")} className={cx(!failed && "min-h-16")} />
    </>
  );
}
