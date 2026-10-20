import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Slider from "../../src/runtime/components/Slider.vue";
import ControlElement from "../../src/runtime/components/ControlElement.vue";
import Form from "../../src/runtime/components/Form.vue";
import { defineComponent, reactive } from "vue";

function mountSlider(props: Record<string, unknown> = {}) {
  return mount(Slider, {
    props,
    global: { components: { "orio-control-element": ControlElement } },
  });
}

// v-bind(percent) in <style> is a no-op in Vue's cjs build, so read the
// computed straight off the instance instead of the DOM.
function fill(wrapper: { vm: unknown }) {
  return (wrapper.vm as { percent: string }).percent;
}

describe("Slider", () => {
  it("renders a native range input with min/max/step", () => {
    const input = mountSlider({ min: 10, max: 50, step: 5 }).find("input");

    expect(input.attributes("type")).toBe("range");
    expect(input.attributes("min")).toBe("10");
    expect(input.attributes("max")).toBe("50");
    expect(input.attributes("step")).toBe("5");
  });

  it("emits update:modelValue as a number on input", async () => {
    const wrapper = mountSlider({ modelValue: 0 });

    await wrapper.find("input").setValue("42");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([42]);
  });

  it("clamps to min and max", async () => {
    const wrapper = mountSlider({ modelValue: 150, min: 0, max: 100 });
    expect(fill(wrapper)).toBe("100%");

    await wrapper.setProps({ modelValue: -20 });
    expect(fill(wrapper)).toBe("0%");
  });

  it("snaps to step", async () => {
    const wrapper = mountSlider({ modelValue: 0, min: 0, max: 10, step: 3 });

    await wrapper.find("input").setValue("7");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([6]);
  });

  it("keeps fractional steps free of float noise", async () => {
    const wrapper = mountSlider({ modelValue: 0, min: 0, max: 1, step: 0.1 });

    // 0.3 / 0.1 * 0.1 is 0.30000000000000004 without rounding to step decimals.
    await wrapper.find("input").setValue("0.3");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([0.3]);
  });

  it("keeps the decimal precision of min", async () => {
    const wrapper = mountSlider({
      modelValue: 0.5,
      min: 0.5,
      max: 10,
      step: 1,
    });

    await wrapper.find("input").setValue("1.5");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([1.5]);
  });

  it.each([0, -2, Number.NaN, Infinity])(
    "falls back to step 1 when step is %s",
    async (step) => {
      const wrapper = mountSlider({ modelValue: 0, min: 0, max: 10, step });
      const input = wrapper.find("input");

      expect(input.attributes("step")).toBe("1");

      await input.setValue("4");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([4]);
    },
  );

  it("computes fill percent from value within the range", () => {
    expect(fill(mountSlider({ modelValue: 30, min: 20, max: 60 }))).toBe("25%");
  });

  it("disables the input via the control bag", () => {
    const input = mountSlider({ disabled: true }).find("input");

    expect(input.attributes("disabled")).toBeDefined();
  });

  it("links the label to the input", () => {
    const wrapper = mountSlider({ label: "Area" });

    expect(wrapper.find("label").attributes("for")).toBe(
      wrapper.find("input").attributes("id"),
    );
  });

  it("auto-binds by name inside orio-form", async () => {
    const data = reactive({ area: 40 });
    const wrapper = mount(
      defineComponent({
        components: { OrioForm: Form, OrioSlider: Slider },
        setup: () => ({ data }),
        template:
          '<orio-form v-model="data"><orio-slider name="area" /></orio-form>',
      }),
      { global: { components: { "orio-control-element": ControlElement } } },
    );

    expect(fill(wrapper.findComponent(Slider))).toBe("40%");

    await wrapper.find("input").setValue("60");
    expect(data.area).toBe(60);
  });
});
