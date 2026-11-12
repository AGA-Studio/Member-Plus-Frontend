import { useTranslations } from "next-intl";

export default function BusinessDetailPage() {
  const t = useTranslations("businessDetail");

  return (
    <main className="mx-auto flex max-w-page flex-col gap-4 px-4 py-8">
      <h1 className="text-title">{t("title")}</h1>
      <p className="text-base text-muted">{t("usage")}</p>
      <div className="flex gap-3">
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{t("suspend")}</button>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{t("delete")}</button>
      </div>
    </main>
  );
}
