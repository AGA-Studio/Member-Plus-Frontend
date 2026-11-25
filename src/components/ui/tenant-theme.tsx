import { buildTenantCss } from "@/lib/tenant-theme";

type TenantThemeProps = {
  color: string | null;
  foreground: string | null;
};

/**
 * Escribe los tokens del negocio acotados a `tenantThemeClassName`, así que el
 * contenedor de la pantalla tiene que llevar esa clase (`tenant-theme`). Nunca
 * se apunta a `:root`: ver el comentario en `@/lib/tenant-theme`.
 */
export function TenantTheme({ color, foreground }: TenantThemeProps) {
  const css = buildTenantCss(color, foreground);
  if (!css) return null;

  return <style>{css}</style>;
}
