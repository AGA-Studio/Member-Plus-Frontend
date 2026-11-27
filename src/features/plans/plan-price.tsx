import { useFormatter, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";

export function PlanPrice({ cents }: { cents: number }) {
  const t = useTranslations("plans");
  const format = useFormatter();

  return <>{cents === 0 ? t("free") : t("monthly", { price: formatMoney(format, cents) })}</>;
}
