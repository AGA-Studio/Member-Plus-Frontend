"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast-provider";

function useFailureToast(): (message: string) => void {
  const t = useTranslations("common");
  const { show } = useToast();

  return (message) => {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    show("danger", offline ? t("offline") : message);
  };
}

export function useGuardedAction<State, Payload>(
  action: (previousState: State, payload: Payload) => Promise<State>,
  failureMessage: string,
): (previousState: State, payload: Payload) => Promise<State> {
  const showFailure = useFailureToast();

  return async (previousState, payload) => {
    try {
      return await action(previousState, payload);
    } catch {
      showFailure(failureMessage);
      return previousState;
    }
  };
}

export function useAttempt(): <Result>(run: () => Promise<Result>, failureMessage: string) => Promise<Result | undefined> {
  const showFailure = useFailureToast();

  return async (run, failureMessage) => {
    try {
      return await run();
    } catch {
      showFailure(failureMessage);
      return undefined;
    }
  };
}
