import { describe, it, expect, afterEach } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import { nextTick } from "vue";
import SegmentedInput from "../../src/runtime/components/SegmentedInput.vue";

enableAutoUnmount(afterEach);

describe("SegmentedInput", () => {
  it("renders one input per segment", () => {
    const wrapper = mount(SegmentedInput, { props: { segments: 4 } });
    expect(wrapper.findAll("input").length).toBe(4);
  });

  it("splits initial modelValue across segments", () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "123456", segments: 6 },
    });
    const values = wrapper.findAll("input").map((input) => input.element.value);
    expect(values).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("emits update:modelValue when a segment is typed into", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 4 },
    });
    await wrapper.findAll("input")[0].setValue("7");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["7"]);
  });

  it("joins all segment values into the model", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 4 },
    });
    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("1");
    await inputs[1].setValue("2");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["12"]);
  });

  it("resplits segments when modelValue changes externally", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 4 },
    });
    await wrapper.setProps({ modelValue: "9876" });
    const values = wrapper.findAll("input").map((input) => input.element.value);
    expect(values).toEqual(["9", "8", "7", "6"]);
  });

  it("prevents non-digit keys inside a focused segment when type is number", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { type: "number" },
      attachTo: document.body,
    });
    await nextTick();
    const firstInput = wrapper.findAll("input")[0];
    await firstInput.trigger("focus");
    const event = new KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      cancelable: true,
      bubbles: true,
    });
    firstInput.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows numpad digits when type is number", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { type: "number" },
      attachTo: document.body,
    });
    await nextTick();
    const firstInput = wrapper.findAll("input")[0];
    await firstInput.trigger("focus");
    const event = new KeyboardEvent("keydown", {
      key: "5",
      code: "Numpad5",
      cancelable: true,
      bubbles: true,
    });
    firstInput.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("allows modifier shortcuts like paste when focused", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { type: "number" },
      attachTo: document.body,
    });
    await nextTick();
    const firstInput = wrapper.findAll("input")[0];
    await firstInput.trigger("focus");
    const event = new KeyboardEvent("keydown", {
      key: "v",
      code: "KeyV",
      metaKey: true,
      cancelable: true,
      bubbles: true,
    });
    firstInput.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("sets numeric inputmode and one-time-code autocomplete", () => {
    const wrapper = mount(SegmentedInput, { props: { segments: 2 } });
    const inputs = wrapper.findAll("input");
    expect(inputs[0].attributes("inputmode")).toBe("numeric");
    expect(inputs[0].attributes("autocomplete")).toBe("one-time-code");
    expect(inputs[1].attributes("autocomplete")).toBe("off");
  });

  function dispatchPaste(target: Element, text: string) {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => text },
    });
    target.dispatchEvent(event);
    return event;
  }

  it("pastes a full code straight into the model", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 6 },
    });
    const event = dispatchPaste(wrapper.findAll("input")[0].element, "123456");
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123456"]);
    expect(wrapper.emitted("end")).toBeTruthy();
  });

  it("strips non-digit characters from pasted text when type is number", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 6 },
    });
    dispatchPaste(wrapper.findAll("input")[0].element, "123 456");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123456"]);
  });

  it("truncates pasted text to the total capacity", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 4 },
    });
    dispatchPaste(wrapper.findAll("input")[0].element, "123456789");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1234"]);
  });

  it("does not emit end for a partial paste", async () => {
    const wrapper = mount(SegmentedInput, {
      props: { modelValue: "", segments: 6 },
    });
    dispatchPaste(wrapper.findAll("input")[0].element, "123");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123"]);
    expect(wrapper.emitted("end")).toBeFalsy();
  });

  it("does not swallow non-digit keys typed outside the component", () => {
    mount(SegmentedInput, {
      props: { type: "number" },
      attachTo: document.body,
    });
    const outsideInput = document.createElement("input");
    document.body.appendChild(outsideInput);
    outsideInput.focus();
    const event = new KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      cancelable: true,
      bubbles: true,
    });
    outsideInput.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
