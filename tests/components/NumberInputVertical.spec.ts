import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NumberInputVertical from "../../src/runtime/components/NumberInput/Vertical.vue";
import Button from "../../src/runtime/components/Button.vue";

describe("NumberInputVertical", () => {
  it("renders with default value", () => {
    const wrapper = mount(NumberInputVertical);
    expect(wrapper.find("input").element.value).toBe("0");
  });

  it("renders with custom value", () => {
    const wrapper = mount(NumberInputVertical, {
      props: { modelValue: 42 },
    });
    expect(wrapper.find("input").element.value).toBe("42");
  });

  it("has two buttons in the controls", () => {
    const wrapper = mount(NumberInputVertical);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons.length).toBe(2);
  });

  it("renders chevron-up button first", () => {
    const wrapper = mount(NumberInputVertical);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("icon")).toBe("chevron-up");
  });

  it("renders chevron-down button second", () => {
    const wrapper = mount(NumberInputVertical);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[1].props("icon")).toBe("chevron-down");
  });

  it("disables increase button when at max", () => {
    const wrapper = mount(NumberInputVertical, {
      props: { modelValue: 10, max: 10 },
    });

    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("disabled")).toBe(true);
  });

  it("disables decrease button when at min", () => {
    const wrapper = mount(NumberInputVertical, {
      props: { modelValue: 0, min: 0 },
    });

    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[1].props("disabled")).toBe(true);
  });

  it("applies vertical class", () => {
    const wrapper = mount(NumberInputVertical);
    expect(wrapper.find(".vertical").exists()).toBe(true);
  });

  it("has controls container", () => {
    const wrapper = mount(NumberInputVertical);
    expect(wrapper.find(".controls").exists()).toBe(true);
  });
});
