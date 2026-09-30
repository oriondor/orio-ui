export interface RgbaColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export interface TintRule {
  pattern: RegExp;
  weight: number;
}

// Layer ids follow the OpenMapTiles schema used by the OpenFreeMap styles
export const TINT_RULES: TintRule[] = [
  { pattern: /^water/, weight: 0.25 },
  { pattern: /^highway_(major|motorway)_(inner|subtle)$/, weight: 0.15 },
];

export const PAINT_COLOR_PROPERTY: Record<string, "fill-color" | "line-color"> =
  {
    fill: "fill-color",
    line: "line-color",
  };

export function tintWeightFor(layerId: string): number | undefined {
  return TINT_RULES.find((rule) => rule.pattern.test(layerId))?.weight;
}

/**
 * Parses byte-range `rgb()` / `rgba()` strings only. Other serializations
 * (`color(srgb 1 0 0)`, `oklch(…)`) use different channel ranges, so their
 * numbers must never be read as RGB bytes.
 */
export function parseRgba(color: string): RgbaColor | undefined {
  if (!/^rgba?\(/i.test(color.trim())) return undefined;
  const channels = color.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return undefined;
  const [red, green, blue, alpha = 1] = channels;
  return { red, green, blue, alpha };
}

let pixelContext: CanvasRenderingContext2D | null | undefined;

/**
 * Paints the colour into a 1px canvas and reads it back, which yields sRGB
 * bytes for any colour space the browser supports (gamut-clipped).
 */
function rasterizeColor(color: string): RgbaColor | undefined {
  if (pixelContext === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    pixelContext = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!pixelContext) return undefined;
  pixelContext.clearRect(0, 0, 1, 1);
  pixelContext.fillStyle = color;
  pixelContext.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = pixelContext.getImageData(0, 0, 1, 1).data;
  return { red, green, blue, alpha: alpha / 255 };
}

/** Resolves any CSS colour (tokens, hsl, oklch, color-mix…) to sRGB bytes. */
export function resolveCssColor(color: string): RgbaColor | undefined {
  if (typeof document === "undefined") return undefined;
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = color;
  // The style setter drops values the browser cannot parse
  if (!probe.style.color) return undefined;
  document.body.appendChild(probe);
  // Resolves var() and validates; legacy colours already come back as rgb()
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  if (!resolved) return undefined;
  return parseRgba(resolved) ?? rasterizeColor(resolved);
}

export function mixColors(
  base: RgbaColor,
  accent: RgbaColor,
  weight: number,
): string {
  const mixChannel = (from: number, to: number) =>
    Math.round(from + (to - from) * weight);
  const red = mixChannel(base.red, accent.red);
  const green = mixChannel(base.green, accent.green);
  const blue = mixChannel(base.blue, accent.blue);
  return `rgba(${red}, ${green}, ${blue}, ${base.alpha})`;
}
