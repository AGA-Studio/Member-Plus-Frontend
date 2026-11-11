import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-display">{t("title")}</h1>
      <p className="max-w-md text-lg text-muted">{t("subtitle")}</p>
    </main>
  );
}
