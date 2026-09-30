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

/** Parses the `rgb()` / `rgba()` strings that `getComputedStyle` returns. */
export function parseRgba(color: string): RgbaColor | undefined {
  const channels = color.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return undefined;
  const [red, green, blue, alpha = 1] = channels;
  return { red, green, blue, alpha };
}

/** Resolves any CSS colour (tokens, hsl, named) to rgba via the browser. */
export function resolveCssColor(color: string): RgbaColor | undefined {
  if (typeof document === "undefined") return undefined;
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = color;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return parseRgba(resolved);
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
