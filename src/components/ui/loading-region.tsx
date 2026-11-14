import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type LoadingRegionProps = {
  className?: string;
  quick?: boolean;
  children: ReactNode;
};

export async function LoadingRegion({ className, quick = false, children }: LoadingRegionProps) {
  const t = await getTranslations("common");

  return (
    <div role="status" aria-busy="true" className={cx(
        "flex flex-col gap-6",
        quick
          ? "transition-opacity delay-100 duration-150 ease-out starting:opacity-0"
          : "transition-[opacity,translate] delay-150 duration-250 ease-out starting:translate-y-2 starting:opacity-0",
        className,
      )}>
      <span className="sr-only">{t("loading")}</span>
      {children}
    </div>
  );
}
