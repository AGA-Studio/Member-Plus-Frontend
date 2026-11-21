import { getTranslations } from "next-intl/server";
import { LogoDialog } from "./logo-dialog";

type LogoSectionProps = {
  businessName: string;
  initials: string;
  logoUrl: string | null;
};

/**
 * Acceso al logo del negocio desde Configuración. En móvil la barra lateral no
 * se muestra, así que este es el único camino ahí. Va fuera del formulario de
 * Configuración porque `LogoDialog` trae su propio `<form>` y no se pueden anidar.
 */
export async function LogoSection({ businessName, initials, logoUrl }: LogoSectionProps) {
  const t = await getTranslations("business.logo");

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-subheading text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted">{t("description")}</p>
      </div>
      <div className="flex sm:w-80">
        <LogoDialog businessName={businessName} initials={initials} logoUrl={logoUrl} />
      </div>
    </section>
  );
}
