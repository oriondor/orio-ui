import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock useCookies
const mockCookies: Record<string, string> = {};

vi.mock("@vueuse/integrations/useCookies", () => ({
  useCookies: () => ({
    get: (key: string) => mockCookies[key],
    set: (key: string, value: string) => {
      mockCookies[key] = value;
    },
  }),
}));

import { useTheme } from "../../src/runtime/composables/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    // Clear mock cookies
    Object.keys(mockCookies).forEach((key) => delete mockCookies[key]);
    // Clear DOM attributes
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-mode");
  });

  it("initializes with default theme and mode", () => {
    const { theme, mode } = useTheme();

    expect(theme.value).toBe("navy");
    expect(mode.value).toBe("dark");
  });

  it("reads existing cookie values", () => {
    mockCookies["orio-theme"] = "ocean";
    mockCookies["orio-mode"] = "light";

    const { theme, mode } = useTheme();

    expect(theme.value).toBe("ocean");
    expect(mode.value).toBe("light");
  });

  it("setTheme updates theme and DOM", () => {
    const { theme, setTheme } = useTheme();
    setTheme("ocean");

    expect(theme.value).toBe("ocean");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });

  it("setMode updates mode and DOM", () => {
    const { mode, setMode } = useTheme();
    setMode("light");

    expect(mode.value).toBe("light");
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
  });
});
