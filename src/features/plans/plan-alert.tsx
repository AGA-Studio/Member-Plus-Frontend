"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

type PlanAlertProps = {
  attempt: unknown;
  onNavigate: () => void;
  children: ReactNode;
};

export function PlanAlert({ attempt, onNavigate, children }: PlanAlertProps) {
  const t = useTranslations("plans");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [attempt]);

  return (
    <div ref={ref}>
      <Alert tone="danger">
        <p>{children}</p>
        <Link
          href="/plan"
          onClick={onNavigate}
          className="flex h-11 w-fit items-center gap-2 rounded-sm font-semibold underline transition-transform duration-150 ease-out active:scale-97"
        >
          {t("viewUsage")}
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
        </Link>
      </Alert>
    </div>
  );
}
