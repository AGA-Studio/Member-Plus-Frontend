"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { username: "", fieldErrors: {} };

const enterClasses =
  "transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  const passwordError = state.formError
    ? t(`errors.${state.formError}`)
    : state.fieldErrors.password
      ? t(`errors.${state.fieldErrors.password}`)
      : undefined;
  const usernameError = state.fieldErrors.username
    ? t(`errors.${state.fieldErrors.username}`)
    : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <div className={`flex flex-col gap-5 delay-50 ${enterClasses}`}>
        <TextField
          name="username"
          label={t("username")}
          placeholder={t("usernamePlaceholder")}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username}
          error={usernameError}
        />
        <TextField
          name="password"
          type="password"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          error={passwordError}
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
