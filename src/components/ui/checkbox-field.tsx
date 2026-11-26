"use client";

import { CircleAlert } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "className"> & {
  error?: string;
  children: ReactNode;
};

export function CheckboxField({ error, children, ...rest }: CheckboxFieldProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className="mt-3 size-5 shrink-0 cursor-pointer rounded-xs accent-primary transition-transform duration-150 ease-out active:scale-97"
          {...rest}
        />
        <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-center text-base text-foreground">
          <span>{children}</span>
        </label>
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
      ) : null}
    </div>
  );
}
