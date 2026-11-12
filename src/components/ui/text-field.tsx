"use client";

import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type InputHTMLAttributes, type Ref } from "react";
import { cx } from "@/lib/cx";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export function TextField({
  label,
  optional = false,
  hint,
  error,
  className,
  type = "text",
  ref,
  ...rest
}: TextFieldProps) {
  const t = useTranslations("common");
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error || hint);
  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {optional ? (
          <span className="font-normal text-muted"> {t("optional")}</span>
        ) : null}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && passwordVisible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={cx(
            "h-11 w-full rounded-md border bg-surface px-3 text-base text-foreground",
            "placeholder:text-muted transition-[border-color,background-color] duration-150 ease-out",
            "focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2",
            "disabled:bg-surface-muted disabled:opacity-60",
            error ? "border-danger" : "border-border-strong",
            isPassword && "pr-12",
            className,
          )}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? t("hidePassword") : t("showPassword")}
            aria-pressed={passwordVisible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-muted transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-97"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden strokeWidth={1.75} className="size-5" />
            ) : (
              <Eye aria-hidden strokeWidth={1.75} className="size-5" />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p
          id={messageId}
          role="alert"
          className="flex items-center gap-1.5 text-sm text-danger-text transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0"
        >
          <CircleAlert aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
