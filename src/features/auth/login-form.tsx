"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { loginWithBackend, type LoginFailure, type LoginRole } from "./auth-client";
import { useEntryTransition } from "./entry-transition";

const enterClasses =
  "transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0";

const roleHomePaths: Record<LoginRole, string> = {
  cashier: "/caja",
  admin: "/clientes",
  platform: "/plataforma",
};

export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { begin } = useEntryTransition();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<"emailRequired" | null>(null);
  const [passwordError, setPasswordError] = useState<"passwordRequired" | null>(null);
  const [failure, setFailure] = useState<LoginFailure | null>(null);

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
      const outcome = await loginWithBackend(trimmedEmail, password);

      if (outcome.ok) {
        const playsIntro = begin();
        router.replace(playsIntro ? roleHomePaths[outcome.role] : `${roleHomePaths[outcome.role]}?toast=signedIn`);
        router.refresh();
        return;
      }

      setFailure(outcome);
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
          error={passwordMessage}
        />
      </div>
      <div className={`flex flex-col gap-4 delay-100 ${enterClasses}`}>
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
        <p className="text-center text-sm text-muted">{t("help")}</p>
      </div>
    </form>
  );
}
