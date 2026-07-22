import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import ThemeSwitcher from "../../src/runtime/components/ThemeSwitcher.vue";
import { i18n } from "../../src/runtime/i18n";

const SelectorStub = defineComponent({
  name: "SelectorStub",
  props: {
    modelValue: { type: String, default: null },
    options: { type: Array, default: () => [] },
    field: { type: String, default: undefined },
    optionName: { type: String, default: undefined },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("button", {
        class: "selector-stub",
        onClick: () => emit("update:modelValue", "wine"),
        "data-options": JSON.stringify(props.options),
      });
  },
});

describe("ThemeSwitcher", () => {
  it("offers the built-in themes and applies the picked one", async () => {
    document.cookie =
      "orio-theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    const wrapper = mount(ThemeSwitcher, {
      global: { plugins: [i18n], stubs: { "orio-selector": SelectorStub } },
    });

    const options = JSON.parse(
      wrapper.find(".selector-stub").attributes("data-options")!,
    );
    expect(options).toEqual(["navy", "teal", "forest", "wine", "royal"]);

    await wrapper.find(".selector-stub").trigger("click");
    expect(document.documentElement.getAttribute("data-theme")).toBe("wine");
  });
});
