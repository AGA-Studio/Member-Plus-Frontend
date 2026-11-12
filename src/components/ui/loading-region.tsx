import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type LoadingRegionProps = {
  className?: string;
  children: ReactNode;
};

export async function LoadingRegion({ className, children }: LoadingRegionProps) {
  const t = await getTranslations("common");

  return (
    <div role="status" aria-busy="true" className={cx(
        "flex flex-col gap-6 transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0",
        className,
      )}>
      <span className="sr-only">{t("loading")}</span>
      {children}
    </div>
  );
}
