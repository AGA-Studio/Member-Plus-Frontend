import Image from "next/image";
import { useTranslations } from "next-intl";
import { cx } from "@/lib/cx";
import logoOnLight from "@/assets/brand/logo-on-light.png";
import logoOnDark from "@/assets/brand/logo-on-dark.png";
import iconOnLight from "@/assets/brand/icon-on-light.png";
import iconOnDark from "@/assets/brand/icon-on-dark.png";

const sources = {
  full: { light: logoOnLight, dark: logoOnDark },
  icon: { light: iconOnLight, dark: iconOnDark },
};

type LogoProps = {
  variant?: "full" | "icon";
  surface?: "light" | "dark" | "auto";
  className?: string;
  entryTarget?: boolean;
};

export function Logo({ variant = "full", surface = "auto", className, entryTarget = false }: LogoProps) {
  const t = useTranslations("common");
  const entry = entryTarget ? "logo" : undefined;

  if (surface !== "auto") {
    return (
      <Image src={sources[variant][surface]} alt={t("brandName")} priority className={className} data-entry-target={entry} />
    );
  }

  return (
    <>
      <Image
        src={sources[variant].light}
        alt={t("brandName")}
        priority
        className={cx(className, "dark:hidden")}
        data-entry-target={entry}
      />
      <Image
        src={sources[variant].dark}
        alt={t("brandName")}
        priority
        className={cx(className, "hidden dark:block")}
        data-entry-target={entry}
      />
    </>
  );
}
