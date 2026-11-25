import { describe, it, expect } from "vitest";
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

  it("whole disabled: nothing selectable, no tab stop, keys no-op", async () => {
    const wrapper = make({ disabled: true });
    expect(wrapper.attributes("aria-disabled")).toBe("true");
    expect(
      buttons(wrapper).every((tab) => tab.attributes("tabindex") === "-1"),
    ).toBe(true);
    await buttons(wrapper)[1].trigger("click");
    await buttons(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
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
});
