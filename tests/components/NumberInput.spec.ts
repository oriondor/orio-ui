import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import NumberInput from "../../src/runtime/components/NumberInput/index.vue";

const ControlStub = {
  template:
    '<div class="control-stub"><div class="slot-wrapper"><slot id="test-id" /></div></div>',
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

    expect(wrapper.find("input").element.value).toBe("");
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

  it("applies inner class in inner layout", () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, layout: "inner" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find(".control-stub").classes()).toContain("inner");
  });

  it("does not apply inner class in default layout", () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find(".control-stub").classes()).not.toContain("inner");
  });

  describe("number mode", () => {
    const make = (props: Record<string, unknown> = {}, attrs = {}) => {
      const wrapper = mount(NumberInput, {
        attachTo: document.body,
        attrs,
        props: {
          modelValue: null,
          "onUpdate:modelValue": (value: unknown) =>
            wrapper.setProps({ modelValue: value as number | null }),
          ...props,
        },
        slots: {
          controls: `<template #default="{ increase, decrease }">
            <button class="up" @click="increase" /><button class="down" @click="decrease" />
          </template>`,
        },
        global: { stubs: { "orio-control-element": ControlStub } },
      });
      return wrapper;
    };
    const lastEmit = (wrapper: ReturnType<typeof make>) =>
      wrapper.emitted("update:modelValue")?.at(-1)?.[0];

    it("R1: native number input, no inputmode, type attr cannot override", () => {
      const input = make({}, { type: "text" }).find("input");
      expect(input.attributes("type")).toBe("number");
      expect(input.attributes("inputmode")).toBeUndefined();
    });

    it("R2: empty emits null; -0 emits 0", async () => {
      const wrapper = make({ modelValue: 3 });
      await wrapper.find("input").setValue("");
      expect(lastEmit(wrapper)).toBeNull();
      await wrapper.find("input").setValue("-0");
      expect(Object.is(lastEmit(wrapper), 0)).toBe(true);
    });

    it("R3: 1.005 at 2 places rounds to 1.01 on blur", async () => {
      const wrapper = make({ decimalPlaces: 2 });
      await wrapper.find("input").setValue("1.005");
      await wrapper.find("input").trigger("blur");
      expect(lastEmit(wrapper)).toBe(1.01);
      expect(wrapper.find("input").element.value).toBe("1.01");
    });

    it("R3: tiny values keep exponent-form precision, -0.4 never gives -0", async () => {
      const tiny = make({ decimalPlaces: 8 });
      await tiny.find("input").setValue("0.0000001");
      await tiny.find("input").trigger("blur");
      expect(lastEmit(tiny)).toBe(1e-7);
      const zero = make({ modelValue: -0.4 });
      await zero.find("input").trigger("blur");
      expect(Object.is(lastEmit(zero), 0)).toBe(true);
    });

    it("E1: precision is the max of decimalPlaces and step decimals", async () => {
      const wrapper = make({ modelValue: 0, step: 0.1 });
      for (const _ of [1, 2, 3]) await wrapper.find(".up").trigger("click");
      expect(lastEmit(wrapper)).toBe(0.3);
    });

    it("E2: 1e21 is not rounded or broken, max still clamps", async () => {
      const wrapper = make({ modelValue: 1e21 });
      await wrapper.find("input").trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ max: 100 });
      await wrapper.find("input").trigger("blur");
      expect(lastEmit(wrapper)).toBe(100);
    });

    it("R4: step clamps; from null starts at min ?? 0", async () => {
      const wrapper = make({ modelValue: 9, max: 10, step: 5 });
      await wrapper.find(".up").trigger("click");
      expect(lastEmit(wrapper)).toBe(10);
      const withMin = make({ min: 5 });
      await withMin.find(".up").trigger("click");
      expect(lastEmit(withMin)).toBe(6);
    });

    it("E3: readonly and disabled block steps", async () => {
      const readonly = make({ modelValue: 1 }, { readonly: true });
      await readonly.find(".up").trigger("click");
      expect(readonly.emitted("update:modelValue")).toBeUndefined();
      const disabled = make({ modelValue: 1, disabled: true });
      await disabled.find(".down").trigger("click");
      expect(disabled.emitted("update:modelValue")).toBeUndefined();
    });

    it("R5: bad native input is cleared on blur", async () => {
      const wrapper = make();
      const input = wrapper.find("input");
      Object.defineProperty(input.element, "validity", {
        value: { badInput: true },
      });
      // jsdom sanitises "-" away; emulate the browser keeping it visible.
      Object.defineProperty(input.element, "value", {
        value: "-",
        writable: true,
      });
      await input.trigger("blur");
      expect(input.element.value).toBe("");
    });

    it("does not rewrite typed text that already equals the model", async () => {
      const wrapper = make({ step: 0.01, decimalPlaces: 2 });
      const input = wrapper.find("input");
      input.element.focus();
      await input.setValue("1.0");
      await nextTick();
      expect(input.element.value).toBe("1.0");
      expect(lastEmit(wrapper)).toBe(1);
    });
  });

  it("keeps the value attribute (native step base) while typing", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: null, step: 0.1, decimalPlaces: 2 },
      global: { stubs: { "orio-control-element": ControlStub } },
    });
    const input = wrapper.find("input");
    const initial = input.attributes("value");
    await input.setValue("1.25");
    expect(input.attributes("value")).toBe(initial);
    const element = input.element as HTMLInputElement;
    expect(element.value).toBe("1.25");
    expect(element.validity.stepMismatch).toBe(true);
    element.stepUp();
    expect(element.value).toBe("1.3");
    await wrapper.setProps({ modelValue: 7 });
    expect((input.element as HTMLInputElement).value).toBe("7");
    expect(input.attributes("value")).toBe(initial);
  });

  it("a re-render does not reset typed text to the initial value", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 5 },
      global: { stubs: { "orio-control-element": ControlStub } },
    });
    const input = wrapper.find("input");
    await input.setValue("3");
    await wrapper.setProps({ step: 2 });
    expect((input.element as HTMLInputElement).value).toBe("3");
  });
});
