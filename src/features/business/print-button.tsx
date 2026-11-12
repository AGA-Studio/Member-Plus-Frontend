"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type PrintButtonProps = {
  label: string;
};

export function PrintButton({ label }: PrintButtonProps) {
  return (
    <Button onClick={() => window.print()}>
      <Printer aria-hidden strokeWidth={1.75} className="size-5" />
      {label}
    </Button>
  );
}
