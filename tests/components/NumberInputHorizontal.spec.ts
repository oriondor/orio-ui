import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NumberInputHorizontal from "../../src/runtime/components/NumberInput/Horizontal.vue";
import Button from "../../src/runtime/components/Button.vue";

describe("NumberInputHorizontal", () => {
  it("renders with default value", () => {
    const wrapper = mount(NumberInputHorizontal);
    expect(wrapper.find("input").element.value).toBe("0");
  });

  it("renders with custom value", () => {
    const wrapper = mount(NumberInputHorizontal, {
      props: { modelValue: 42 },
    });
    expect(wrapper.find("input").element.value).toBe("42");
  });

  it("has two buttons in the controls", () => {
    const wrapper = mount(NumberInputHorizontal);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons.length).toBe(2);
  });

  it("renders minus button first with correct icon", () => {
    const wrapper = mount(NumberInputHorizontal);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("icon")).toBe("minus");
  });

  it("renders plus button second with correct icon", () => {
    const wrapper = mount(NumberInputHorizontal);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[1].props("icon")).toBe("plus");
  });

  it("disables plus button when at max", () => {
    const wrapper = mount(NumberInputHorizontal, {
      props: { modelValue: 10, max: 10 },
    });

    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[1].props("disabled")).toBe(true);
  });

  it("disables minus button when at min", () => {
    const wrapper = mount(NumberInputHorizontal, {
      props: { modelValue: 0, min: 0 },
    });

    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("disabled")).toBe(true);
  });

  it("applies horizontal class", () => {
    const wrapper = mount(NumberInputHorizontal);
    expect(wrapper.find(".horizontal").exists()).toBe(true);
  });

  it("has controls container with correct positioning", () => {
    const wrapper = mount(NumberInputHorizontal);
    expect(wrapper.find(".controls").exists()).toBe(true);
  });
});
