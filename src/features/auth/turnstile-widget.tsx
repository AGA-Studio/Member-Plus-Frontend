"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

export type TurnstileStatus = "pending" | "ready" | "unavailable";

type TurnstileWidgetProps = {
  siteKey: string;
  resetCount: number;
  onToken: (token: string | null) => void;
  onStatusChange: (status: TurnstileStatus) => void;
};

const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

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

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      const container = containerRef.current;
      if (cancelled || !container || !window.turnstile) return;

      onTokenRef.current(null);
      onStatusRef.current("pending");
      setFailed(false);
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
    }

    loadTurnstileScript()
      .then(renderWidget)
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        onStatusRef.current("unavailable");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [siteKey, language]);

  useEffect(() => {
    if (resetCount === 0 || widgetIdRef.current === null) return;

    onTokenRef.current(null);
    onStatusRef.current("pending");
    window.turnstile?.reset(widgetIdRef.current);
  }, [resetCount]);

  return <div ref={containerRef} role="group" aria-label={t("label")} className={cx(!failed && "min-h-16")} />;
}
