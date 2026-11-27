import { useTranslations } from "next-intl";
import { LinkTabs } from "@/components/ui/link-tabs";

export function PlatformTabs({ active }: { active: "businesses" | "plans" }) {
  const t = useTranslations("platform.tabs");

  return (
    <LinkTabs
      label={t("label")}
      tabs={[
        { href: "/plataforma", label: t("businesses"), active: active === "businesses" },
        { href: "/plataforma/planes", label: t("plans"), active: active === "plans" },
      ]}
    />
  );
}
