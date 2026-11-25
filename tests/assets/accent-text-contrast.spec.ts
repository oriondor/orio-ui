import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Resolves the real tokens in colors.css (hex, hsl, color-mix, var) per
// theme x mode, then checks WCAG contrast of --color-accent-text.
function parseBlocks(source: string) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((match) => ({
    selector: match[1].trim(),
    declarations: [...match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
      (declaration) =>
        [
          declaration[1],
          declaration[2]
            .replace(/\s+/g, " ")
            .replace(/\( /g, "(")
            .replace(/ \)/g, ")")
            .trim(),
        ] as const,
    ),
  }));
}
const colorsCss = readFileSync("src/runtime/assets/css/colors.css", "utf8");
const blocks = parseBlocks(colorsCss);
const hoverCss = readFileSync(
  "src/runtime/assets/css/cool-gradient-hover.css",
  "utf8",
);
/** Attribute selectors and :root are class-level (0,1,0) each; :not() adds only its argument. */
const specificity = (selector: string) =>
  [...selector.matchAll(/\[|:root/g)].length;

type Rgb = [number, number, number];

/** Cascade by specificity, then source order; `extra` blocks come last (a consumer stylesheet). */
function resolveTokens(
  theme: string | null,
  mode: string,
  extra: typeof blocks = [],
) {
  const tokens: Record<string, string> = {};
  const ordered = [...blocks, ...extra]
    .map((block, order) => ({ block, order }))
    .sort(
      (a, b) =>
        specificity(a.block.selector) - specificity(b.block.selector) ||
        a.order - b.order,
    );
  ordered.forEach(({ block }) => {
    const attrs = [...block.selector.matchAll(/\[data-(\w+)="(\w+)"\]/g)];
    const unthemedOnly = block.selector.includes(":not([data-theme])");
    const matches =
      (!unthemedOnly || theme === null) &&
      attrs.every(
        ([, name, value]) => (name === "mode" ? mode : theme) === value,
      );
    if (matches)
      block.declarations.forEach(([name, value]) => (tokens[name] = value));
  });
  return tokens;
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const chroma = (saturation / 100) * (1 - Math.abs((2 * lightness) / 100 - 1));
  const component = (shift: number) => {
    const position = (hue / 30 + shift) % 12;
    const channel =
      lightness / 100 -
      (chroma / 2) * Math.max(-1, Math.min(position - 3, 9 - position, 1));
    return channel * 255;
  };
  return [component(0), component(8), component(4)];
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  [...text].forEach((character) => {
    if (character === "(") depth++;
    if (character === ")") depth--;
    if (character === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += character;
  });
  parts.push(current.trim());
  return parts;
}

function parseColor(value: string, tokens: Record<string, string>): Rgb {
  const text = value.trim();
  const variable = text.match(/^var\((--[\w-]+)(?:,([\s\S]*))?\)$/);
  if (variable) return parseColor(tokens[variable[1]] ?? variable[2], tokens);
  if (text === "white") return [255, 255, 255];
  if (text === "black") return [0, 0, 0];
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits =
      hex[1].length === 3
        ? [...hex[1]].map((digit) => digit + digit)
        : hex[1].match(/../g)!;
    return digits.map((pair) => parseInt(pair, 16)) as Rgb;
  }
  const hsl = text.match(
    /^hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%\s*\)$/,
  );
  if (hsl) return hslToRgb(+hsl[1], +hsl[2], +hsl[3]);
  const mix = text.match(/^color-mix\(in srgb,(.*)\)$/s);
  if (mix) {
    const [first, second] = splitTopLevel(mix[1]).map((part) => {
      const percent = part.match(/\s([\d.]+)%$/);
      return {
        color: parseColor(
          percent ? part.slice(0, percent.index) : part,
          tokens,
        ),
        percent: percent ? +percent[1] : null,
      };
    });
    const firstShare = first.percent ?? 100 - (second.percent ?? 50);
    const share = firstShare / 100;
    return first.color.map(
      (channel, index) => channel * share + second.color[index] * (1 - share),
    ) as Rgb;
  }
  throw new Error(`Unsupported color: ${text}`);
}

