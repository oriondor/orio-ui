import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Textarea from "../../src/runtime/components/Textarea.vue";

const ControlStub = {
  template:
    '<div class="control-stub"><div class="slot-wrapper"><slot /></div></div>',
};

describe("Textarea", () => {
  it("emits update when value changes", async () => {
    const wrapper = mount(Textarea, {
      props: { modelValue: "" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("textarea").setValue("Notes");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Notes"]);
  });

  it("passes attributes to textarea element", () => {
    const wrapper = mount(Textarea, {
      attrs: { placeholder: "Add notes" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("textarea").attributes("placeholder")).toBe(
      "Add notes",
    );
  });

  it("applies inner class in inner layout", () => {
    const wrapper = mount(Textarea, {
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
    const wrapper = mount(Textarea, {
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
