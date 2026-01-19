import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NumberInput from "../../src/runtime/components/NumberInput/index.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

describe("NumberInput", () => {
  it("renders with default value", () => {
    const wrapper = mount(NumberInput, {
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").element.value).toBe("0");
  });

  it("emits update when input value changes", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").setValue(5);

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([5]);
  });

  it("clamps value to max on blur", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 150, max: 100 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").trigger("blur");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
  });

  it("clamps value to min on blur", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: -10, min: 0 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").trigger("blur");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0]);
  });

  it("respects decimalPlaces prop on blur", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 1.23456, decimalPlaces: 2 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").trigger("blur");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([1.23]);
  });

  it("passes attributes to input element", () => {
    const wrapper = mount(NumberInput, {
      attrs: { placeholder: "Enter number" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("placeholder")).toBe(
      "Enter number",
    );
  });
});
