import { describe, it, expect, vi, afterEach } from "vitest";
import {
  mixColors,
  parseRgba,
  resolveCssColor,
} from "../../src/runtime/utils/map-tint";

describe("parseRgba", () => {
  it("parses rgb() and rgba() byte strings", () => {
    expect(parseRgba("rgb(125, 76, 240)")).toEqual({
      red: 125,
      green: 76,
      blue: 240,
      alpha: 1,
    });
    expect(parseRgba("rgba(0, 0, 0, 0.5)")?.alpha).toBe(0.5);
  });

  it("rejects non-rgb serializations instead of reading their numbers", () => {
    expect(parseRgba("color(srgb 1 0 0)")).toBeUndefined();
    expect(parseRgba("oklch(0.63 0.26 29)")).toBeUndefined();
    expect(parseRgba("lab(50 40 30)")).toBeUndefined();
  });
});

describe("resolveCssColor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Browsers keep color(), oklch(), lab() and color-mix() results in their own
  // space in computed styles; jsdom does not, so the browser output is stubbed
  it("normalizes a color(srgb …) computed value to sRGB bytes via canvas", () => {
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
      (element as HTMLElement).style.color === "var(--color-accent)"
        ? ({ color: "color(srgb 1 0 0)" } as CSSStyleDeclaration)
        : realGetComputedStyle(element),
    );
    const fillStyles: string[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      set fillStyle(value: string) {
        fillStyles.push(value);
      },
      getImageData: () => ({ data: new Uint8ClampedArray([255, 0, 0, 255]) }),
    } as unknown as CanvasRenderingContext2D);

    expect(resolveCssColor("var(--color-accent)")).toEqual({
      red: 255,
      green: 0,
      blue: 0,
      alpha: 1,
    });
    expect(fillStyles).toEqual(["color(srgb 1 0 0)"]);
  });

  it("returns undefined for colours the browser cannot parse", () => {
    expect(resolveCssColor("not-a-colour")).toBeUndefined();
  });
});

describe("mixColors", () => {
  it("mixes toward the accent by weight and keeps the base alpha", () => {
    expect(
      mixColors(
        { red: 100, green: 100, blue: 100, alpha: 0.5 },
        { red: 255, green: 0, blue: 0, alpha: 1 },
        0.25,
      ),
    ).toBe("rgba(139, 75, 75, 0.5)");
  });
});
