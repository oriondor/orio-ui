import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import Calendar from "../../src/runtime/components/Calendar.vue";
import { i18n } from "../../src/runtime/i18n";

const ButtonStub = defineComponent({
  name: "ButtonStub",
  inheritAttrs: false,
  props: { icon: { type: String, default: "" } },
  emits: ["click"],
  setup(_, { attrs, emit }) {
    return () =>
      h(
        "button",
        {
          ...attrs,
          class: "calendar-nav-btn",
          onClick: (e: MouseEvent) => emit("click", e),
        },
        [],
      );
  },
});

const BadgeStub = defineComponent({
  name: "BadgeStub",
  setup(_, { slots }) {
    return () => h("span", { class: "badge-stub" }, slots.default?.());
  },
});

function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(Calendar, {
    props,
    global: {
      plugins: [i18n],
      stubs: {
        "orio-icon": true,
        "orio-button": ButtonStub,
        "orio-badge": BadgeStub,
      },
    },
  });
}

describe("Calendar", () => {
  it("renders 42 day cells", () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    expect(wrapper.findAll(".calendar-day")).toHaveLength(42);
  });

  it("emits select with iso when a day is clicked", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const inMonth = wrapper
      .findAll(".calendar-day")
      .filter((d) => !d.classes("out-of-month"));
    await inMonth[0]!.trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual(["2024-06-01"]);
  });

  it("does not emit select when isDisabled returns true", async () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      isDisabled: (iso: string) => iso < "2024-06-15",
    });
    const disabled = wrapper
      .findAll(".calendar-day")
      .filter((d) => d.attributes("disabled") !== undefined);
    expect(disabled.length).toBeGreaterThan(0);
    await disabled[0]!.trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("highlights selected prop and renders day in badge", () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      selected: "2024-06-15",
    });
    const selected = wrapper.findAll(".calendar-day.selected");
    expect(selected).toHaveLength(1);
    expect(selected[0]!.find(".badge-stub").text()).toBe("15");
  });

  it("renders markers with start/end caps and variant class", () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      markers: [{ variant: "accent", start: "2024-06-10", end: "2024-06-15" }],
    });
    expect(wrapper.findAll(".calendar-day.has-marker")).toHaveLength(6);
    expect(wrapper.findAll(".calendar-day.marker-accent")).toHaveLength(6);
    expect(wrapper.findAll(".calendar-day.marker-start")).toHaveLength(1);
    expect(wrapper.findAll(".calendar-day.marker-end")).toHaveLength(1);
  });

  it("single-day marker has both start and end caps", () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      markers: [{ variant: "danger", start: "2024-06-10", end: "2024-06-10" }],
    });
    const cell = wrapper.find(".calendar-day.has-marker");
    expect(cell.classes()).toContain("marker-start");
    expect(cell.classes()).toContain("marker-end");
    expect(cell.classes()).toContain("marker-danger");
  });

  it("last marker wins on overlap", () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      markers: [
        { variant: "accent", start: "2024-06-10", end: "2024-06-15" },
        { variant: "danger", start: "2024-06-12", end: "2024-06-13" },
      ],
    });
    expect(wrapper.findAll(".calendar-day.marker-danger")).toHaveLength(2);
    expect(wrapper.findAll(".calendar-day.marker-accent")).toHaveLength(4);
  });

  it("getMarker overrides markers array", () => {
    const wrapper = mountCalendar({
      anchor: "2024-06-01",
      markers: [{ variant: "accent", start: "2024-06-10", end: "2024-06-15" }],
      getMarker: (iso: string) =>
        iso === "2024-06-12"
          ? { variant: "danger" as const, start: iso, end: iso }
          : null,
    });
    expect(wrapper.findAll(".calendar-day.marker-danger")).toHaveLength(1);
    expect(wrapper.findAll(".calendar-day.marker-accent")).toHaveLength(5);
  });

  it("emits update:anchor when navigating months", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const button = wrapper.find('[aria-label="Next month"]');
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(wrapper.emitted("update:anchor")?.[0]).toEqual(["2024-07-01"]);
  });

  it("emits update:anchor with previous month", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const button = wrapper.find('[aria-label="Previous month"]');
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(wrapper.emitted("update:anchor")?.[0]).toEqual(["2024-05-01"]);
  });

  it("emits update:anchor with next year", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const button = wrapper.find('[aria-label="Next year"]');
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(wrapper.emitted("update:anchor")?.[0]).toEqual(["2025-06-01"]);
  });

  it("emits update:anchor with previous year", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const button = wrapper.find('[aria-label="Previous year"]');
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(wrapper.emitted("update:anchor")?.[0]).toEqual(["2023-06-01"]);
  });

  it("emits dayEnter on hover", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const inMonth = wrapper
      .findAll(".calendar-day")
      .filter((d) => !d.classes("out-of-month"));
    await inMonth[0]!.trigger("mouseenter");
    expect(wrapper.emitted("dayEnter")?.[0]).toEqual(["2024-06-01"]);
  });

  it("does not internally manage selection", async () => {
    const wrapper = mountCalendar({ anchor: "2024-06-01" });
    const inMonth = wrapper
      .findAll(".calendar-day")
      .filter((d) => !d.classes("out-of-month"));
    await inMonth[0]!.trigger("click");
    expect(wrapper.findAll(".calendar-day.selected")).toHaveLength(0);
  });
});
