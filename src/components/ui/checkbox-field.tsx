"use client";

import { CircleAlert } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "className"> & {
  error?: string;
  children: ReactNode;
};

export function CheckboxField({ error, children, ...rest }: CheckboxFieldProps) {
  const messageId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-foreground">
        <input
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className="size-5 shrink-0 cursor-pointer rounded-xs accent-primary transition-transform duration-150 ease-out active:scale-97"
          {...rest}
        />
        <span>{children}</span>
      </label>
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
