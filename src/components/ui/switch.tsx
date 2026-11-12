"use client";

import { cx } from "@/lib/cx";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  ...aria
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out",
        "disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-primary" : "bg-border-strong",
      )}
      {...aria}
    >
      <span
        aria-hidden
        className={cx(
          "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-xs",
          "transition-transform duration-150 ease-out",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
