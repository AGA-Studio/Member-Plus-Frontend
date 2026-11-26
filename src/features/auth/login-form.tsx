"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { loginWithBackend, type LoginFailure, type LoginRole } from "./auth-client";
import { useEntryTransition } from "./entry-transition";
import { TurnstileWidget, type TurnstileStatus } from "./turnstile-widget";

const enterClasses =
  "transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0";

const roleHomePaths: Record<LoginRole, string> = {
  cashier: "/caja",
  admin: "/panel",
  platform: "/plataforma",
};

type LoginFormProps = {
  turnstileSiteKey: string;
  initialEmail?: string;
};

export function LoginForm({ turnstileSiteKey, initialEmail = "" }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { begin } = useEntryTransition();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<"emailRequired" | null>(null);
  const [passwordError, setPasswordError] = useState<"passwordRequired" | null>(null);
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>("pending");
  const [turnstileResets, setTurnstileResets] = useState(0);
  const widgetEnabled = turnstileSiteKey !== "";
  const waitingForWidget = widgetEnabled && turnstileStatus === "pending";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const trimmedEmail = email.trim();

    setFailure(null);
    setEmailError(trimmedEmail ? null : "emailRequired");
    setPasswordError(password ? null : "passwordRequired");
    if (!trimmedEmail || !password) return;

    startTransition(async () => {
      const outcome = await loginWithBackend(trimmedEmail, password, turnstileToken);

      if (outcome.ok) {
        const playsIntro = begin();
        router.replace(playsIntro ? roleHomePaths[outcome.role] : `${roleHomePaths[outcome.role]}?toast=signedIn`);
        router.refresh();
        return;
      }

      setFailure(outcome);
      if (widgetEnabled) setTurnstileResets((count) => count + 1);
    });
  }

  const failureMessage = failure
    ? failure.kind === "locked"
      ? t("errors.locked", { minutes: failure.minutes })
      : t(`errors.${failure.kind}`)
    : undefined;
  const passwordMessage = failureMessage ?? (passwordError ? t(`errors.${passwordError}`) : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <div className={`flex flex-col gap-5 delay-50 ${enterClasses}`}>
        <TextField
          name="email"
          type="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError ? t(`errors.${emailError}`) : undefined}
        />
        <TextField
          name="password"
          type="password"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          autoFocus={initialEmail !== ""}
          error={passwordMessage}
        />
      </div>
      <div className={`flex flex-col gap-4 delay-100 ${enterClasses}`}>
        {widgetEnabled ? (
          <div className="flex flex-col gap-2">
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              resetCount={turnstileResets}
              onToken={setTurnstileToken}
              onStatusChange={setTurnstileStatus}
            />
            {turnstileStatus === "unavailable" ? (
              <p role="status" className="text-sm text-muted">
                {t("turnstile.unavailable")}
              </p>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" size="lg" fullWidth loading={pending} disabled={waitingForWidget}>
          {pending ? t("submitting") : t("submit")}
        </Button>
        <p className="text-center text-sm text-muted">{t("help")}</p>
        <p className="text-center text-sm text-muted">
          {t("noAccount")}{" "}
          <Link
            href="/registro"
            className="inline-flex min-h-11 items-center font-semibold text-primary-text underline-offset-4 transition-transform duration-150 ease-out hover:underline active:scale-97"
          >
            {t("createAccount")}
          </Link>
        </p>
      </div>
    </form>
  );
}
