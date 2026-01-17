import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import NumberInput from "../../src/runtime/components/NumberInput.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const ButtonStub = {
  template:
    '<button class="button-stub" :disabled="disabled" @mousedown="$emit(\'mousedown\')" @mouseup="$emit(\'mouseup\')" @mouseleave="$emit(\'mouseleave\')"><slot /></button>',
  props: ["icon", "appearance", "disabled"],
  emits: ["mousedown", "mouseup", "mouseleave"],
};

describe("NumberInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with default value", () => {
    const wrapper = mount(NumberInput, {
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
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
          "orio-button": ButtonStub,
        },
      },
    });

    await wrapper.find("input").setValue(5);

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([5]);
  });

  it("increments value when increase button is clicked", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 1 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");
    await buttons[0].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([1]);
  });

  it("decrements value when decrease button is clicked", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 5, step: 1 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[1].trigger("mousedown");
    await buttons[1].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([4]);
  });

  it("respects step prop", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 5 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");
    await buttons[0].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([5]);
  });

  it("clamps value to max", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 9, max: 10, step: 5 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");
    await buttons[0].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([10]);
  });

  it("clamps value to min", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 1, min: 0, step: 5 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[1].trigger("mousedown");
    await buttons[1].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0]);
  });

  it("disables increase button when at max", () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 10, max: 10 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    expect(buttons[0].attributes("disabled")).toBeDefined();
  });

  it("disables decrease button when at min", () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, min: 0 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    expect(buttons[1].attributes("disabled")).toBeDefined();
  });

  it("respects decimalPlaces prop", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 0.1, decimalPlaces: 2 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");
    await buttons[0].trigger("mouseup");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0.1]);
  });

  it("continuously increments on press and hold", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 1 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");

    // First immediate increment
    expect(wrapper.emitted("update:modelValue")?.length).toBe(1);

    // Wait for hold delay
    vi.advanceTimersByTime(500);

    // Wait for a few intervals
    vi.advanceTimersByTime(150);

    await buttons[0].trigger("mouseup");

    // Should have multiple emissions
    expect(wrapper.emitted("update:modelValue")!.length).toBeGreaterThan(1);
  });

  it("stops incrementing on mouseup", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 1 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");

    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(100);

    const countBeforeStop = wrapper.emitted("update:modelValue")!.length;

    await buttons[0].trigger("mouseup");

    vi.advanceTimersByTime(200);

    // No new emissions after mouseup
    expect(wrapper.emitted("update:modelValue")!.length).toBe(countBeforeStop);
  });

  it("stops incrementing on mouseleave", async () => {
    const wrapper = mount(NumberInput, {
      props: { modelValue: 0, step: 1 },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    const buttons = wrapper.findAll(".button-stub");
    await buttons[0].trigger("mousedown");

    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(100);

    const countBeforeStop = wrapper.emitted("update:modelValue")!.length;

    await buttons[0].trigger("mouseleave");

    vi.advanceTimersByTime(200);

    // No new emissions after mouseleave
    expect(wrapper.emitted("update:modelValue")!.length).toBe(countBeforeStop);
  });

  it("passes attributes to input element", () => {
    const wrapper = mount(NumberInput, {
      attrs: { placeholder: "Enter number" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-button": ButtonStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("placeholder")).toBe(
      "Enter number",
    );
  });
});
