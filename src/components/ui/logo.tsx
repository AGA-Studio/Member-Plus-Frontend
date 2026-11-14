import Image from "next/image";
import { useTranslations } from "next-intl";
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
  surface?: "light" | "dark";
  className?: string;
  entryTarget?: boolean;
};

export function Logo({ variant = "full", surface = "light", className, entryTarget = false }: LogoProps) {
  const t = useTranslations("common");

  return (
    <Image
      src={sources[variant][surface]}
      alt={t("brandName")}
      priority
      className={className}
      data-entry-target={entryTarget ? "logo" : undefined}
    />
  );
}
