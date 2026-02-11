import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Input from "../../src/runtime/components/Input.vue";

const ControlStub = {
  template:
    '<div class="control-stub"><div class="slot-wrapper"><slot id="test-id" /></div></div>',
};

describe("Input", () => {
  it("emits update when input value changes", async () => {
    const wrapper = mount(Input, {
      props: { modelValue: "" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").setValue("Hello");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Hello"]);
  });

  it("passes attributes to input element", () => {
    const wrapper = mount(Input, {
      attrs: { placeholder: "Type here" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("placeholder")).toBe("Type here");
  });

  it("applies inner class in inner layout", () => {
    const wrapper = mount(Input, {
      props: { modelValue: "", layout: "inner" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find(".control-stub").classes()).toContain("inner");
  });

  it("does not apply inner class in default layout", () => {
    const wrapper = mount(Input, {
      props: { modelValue: "" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find(".control-stub").classes()).not.toContain("inner");
  });

});