function luminance(rgb: Rgb) {
  const [red, green, blue] = rgb.map((channel) => {
    const unit = Math.round(channel) / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: Rgb, second: Rgb) {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
}

const themes = [
  null,
  "normal",
  "inverse",
  "navy",
  "teal",
  "forest",
  "wine",
  "royal",
  "violet",
];

describe("accent color contrast", () => {
  themes.forEach((theme) =>
    ["light", "dark"].forEach((mode) =>
      it(`${theme ?? "default"} ${mode} >= 4.5 on bg and surface`, () => {
        const tokens = resolveTokens(theme, mode);
        const text = parseColor("var(--color-accent-text)", tokens);
        ["--color-bg", "--color-surface"].forEach((surface) => {
          const ratio = contrast(text, parseColor(`var(${surface})`, tokens));
          if (process.env.SHOW_RATIOS)
            console.log(theme ?? "default", mode, surface, ratio.toFixed(2));
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
      }),
    ),
  );

  themes.forEach((theme) =>
    ["light", "dark"].forEach((mode) =>
      it(`${theme ?? "default"} ${mode} --color-accent-ink >= 4.5 on accent`, () => {
        const tokens = resolveTokens(theme, mode);
        const ink = parseColor("var(--color-accent-ink)", tokens);
        const ratio = contrast(ink, parseColor("var(--color-accent)", tokens));
        if (process.env.SHOW_RATIOS)
          console.log(theme ?? "default", mode, "ink/accent", ratio.toFixed(2));
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
    ),
  );

  themes.forEach((theme) =>
    ["light", "dark"].forEach((mode) =>
      it(`${theme ?? "default"} ${mode} primary Button ink >= 4.5 across the hover gradient`, () => {
        const tokens = resolveTokens(theme, mode);
        // Stops and mix base come from cool-gradient-hover.css; Button primary sets --gh-color.
        parseBlocks(hoverCss)
          .filter(
            (block) =>
              block.selector === ".gradient-hover" ||
              (block.selector.includes('[data-mode="dark"]') &&
                mode === "dark"),
          )
          .forEach((block) =>
            block.declarations.forEach(([name, value]) => {
              tokens[name] = value;
            }),
          );
        tokens["--gh-color"] = "var(--color-accent)";
        const gradient = hoverCss.match(/linear-gradient\(([\s\S]*?)\);/)![1];
        const stops = splitTopLevel(gradient)
          .slice(1)
          .map((stop) =>
            stop
              .replace(/\s+/g, " ")
              .replace(/\( /g, "(")
              .replace(/\s+\d+%$/, "")
              // percent tokens: var(--name, fallback) -> theme value or fallback
              .replace(
                /var\((--[\w-]+),\s*(\d+%)\)/g,
                (_, name, fallback) => tokens[name] ?? fallback,
              ),
          );
        expect(stops.length).toBe(3);
        const ink = parseColor("var(--color-accent-ink)", tokens);
        stops.forEach((stop) => {
          const ratio = contrast(ink, parseColor(stop, tokens));
          if (process.env.SHOW_RATIOS)
            console.log(theme ?? "default", mode, "hover", ratio.toFixed(2));
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
      }),
    ),
  );

  ["light", "dark"].forEach((mode) =>
    it(`consumer :root theme keeps its ink and accent-text in ${mode}`, () => {
      const consumer = parseBlocks(`
        [data-theme="coral"] { --color-accent: #ff7849; --color-accent-ink: #0e1116; }
        :root[data-theme="coral"][data-mode="dark"] { --color-accent-text: #ff7849; }
      `);
      const tokens = resolveTokens("coral", mode, consumer);
      expect(tokens["--color-accent-ink"]).toBe("#0e1116");
      if (mode === "dark")
        expect(tokens["--color-accent-text"]).toBe("#ff7849");
    }),
  );

  it("derives from --color-accent for a consumer theme setting only the accent", () => {
    const tokens = resolveTokens("custom", "light");
    tokens["--color-accent"] = "#ff0000";
    const derived = parseColor("var(--color-accent-text)", tokens);
    expect(derived[0]).toBeGreaterThan(derived[1]);
  });
});
