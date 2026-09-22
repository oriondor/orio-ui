import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SwitchButton from "../../src/runtime/components/SwitchButton.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

describe("SwitchButton", () => {
  it("toggles modelValue on click", async () => {
    const wrapper = mount(SwitchButton, {
      props: { modelValue: false },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("toggles modelValue on Enter and Space", async () => {
    const wrapper = mount(SwitchButton, {
      props: { modelValue: false },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("button").trigger("keydown.enter");
    await wrapper.find("button").trigger("keydown.space");

    const emissions = wrapper.emitted("update:modelValue") || [];
    expect(emissions[0]).toEqual([true]);
    expect(emissions[1]).toEqual([false]);
  });

  it("exposes the toggle state as aria-pressed", async () => {
    const wrapper = mount(SwitchButton, {
      props: { modelValue: false },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("button").attributes("aria-pressed")).toBe("false");

    await wrapper.setProps({ modelValue: true });

    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });

  it("lets the caller override aria-pressed", () => {
    const wrapper = mount(SwitchButton, {
      props: { modelValue: false },
      attrs: { "aria-pressed": "mixed" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("button").attributes("aria-pressed")).toBe("mixed");
  });

  it("does not toggle when disabled", async () => {
    const wrapper = mount(SwitchButton, {
      props: { modelValue: false, disabled: true },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
