import { buildTenantCss } from "@/lib/tenant-theme";

type TenantThemeProps = {
  color: string | null;
  foreground: string | null;
};

export function TenantTheme({ color, foreground }: TenantThemeProps) {
  const css = buildTenantCss(color, foreground);
  if (!css) return null;

  return <style>{css}</style>;
}
