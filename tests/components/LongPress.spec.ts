import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import LongPress from "../../src/runtime/components/LongPress.vue";

function pointer(type: string) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  Object.defineProperty(event, "isPrimary", { value: true });
  return event;
}

// Mouse/touch clicks carry detail >= 1; keyboard activation has detail 0.
function pointerClick(element: Element) {
  element.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
  );
}

describe("LongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("renders the default slot inside the wrapper", async () => {
    const wrapper = mount(LongPress, {
      slots: { default: "<span class='child'>Hold me</span>" },
    });

    expect(wrapper.classes()).toContain("long-press");
    expect(wrapper.find(".child").text()).toBe("Hold me");
  });

  it("exposes scale and delay as CSS custom properties", async () => {
    const wrapper = mount(LongPress, { props: { scale: 0.9, delay: 800 } });
    const style = (wrapper.element as HTMLElement).style;

    expect(style.getPropertyValue("--long-press-scale")).toBe("0.9");
    expect(style.getPropertyValue("--long-press-duration")).toBe("800ms");
  });

  it("toggles the pressing class while held", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    await nextTick();

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain("pressing");

    wrapper.element.dispatchEvent(pointer("pointerup"));
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain("pressing");
  });

  it("keeps the holding class from press until release, across the trigger", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    await nextTick();

    expect(wrapper.classes()).not.toContain("holding");

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(500);
    await nextTick();
    expect(wrapper.classes()).toContain("holding");
    expect(wrapper.classes()).not.toContain("pressing");

    wrapper.element.dispatchEvent(pointer("pointerup"));
    await nextTick();
    expect(wrapper.classes()).not.toContain("holding");
  });

  it("adds the disabled class", async () => {
    const wrapper = mount(LongPress, { props: { disabled: true } });

    expect(wrapper.classes()).toContain("disabled");
  });

  it("emits pressStart and trigger with the event and source", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    await nextTick();
    const down = pointer("pointerdown");

    wrapper.element.dispatchEvent(down);
    vi.advanceTimersByTime(500);

    expect(wrapper.emitted("pressStart")).toEqual([[down]]);
    expect(wrapper.emitted("trigger")).toEqual([[down, "hold"]]);
  });

  it("emits pressCancel on early release", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    await nextTick();

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(200);
    wrapper.element.dispatchEvent(pointer("pointerup"));

    expect(wrapper.emitted("pressCancel")).toHaveLength(1);
    expect(wrapper.emitted("trigger")).toBeUndefined();
  });

  it("applies a changed delay on the next press", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    await nextTick();

    await wrapper.setProps({ delay: 1000 });
    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(999);
    expect(wrapper.emitted("trigger")).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(wrapper.emitted("trigger")).toHaveLength(1);
  });

  it("does not activate the wrapped button after a trigger", async () => {
    const childClick = vi.fn();
    const wrapper = mount(LongPress, {
      attachTo: document.body,
      slots: { default: () => h("button", { onClick: childClick }, "child") },
    });
    await nextTick();

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(500);
    pointerClick(wrapper.find("button").element);

    expect(childClick).not.toHaveBeenCalled();
  });

  it("passes a normal click through to the wrapped button", async () => {
    const childClick = vi.fn();
    const wrapper = mount(LongPress, {
      attachTo: document.body,
      slots: { default: () => h("button", { onClick: childClick }, "child") },
    });
    await nextTick();

    pointerClick(wrapper.find("button").element);

    expect(childClick).toHaveBeenCalledTimes(1);
  });
});
