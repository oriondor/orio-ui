import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import ModeSwitcher from "../../src/runtime/components/ModeSwitcher.vue";
import { i18n } from "../../src/runtime/i18n";

const SelectorStub = defineComponent({
  name: "SelectorStub",
  props: {
    modelValue: { type: Object, default: null },
    options: { type: Array, default: () => [] },
    field: { type: String, default: undefined },
    optionName: { type: String, default: undefined },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("button", {
        class: "selector-stub",
        onClick: () =>
          emit(
            "update:modelValue",
            (props.options as { code: string }[]).find(
              (option) => option.code === "light",
            ),
          ),
        "data-options": JSON.stringify(props.options),
        "data-selected": JSON.stringify(props.modelValue),
      });
  },
});

describe("ModeSwitcher", () => {
  it("offers translated light/dark options and applies the picked mode", async () => {
    document.cookie =
      "orio-mode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    const wrapper = mount(ModeSwitcher, {
      global: { plugins: [i18n], stubs: { "orio-selector": SelectorStub } },
    });

    const options = JSON.parse(
      wrapper.find(".selector-stub").attributes("data-options")!,
    );
    expect(options).toEqual([
      { code: "light", label: "Light" },
      { code: "dark", label: "Dark" },
    ]);

    await wrapper.find(".selector-stub").trigger("click");
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
  });

  it("falls back to the default mode when the stored mode is unknown", () => {
    document.cookie = "orio-mode=banana; path=/";
    const wrapper = mount(ModeSwitcher, {
      global: { plugins: [i18n], stubs: { "orio-selector": SelectorStub } },
    });

    const selected = JSON.parse(
      wrapper.find(".selector-stub").attributes("data-selected")!,
    );
    expect(selected).toEqual({ code: "dark", label: "Dark" });

    document.cookie =
      "orio-mode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
});
