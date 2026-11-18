import { describe, expect, it } from "vitest";
import {
  buildTenantCss,
  buildTenantPreviewCss,
  contrastRatio,
  normalizeHexColor,
  pickForeground,
  tenantTextColors,
} from "./tenant-theme";

type Channels = readonly [number, number, number];

const channelValues = [0, 51, 102, 153, 204, 255];

function hexOf(channels: Channels): string {
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function channelsOf(hex: string): Channels {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function everySampledColor(): string[] {
  return channelValues.flatMap((red) =>
    channelValues.flatMap((green) => channelValues.map((blue) => hexOf([red, green, blue]))),
  );
}

const white = hexOf([255, 255, 255]);
const black = hexOf([0, 0, 0]);
const brandBlue = hexOf([0, 98, 242]);
const brandBlueReadable = hexOf([0, 93, 230]);
const crimson = hexOf([185, 28, 28]);
const yellow = hexOf([255, 214, 10]);
const lime = hexOf([163, 230, 53]);
const navy = hexOf([10, 16, 32]);
const lightSurface = channelsOf(white);
const darkSurface = channelsOf(hexOf([17, 26, 46]));

describe("normalizeHexColor", () => {
  it.each([
    [crimson.toUpperCase().replace("#", "#"), crimson],
    [` ${brandBlue} `, brandBlue],
  ])("accepts %j", (raw, expected) => {
    expect(normalizeHexColor(raw)).toBe(expected);
  });

  it.each(["", `#${"f".repeat(3)}`, "red", "#12345g", brandBlue.slice(1), `${brandBlue}ff`, null, undefined])(
    "rejects %j",
    (raw) => {
      expect(normalizeHexColor(raw)).toBeNull();
    },
  );
});

describe("pickForeground", () => {
  it("uses white on dark colors and black on light ones", () => {
    expect(pickForeground(navy)).toBe(white);
    expect(pickForeground(crimson)).toBe(white);
    expect(pickForeground(yellow)).toBe(black);
    expect(pickForeground(lime)).toBe(black);
  });

  it("always reaches 4.5:1 with the chosen color", () => {
    for (const hex of everySampledColor()) {
      const foreground = pickForeground(hex);

      expect(contrastRatio(channelsOf(foreground), channelsOf(hex))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("tenantTextColors", () => {
  it("keeps the text readable in both themes for every sampled color", () => {
    for (const hex of everySampledColor()) {
      const text = tenantTextColors(hex);

      expect(contrastRatio(channelsOf(text.light), lightSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(channelsOf(text.dark), darkSurface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("only darkens a color that is already close to readable", () => {
    expect(tenantTextColors(brandBlue).light).toBe(brandBlueReadable);
    expect(tenantTextColors(yellow).dark).toBe(yellow);
  });
});

describe("buildTenantCss", () => {
  it("returns nothing without a valid color", () => {
    expect(buildTenantCss(null)).toBeNull();
    expect(buildTenantCss("red")).toBeNull();
  });

  it("sets the color, the foreground and the text for both themes", () => {
    const css = buildTenantCss(crimson.toUpperCase().replace("#", "#"), white) ?? "";

    expect(css).toContain(`--tenant-primary:${crimson}`);
    expect(css).toContain(`--primary-foreground:${white}`);
    expect(css).toContain(":root{");
    expect(css).toContain('[data-theme="dark"]{--primary-text:');
  });

  it("ignores a foreground that is not white or black", () => {
    expect(buildTenantCss(yellow, "red")).toContain(`--primary-foreground:${black}`);
  });

  it("only writes what it can validate, so nothing else can be injected", () => {
    const css = buildTenantCss(crimson) ?? "";

    expect(css).toMatch(/^[a-z0-9#:{};\-[\]="]+$/);
    expect(buildTenantCss(`${crimson};}body{display:none`)).toBeNull();
  });
});

describe("buildTenantPreviewCss", () => {
  it("scopes the variables to the preview", () => {
    const css = buildTenantPreviewCss(brandBlue) ?? "";

    expect(css).toContain(`.tenant-preview{--primary:${brandBlue}`);
    expect(css).not.toContain(":root");
  });

  it("returns nothing for an invalid color", () => {
    expect(buildTenantPreviewCss("nope")).toBeNull();
  });
});
