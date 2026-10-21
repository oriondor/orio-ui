import { describe, it, expect } from "vitest";
import { sizeTokens } from "../../src/runtime/composables/useControlSize";

describe("useControlSize sizeTokens", () => {
  it("exposes an xs entry", () => {
    expect(sizeTokens.xs).toBeDefined();
  });

  it("xs keeps font readable (same as sm) but tightens spacing", () => {
    expect(sizeTokens.xs["--control-font-size"]).toBe(
      "var(--orio-control-font-size, var(--font-sm))",
    );
    expect(sizeTokens.xs["--control-py"]).toBe(
      "var(--orio-control-py, 0.125rem)",
    );
    expect(sizeTokens.xs["--control-px"]).toBe(
      "var(--orio-control-px, 0.25rem)",
    );
    expect(sizeTokens.xs["--control-gap"]).toBe(
      "var(--orio-control-gap, 0.125rem)",
    );
    expect(sizeTokens.xs["--control-icon-size"]).toBe(
      "var(--orio-control-icon-size, 0.625rem)",
    );
    expect(sizeTokens.xs["--control-radius"]).toBe(
      "var(--orio-control-radius, var(--border-radius-sm))",
    );
  });

  it("every token in every size reads its --orio-control-* override first", () => {
    Object.values(sizeTokens).forEach((tokens) => {
      Object.entries(tokens).forEach(([name, value]) => {
        const publicName = name.replace("--control-", "--orio-control-");
        expect(value.startsWith(`var(${publicName}, `)).toBe(true);
      });
    });
  });

  it("xs defines the same token keys as sm", () => {
    expect(Object.keys(sizeTokens.xs).sort()).toEqual(
      Object.keys(sizeTokens.sm).sort(),
    );
  });
});
