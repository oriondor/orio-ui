import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import DatePicker from "../../src/runtime/components/date/Picker.vue";
import { i18n } from "../../src/runtime/i18n";

const TriggerStub = defineComponent({
  name: "TriggerStub",
  props: {
    text: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  setup(props, { slots }) {
    const toggle = vi.fn();
    return () =>
      h("div", { class: "trigger-stub" }, [
        h("span", { class: "trigger-text" }, props.text || props.placeholder),
        h("div", { class: "trigger-content" }, slots.default?.({ toggle })),
      ]);
  },
});

const CalendarStub = defineComponent({
  name: "CalendarStub",
  props: {
    selected: { type: String, default: null },
    rangeStart: { type: String, default: null },
    rangeEnd: { type: String, default: null },
    anchor: { type: String, default: null },
    min: { type: String, default: null },
    max: { type: String, default: null },
  },
  emits: ["select", "dayEnter", "update:anchor"],
  setup(props, { emit }) {
    return () =>
      h(
        "button",
        {
          class: "calendar-stub",
          "data-selected": props.selected ?? "",
          onClick: () => emit("select", "2024-07-04"),
        },
        "pick",
      );
  },
});

function mountDatePicker(props: Record<string, unknown> = {}) {
  return mount(DatePicker, {
    props,
    global: {
      plugins: [i18n],
      stubs: {
        "orio-date-picker-trigger": TriggerStub,
        "orio-calendar": CalendarStub,
      },
    },
  });
}

describe("DatePicker", () => {
  it("renders default placeholder when no value", () => {
    const wrapper = mountDatePicker({ modelValue: null });
    expect(wrapper.find(".trigger-text").text()).toBe("Select a date");
  });

  it("renders custom placeholder", () => {
    const wrapper = mountDatePicker({
      modelValue: null,
      placeholder: "Pick a day",
    });
    expect(wrapper.find(".trigger-text").text()).toBe("Pick a day");
  });

  it("renders formatted value", () => {
    const wrapper = mountDatePicker({ modelValue: "2024-06-15" });
    const text = wrapper.find(".trigger-text").text();
    expect(text).toContain("2024");
    expect(text).not.toContain("Select a date");
  });

  it("passes value to calendar as selected prop", () => {
    const wrapper = mountDatePicker({ modelValue: "2024-06-15" });
    expect(wrapper.find(".calendar-stub").attributes("data-selected")).toBe(
      "2024-06-15",
    );
  });

  it("emits update:modelValue when calendar emits select", async () => {
    const wrapper = mountDatePicker({ modelValue: null });
    await wrapper.find(".calendar-stub").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["2024-07-04"]);
  });
});
