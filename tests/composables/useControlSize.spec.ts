import { describe, it, expect } from "vitest";
import { sizeTokens } from "../../src/runtime/composables/useControlSize";

describe("useControlSize sizeTokens", () => {
  it("exposes an xs entry", () => {
    expect(sizeTokens.xs).toBeDefined();
  });

  it("xs keeps font readable (same as sm) but tightens spacing", () => {
    expect(sizeTokens.xs["--control-font-size"]).toBe("var(--font-sm)");
    expect(sizeTokens.xs["--control-py"]).toBe("0.125rem");
    expect(sizeTokens.xs["--control-px"]).toBe("0.25rem");
    expect(sizeTokens.xs["--control-gap"]).toBe("0.125rem");
    expect(sizeTokens.xs["--control-icon-size"]).toBe("0.625rem");
    expect(sizeTokens.xs["--control-radius"]).toBe("var(--border-radius-sm)");
  });

  it("xs defines the same token keys as sm", () => {
    expect(Object.keys(sizeTokens.xs).sort()).toEqual(
      Object.keys(sizeTokens.sm).sort(),
    );
  });
});
