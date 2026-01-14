import { describe, it, expect, beforeEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useTheme } from "../../src/runtime/composables/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("initializes with default theme and mode", () => {
    let theme: any, mode: any;

    const TestComponent = defineComponent({
      setup() {
        const result = useTheme();
        theme = result.theme;
        mode = result.mode;
        return () => h("div");
      },
    });

    mount(TestComponent);

    expect(theme.value).toBe("navy");
    expect(mode.value).toBe("dark");
  });

  it("setTheme updates theme value", () => {
    let theme: any, setTheme: any;

    const TestComponent = defineComponent({
      setup() {
        const result = useTheme();
        theme = result.theme;
        setTheme = result.setTheme;
        return () => h("div");
      },
    });

    mount(TestComponent);
    setTheme("ocean");

    expect(theme.value).toBe("ocean");
  });

  it("setMode updates mode value", () => {
    let mode: any, setMode: any;

    const TestComponent = defineComponent({
      setup() {
        const result = useTheme();
        mode = result.mode;
        setMode = result.setMode;
        return () => h("div");
      },
    });

    mount(TestComponent);
    setMode("light");

    expect(mode.value).toBe("light");
  });

  it("setTheme sets data-theme attribute", () => {
    let setTheme: any;

    const TestComponent = defineComponent({
      setup() {
        const result = useTheme();
        setTheme = result.setTheme;
        return () => h("div");
      },
    });

    mount(TestComponent);
    setTheme("ocean");

    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });

  it("setMode sets data-mode attribute", () => {
    let setMode: any;

    const TestComponent = defineComponent({
      setup() {
        const result = useTheme();
        setMode = result.setMode;
        return () => h("div");
      },
    });

    mount(TestComponent);
    setMode("light");

    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
  });
});
