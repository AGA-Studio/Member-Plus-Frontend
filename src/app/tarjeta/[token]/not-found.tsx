import { Link2Off } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SystemMessage } from "@/components/ui/system-message";

export default async function CardNotFound() {
  const t = await getTranslations("card.invalid");

  return (
    <SystemMessage icon={Link2Off} tone="warning" title={t("title")} description={t("description")}>
      {null}
    </SystemMessage>
  );
}
