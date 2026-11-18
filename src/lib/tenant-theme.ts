type Rgb = readonly [number, number, number];

const hexPattern = /^#[0-9a-f]{6}$/;
const minimumTextContrast = 4.5;
const mixSteps = 20;

const lightSurface: Rgb = [255, 255, 255];
const lightBackground: Rgb = [246, 248, 252];
const darkSurface: Rgb = [17, 26, 46];
const darkBackground: Rgb = [10, 16, 32];
const white: Rgb = [255, 255, 255];
const black: Rgb = [0, 0, 0];

export const brandPrimaryHex = toHex([0, 98, 242]);

const lightSoftShare = 0.12;
const darkSoftShare = 0.22;

export function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const lowered = value.trim().toLowerCase();

  return hexPattern.test(lowered) ? lowered : null;
}

function toRgb(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function mix(from: Rgb, to: Rgb, share: number): Rgb {
  return [
    Math.round(from[0] * (1 - share) + to[0] * share),
    Math.round(from[1] * (1 - share) + to[1] * share),
    Math.round(from[2] * (1 - share) + to[2] * share),
  ];
}

function linearChannel(channel: number): number {
  const scaled = channel / 255;

  return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: Rgb): number {
  return 0.2126 * linearChannel(rgb[0]) + 0.7152 * linearChannel(rgb[1]) + 0.0722 * linearChannel(rgb[2]);
}

export function contrastRatio(first: Rgb, second: Rgb): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));

  return (lighter + 0.05) / (darker + 0.05);
}

export function pickForeground(hex: string): string {
  const color = toRgb(hex);

  return toHex(contrastRatio(white, color) >= contrastRatio(black, color) ? white : black);
}

function readableTextOn(primary: Rgb, backgrounds: readonly Rgb[], towards: Rgb): Rgb {
  for (let step = 0; step <= mixSteps; step += 1) {
    const candidate = mix(primary, towards, step / mixSteps);
    if (backgrounds.every((background) => contrastRatio(candidate, background) >= minimumTextContrast)) {
      return candidate;
    }
  }

  return towards;
}

export type TenantTextColors = { light: string; dark: string };

export function tenantTextColors(hex: string): TenantTextColors {
  const primary = toRgb(hex);
  const lightBackgrounds = [mix(lightSurface, primary, lightSoftShare), lightBackground, lightSurface];
  const darkBackgrounds = [mix(darkSurface, primary, darkSoftShare), darkBackground, darkSurface];

  return {
    light: toHex(readableTextOn(primary, lightBackgrounds, black)),
    dark: toHex(readableTextOn(primary, darkBackgrounds, white)),
  };
}

function safeForeground(hex: string, foreground: string | null | undefined): string {
  const normalized = normalizeHexColor(foreground);

  return normalized === toHex(white) || normalized === toHex(black) ? normalized : pickForeground(hex);
}

export function buildTenantCss(color: string | null | undefined, foreground?: string | null): string | null {
  const hex = normalizeHexColor(color);
  if (!hex) return null;

  const text = tenantTextColors(hex);

  return [
    `:root{--tenant-primary:${hex};--primary-foreground:${safeForeground(hex, foreground)};--primary-text:${text.light}}`,
    `[data-theme="dark"]{--primary-text:${text.dark}}`,
  ].join("");
}

export const tenantPreviewClassName = "tenant-preview";

export function buildTenantPreviewCss(color: string | null | undefined): string | null {
  const hex = normalizeHexColor(color);
  if (!hex) return null;

  const text = tenantTextColors(hex);
  const scope = `.${tenantPreviewClassName}`;

  return [
    `${scope}{--primary:${hex};--primary-hover:color-mix(in oklab,${hex} 85%,black);--primary-active:color-mix(in oklab,${hex} 70%,black);--primary-soft:color-mix(in oklab,${hex} 12%,var(--surface));--primary-text:${text.light};--primary-foreground:${pickForeground(hex)};--ring:${hex}}`,
    `[data-theme="dark"] ${scope}{--primary-soft:color-mix(in oklab,${hex} 22%,var(--surface));--primary-text:${text.dark}}`,
  ].join("");
}
