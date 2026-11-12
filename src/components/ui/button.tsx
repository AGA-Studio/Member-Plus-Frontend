import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-primary-soft text-primary-text hover:bg-primary-soft/70",
  outline:
    "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-6 text-base",
  xl: "h-16 px-8 text-lg",
};

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cx(
    "inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold",
    "transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out",
    "active:scale-97 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
