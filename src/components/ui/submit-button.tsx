"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "./button";

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  variant?: ButtonVariant;
};

export function SubmitButton({ label, pendingLabel, variant }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} loading={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
