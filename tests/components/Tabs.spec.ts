import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import Tabs from "../../src/runtime/components/Tabs.vue";

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ["name"],
};

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

const mounted: { unmount(): void }[] = [];
afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = "";
});

function make(
  props: Record<string, unknown> = {},
  attrs: Record<string, unknown> = {},
  slots = {},
) {
  // Mirrors v-model: the parent writes emitted values back.
  const wrapper = mount(Tabs as never, {
    props: {
      options,
      modelValue: "a",
      "onUpdate:modelValue": (value: unknown) =>
        wrapper.setProps({ modelValue: value } as never),
      ...props,
    },
    attrs,
    slots,
    attachTo: document.body,
    global: { stubs: { "orio-icon": IconStub } },
  });
  mounted.push(wrapper);
  return wrapper;
}

const buttons = (wrapper: ReturnType<typeof make>) => wrapper.findAll("button");
const lastEmit = (wrapper: ReturnType<typeof make>) =>
  wrapper.emitted("update:modelValue");

describe("Tabs", () => {
  it("tablist role: tab roles and aria-selected", () => {
    const wrapper = make();
    expect(wrapper.attributes("role")).toBe("tablist");
    const tabs = buttons(wrapper);
    expect(tabs.every((tab) => tab.attributes("role") === "tab")).toBe(true);
    expect(tabs.map((tab) => tab.attributes("aria-selected"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    expect(tabs[0].attributes("type")).toBe("button");
    expect(tabs[0].attributes("aria-checked")).toBeUndefined();
  });

  it("radiogroup role: radio roles, aria-checked, no ids or aria-controls", () => {
    const wrapper = make({ role: "radiogroup", idPrefix: "x" });
    expect(wrapper.attributes("role")).toBe("radiogroup");
    const first = buttons(wrapper)[0];
    expect(first.attributes("role")).toBe("radio");
    expect(first.attributes("aria-checked")).toBe("true");
    expect(first.attributes("aria-selected")).toBeUndefined();
    expect(first.attributes("aria-controls")).toBeUndefined();
    expect(first.attributes("id")).toBeUndefined();
  });

  it("role and variant are independent and role does not leak as attr", () => {
    const wrapper = make({ role: "radiogroup", variant: "segmented" });
    expect(wrapper.classes()).toContain("segmented");
    expect(wrapper.attributes("role")).toBe("radiogroup");
  });

  it("label becomes aria-label; aria-labelledby passes through", () => {
    const wrapper = make({ label: "Period" }, { "aria-labelledby": "lbl" });
    expect(wrapper.attributes("aria-label")).toBe("Period");
    expect(wrapper.attributes("aria-labelledby")).toBe("lbl");
  });

  it("idPrefix wires ids and aria-controls", () => {
    const wrapper = make({ idPrefix: "p" });
    const first = buttons(wrapper)[0];
    expect(first.attributes("id")).toBe("p-tab-a");
    expect(first.attributes("aria-controls")).toBe("p-panel-a");
  });

  it("click selects and emits once; clicking selected does not emit", async () => {
    const wrapper = make();
    await buttons(wrapper)[1].trigger("click");
    expect(lastEmit(wrapper)).toEqual([["b"]]);
    await buttons(wrapper)[1].trigger("click");
    expect(lastEmit(wrapper)).toEqual([["b"]]);
  });

  it("roving tabindex: only selected is tabbable", () => {
    const wrapper = make({ modelValue: "b" });
    expect(buttons(wrapper).map((tab) => tab.attributes("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
  });

  it("no selection: first enabled is the tab stop, no auto-emit (E2)", () => {
    const wrapper = make({
      modelValue: "zzz",
      options: [{ ...options[0], disabled: true }, options[1], options[2]],
    });
    expect(buttons(wrapper).map((tab) => tab.attributes("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
    expect(
      buttons(wrapper).some(
        (tab) => tab.attributes("aria-selected") === "true",
      ),
    ).toBe(false);
    expect(lastEmit(wrapper)).toBeUndefined();
  });

  it("ArrowRight/ArrowLeft move selection + focus and wrap", async () => {
    const wrapper = make({ modelValue: "c" });
    await buttons(wrapper)[2].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toEqual([["a"]]);
    expect(document.activeElement).toBe(buttons(wrapper)[0].element);
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowLeft" });
    expect(lastEmit(wrapper)?.[1]).toEqual(["c"]);
  });

  it("arrows skip disabled options", async () => {
    const wrapper = make({
      options: [options[0], { ...options[1], disabled: true }, options[2]],
    });
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toEqual([["c"]]);
  });

  it("Home/End go to first/last enabled", async () => {
    const wrapper = make({
      modelValue: "b",
      options: [
        { ...options[0], disabled: true },
        options[1],
        { ...options[2], disabled: true },
        { value: "d", label: "D" },
      ],
    });
    await buttons(wrapper)[1].trigger("keydown", { key: "End" });
    expect(lastEmit(wrapper)).toEqual([["d"]]);
    await buttons(wrapper)[3].trigger("keydown", { key: "Home" });
    expect(lastEmit(wrapper)?.[1]).toEqual(["b"]);
  });

  it("RTL flips arrows (E11)", async () => {
    const holder = document.createElement("div");
    holder.setAttribute("dir", "rtl");
    document.body.append(holder);
    const wrapper = mount(Tabs as never, {
      props: { options, modelValue: "a" },
      attachTo: holder,
      global: { stubs: { "orio-icon": IconStub } },
    });
    mounted.push(wrapper);
    await buttons(wrapper as never)[0].trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")).toEqual([["b"]]);
  });

  it("disabled option is not selectable by click, keeps focusability semantics", async () => {
    const wrapper = make({
      options: [options[0], { ...options[1], disabled: true }, options[2]],
    });
    const disabledTab = buttons(wrapper)[1];
    expect(disabledTab.attributes("aria-disabled")).toBe("true");
    await disabledTab.trigger("click");
    expect(lastEmit(wrapper)).toBeUndefined();
  });

  it("whole disabled: native disabled, no tab stop, nothing selectable", async () => {
    const wrapper = make({ disabled: true });
    expect(wrapper.attributes("aria-disabled")).toBe("true");
    buttons(wrapper).forEach((tab) => {
      expect(tab.attributes("disabled")).toBeDefined();
      expect(tab.attributes("tabindex")).toBe("-1");
    });
    // test-utils skips trigger() on natively disabled buttons, so dispatch for real.
    buttons(wrapper)[1].element.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    buttons(wrapper)[0].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    wrapper.element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await wrapper.vm.$nextTick();
    expect(lastEmit(wrapper)).toBeUndefined();
  });

  it("all options disabled: no tab stop, keys no-op (E3)", async () => {
    const wrapper = make({
      modelValue: undefined,
      options: options.map((option) => ({ ...option, disabled: true })),
    });
    expect(
      buttons(wrapper).every((tab) => tab.attributes("tabindex") === "-1"),
    ).toBe(true);
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toBeUndefined();
  });

  it("selected option that became disabled stays selected and tab stop (E4)", () => {
    const wrapper = make({
      options: [{ ...options[0], disabled: true }, options[1], options[2]],
    });
    expect(buttons(wrapper)[0].attributes("aria-selected")).toBe("true");
    expect(buttons(wrapper)[0].attributes("tabindex")).toBe("0");
  });

  it("arrows step from a selected-but-disabled item to its neighbour (E4)", async () => {
    const wrapper = make({
      modelValue: "b",
      options: [options[0], { ...options[1], disabled: true }, options[2]],
    });
    buttons(wrapper)[1].element.focus();
    await buttons(wrapper)[1].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toEqual([["c"]]);
    await buttons(wrapper)[2].trigger("keydown", { key: "ArrowLeft" });
    expect(lastEmit(wrapper)?.[1]).toEqual(["a"]);
  });

  it("arrow from a disabled item steps backward to the neighbour", async () => {
    const wrapper = make({
      modelValue: "b",
      options: [options[0], { ...options[1], disabled: true }, options[2]],
    });
    await buttons(wrapper)[1].trigger("keydown", { key: "ArrowLeft" });
    expect(lastEmit(wrapper)).toEqual([["a"]]);
  });

  it("ignores buttons inside the option slot", async () => {
    const wrapper = make(
      {},
      {},
      {
        option: `<template #option="{ option }"><span>{{ option.label }}</span><button type="button" class="inner">x</button></template>`,
      },
    );
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toEqual([["b"]]);
    expect(document.activeElement).toBe(
      wrapper.findAll(":scope > button")[1].element,
    );
  });

  it("duplicate values render every item (E6)", () => {
    const wrapper = make({
      modelValue: "a",
      options: [options[0], { value: "a", label: "Again" }, options[1]],
    });
    expect(buttons(wrapper)).toHaveLength(3);
    expect(buttons(wrapper)[0].attributes("aria-selected")).toBe("true");
    expect(buttons(wrapper)[1].attributes("aria-selected")).toBe("false");
  });

  it("size prop sets control tokens on the root", () => {
    const small = make({ size: "xs" }).attributes("style");
    const large = make({ size: "lg" }).attributes("style");
    expect(small).toContain("--control-");
    expect(small).not.toBe(large);
  });

  it("single option: arrows do not emit (E5)", async () => {
    const wrapper = make({ options: [options[0]] });
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
    expect(lastEmit(wrapper)).toBeUndefined();
  });

  it("empty options render empty container (E1)", () => {
    const wrapper = make({ options: [], modelValue: undefined });
    expect(wrapper.attributes("role")).toBe("tablist");
    expect(buttons(wrapper)).toHaveLength(0);
  });

  it("value 0 is a valid selection (E7)", async () => {
    const wrapper = make({
      options: [
        { value: 0, label: "Zero" },
        { value: 1, label: "One" },
      ],
      modelValue: 0,
    });
    expect(buttons(wrapper)[0].attributes("aria-selected")).toBe("true");
    expect(buttons(wrapper)[0].attributes("tabindex")).toBe("0");
    await buttons(wrapper)[1].trigger("click");
    await buttons(wrapper)[0].trigger("click");
    expect(lastEmit(wrapper)).toEqual([[1], [0]]);
  });

  it("options replaced: tab stop recomputed (E8)", async () => {
    const wrapper = make({ modelValue: "zzz" });
    expect(buttons(wrapper)[0].attributes("tabindex")).toBe("0");
    await wrapper.setProps({
      options: [
        { value: "n", label: "N", disabled: true },
        { value: "m", label: "M" },
      ],
    });
    expect(buttons(wrapper).map((tab) => tab.attributes("tabindex"))).toEqual([
      "-1",
      "0",
    ]);
  });

  it("option slot receives option and selected", () => {
    const wrapper = make(
      {},
      {},
      {
        option: `<template #option="{ option, selected }"><b class="custom">{{ option.label }}-{{ selected }}</b></template>`,
      },
    );
    expect(wrapper.findAll(".custom").map((node) => node.text())).toEqual([
      "Alpha-true",
      "Beta-false",
      "Gamma-false",
    ]);
  });

  it("default content renders icon and full label (E9)", () => {
    const wrapper = make({
      options: [{ value: "a", label: "A very long label", icon: "home" }],
    });
    expect(wrapper.find(".icon-stub").attributes("data-name")).toBe("home");
    expect(buttons(wrapper)[0].text()).toBe("A very long label");
  });

  it("block class", () => {
    expect(make({ block: true }).classes()).toContain("block");
    expect(make().classes()).not.toContain("block");
  });

  it("sizes via the stylesheet grid, not per-count inline style", () => {
    // jsdom cannot lay out; real containment is covered by the browser probe. This blocks the old --tabs-count min-width formula coming back.
    const style =
      make({ options: [...options, ...options] }).attributes("style") ?? "";
    expect(style).not.toContain("--tabs-count");
    expect(style).not.toMatch(/width/);
  });
});

describe("Tabs sliding indicator", () => {
  // Watchers await a tick, then the re-render needs another.
  const settle = async () => {
    await nextTick();
    await nextTick();
  };
  // jsdom has no layout: every button is 100x30 at index * 100.
  const indexOf = (element: HTMLElement) =>
    Array.from(element.parentElement!.children).indexOf(element);
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const fake: Record<string, (element: HTMLElement) => number> = {
    offsetLeft: (element) => indexOf(element) * 100,
    offsetTop: () => 0,
    offsetWidth: () => 100,
    offsetHeight: () => 30,
  };
  beforeEach(() => {
    Object.keys(fake).forEach((key) => {
      originals.set(
        key,
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, key),
      );
      Object.defineProperty(HTMLElement.prototype, key, {
        configurable: true,
        get(this: HTMLElement) {
          return fake[key](this);
        },
      });
    });
  });
  afterEach(() => {
    originals.forEach((descriptor, key) => {
      if (descriptor)
        Object.defineProperty(HTMLElement.prototype, key, descriptor);
      else delete (HTMLElement.prototype as never)[key];
    });
  });

  const indicator = (wrapper: ReturnType<typeof make>) =>
    wrapper.find(".indicator");

  it("is aria-hidden and takes the selected item's measured box", async () => {
    const wrapper = make({ modelValue: "b", variant: "segmented" });
    await settle();
    const element = indicator(wrapper);
    expect(element.exists()).toBe(true);
    expect(element.attributes("aria-hidden")).toBe("true");
    const style = element.attributes("style")!;
    expect(style).toContain("--indicator-x: 100px");
    expect(style).toContain("--indicator-width: 100px");
    expect(style).toContain("--indicator-height: 30px");
    expect(wrapper.classes()).toContain("placed");
  });

  it("places on first render without animating", async () => {
    const wrapper = make({ modelValue: "c" });
    await settle();
    expect(indicator(wrapper).classes()).not.toContain("animate");
  });

  it("animates a selection change to the new box", async () => {
    const wrapper = make();
    await settle();
    await wrapper.setProps({ modelValue: "c" } as never);
    await settle();
    expect(indicator(wrapper).classes()).toContain("animate");
    expect(indicator(wrapper).attributes("style")).toContain(
      "--indicator-x: 200px",
    );
  });

  it("is absent with no selection and appears without animating", async () => {
    const wrapper = make({ modelValue: undefined });
    await settle();
    expect(indicator(wrapper).exists()).toBe(false);
    expect(wrapper.classes()).not.toContain("placed");
    await wrapper.setProps({ modelValue: "b" } as never);
    await settle();
    expect(indicator(wrapper).exists()).toBe(true);
    expect(indicator(wrapper).classes()).not.toContain("animate");
  });

  it("re-measures instantly when options are replaced", async () => {
    const wrapper = make();
    await settle();
    await wrapper.setProps({ modelValue: "b" } as never);
    await settle();
    await wrapper.setProps({
      options: [{ value: "z", label: "Z" }, ...options],
    } as never);
    await settle();
    const element = indicator(wrapper);
    expect(element.classes()).not.toContain("animate");
    expect(element.attributes("style")).toContain("--indicator-x: 200px");
  });

  it("stays unplaced while the strip is not rendered (0x0)", async () => {
    fake.offsetWidth = () => 0;
    fake.offsetHeight = () => 0;
    const wrapper = make();
    await settle();
    expect(indicator(wrapper).exists()).toBe(false);
    fake.offsetWidth = () => 100;
    fake.offsetHeight = () => 30;
  });

  it("glides on selection change when the parent passes a fresh equal options array each render", async () => {
    const model = ref("a");
    const Parent = defineComponent({
      render: () =>
        h(Tabs as never, {
          // Inline literal: a new array identity on every parent render.
          options: [...options],
          modelValue: model.value,
          "onUpdate:modelValue": (value: string) => (model.value = value),
        }),
    });
    const wrapper = mount(Parent, {
      attachTo: document.body,
      global: { stubs: { "orio-icon": IconStub } },
    });
    mounted.push(wrapper);
    await settle();
    await wrapper.findAll("button")[2].trigger("click");
    await settle();
    expect(wrapper.find(".indicator").classes()).toContain("animate");
    expect(wrapper.find(".indicator").attributes("style")).toContain(
      "--indicator-x: 200px",
    );
  });

  it("re-measures instantly when the resize observer fires", async () => {
    let fire: () => void = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          fire = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const wrapper = make();
    await settle();
    fake.offsetWidth = () => 150;
    fire();
    await settle();
    const element = indicator(wrapper);
    expect(element.attributes("style")).toContain("--indicator-width: 150px");
    expect(element.classes()).not.toContain("animate");
    fake.offsetWidth = () => 100;
    vi.unstubAllGlobals();
  });

  it("stops animating when the transform transition ends", async () => {
    const wrapper = make();
    await settle();
    await wrapper.setProps({ modelValue: "c" } as never);
    await settle();
    expect(indicator(wrapper).classes()).toContain("animate");
    const event = new Event("transitionend");
    Object.defineProperty(event, "propertyName", { value: "transform" });
    indicator(wrapper).element.dispatchEvent(event);
    await settle();
    expect(indicator(wrapper).classes()).not.toContain("animate");
  });

  it("underline with a disabled selected item still gets an indicator", async () => {
    const wrapper = make({
      modelValue: "a",
      options: [
        { value: "a", label: "A", disabled: true },
        ...options.slice(1),
      ],
    });
    await settle();
    expect(indicator(wrapper).exists()).toBe(true);
  });
});
