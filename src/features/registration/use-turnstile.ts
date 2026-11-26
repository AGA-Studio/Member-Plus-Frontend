import { useRef, useState } from "react";
import type { TurnstileStatus } from "@/features/auth/turnstile-widget";

const freshTokenTimeoutMilliseconds = 15_000;

export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileStatus>("pending");
  const [resetCount, setResetCount] = useState(0);
  const settleRef = useRef<((token: string | null) => void) | null>(null);

  function onToken(nextToken: string | null) {
    setToken(nextToken);
    if (nextToken) settleRef.current?.(nextToken);
  }

  function onStatusChange(nextStatus: TurnstileStatus) {
    setStatus(nextStatus);
    if (nextStatus === "unavailable") settleRef.current?.(null);
  }

  function reset() {
    setResetCount((count) => count + 1);
  }

  function requestFreshToken(): Promise<string | null> {
    if (status === "unavailable") return Promise.resolve(null);

    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => settle(null), freshTokenTimeoutMilliseconds);

      function settle(freshToken: string | null) {
        window.clearTimeout(timeout);
        settleRef.current = null;
        resolve(freshToken);
      }

      settleRef.current = settle;
      reset();
    });
  }

  return { token, status, resetCount, onToken, onStatusChange, reset, requestFreshToken };
}
