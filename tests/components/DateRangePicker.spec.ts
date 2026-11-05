import { afterEach, describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import DateRangePicker from "../../src/runtime/components/date/RangePicker.vue";
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

type StubMarker = { variant: string; start: string; end: string };

const CalendarStub = defineComponent({
  name: "CalendarStub",
  props: {
    selected: { type: String, default: null },
    markers: { type: Array, default: () => [] },
    getMarker: { type: Function, default: null },
    isDisabled: { type: Function, default: null },
    anchor: { type: String, default: null },
  },
  emits: ["select", "dayEnter", "update:anchor"],
  setup(props, { emit }) {
    return () => {
      const probed = props.getMarker?.("2024-06-15") as StubMarker | null;
      return h(
        "button",
        {
          class: "calendar-stub",
          "data-anchor": props.anchor ?? "",
          "data-preview-end": probed?.end ?? "",
          "data-preview-start": probed?.start ?? "",
          onClick: (e: MouseEvent) => {
            const target = e.currentTarget as HTMLElement;
            emit("select", target.dataset.pick || "2024-06-15");
          },
          onMouseenter: (e: MouseEvent) => {
            const target = e.currentTarget as HTMLElement;
            if (target.dataset.hover) emit("dayEnter", target.dataset.hover);
          },
          // stands in for the calendar's own month navigation
          onNavigate: (e: CustomEvent<string>) =>
            emit("update:anchor", e.detail),
        },
        "pick",
      );
    };
  },
});

function mountRangePicker(props: Record<string, unknown> = {}) {
  return mount(DateRangePicker, {
    props,
    global: {
      plugins: [i18n],
      stubs: {
        "orio-date-picker-trigger": TriggerStub,
        "orio-calendar": CalendarStub,
        "orio-date-month-calendar": true,
        "orio-button": defineComponent({
          emits: ["click"],
          setup(_, { slots, emit }) {
            return () =>
              h(
                "button",
                { class: "side-button", onClick: () => emit("click") },
                slots.default?.(),
              );
          },
        }),
      },
    },
  });
}

describe("DateRangePicker", () => {
  it("renders default placeholder when range is empty", () => {
    const wrapper = mountRangePicker({
      modelValue: { start: null, end: null },
    });
    expect(wrapper.find(".trigger-text").text()).toBe("Select a date range");
  });

  it("renders both start and end when set", () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-01-01", end: "2024-12-31" },
    });
    const text = wrapper.find(".trigger-text").text();
    expect(text).toContain("2024");
    expect(text).toContain("–");
  });

  it("renders only start when end is null", () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-01-01", end: null },
    });
    const text = wrapper.find(".trigger-text").text();
    expect(text).toContain("2024");
    expect(text).not.toContain("–");
  });

  it("renders two calendar instances", () => {
    const wrapper = mountRangePicker({
      modelValue: { start: null, end: null },
    });
    expect(wrapper.findAll(".calendar-stub")).toHaveLength(2);
  });

  it("calendars have independent anchors", () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-06-01", end: null },
    });
    const calendars = wrapper.findAll(".calendar-stub");
    expect(calendars[0]!.attributes("data-anchor")).toBe("2024-06-01");
    expect(calendars[1]!.attributes("data-anchor")).toBe("2024-07-01");
  });

  it("first selection sets start", async () => {
    const wrapper = mountRangePicker({
      modelValue: { start: null, end: null },
    });
    const calendar = wrapper.find(".calendar-stub").element as HTMLElement;
    calendar.dataset.pick = "2024-06-10";
    await wrapper.find(".calendar-stub").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      { start: "2024-06-10", end: null },
    ]);
  });

  it("second selection sets end when after start", async () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-06-10", end: null },
    });
    const calendar = wrapper.find(".calendar-stub").element as HTMLElement;
    calendar.dataset.pick = "2024-06-20";
    await wrapper.find(".calendar-stub").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      { start: "2024-06-10", end: "2024-06-20" },
    ]);
  });

  it("second selection swaps start/end when before existing start", async () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-06-15", end: null },
    });
    const calendar = wrapper.find(".calendar-stub").element as HTMLElement;
    calendar.dataset.pick = "2024-06-05";
    await wrapper.find(".calendar-stub").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      { start: "2024-06-05", end: "2024-06-15" },
    ]);
  });

  it("third click resets range with new start", async () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-06-10", end: "2024-06-20" },
    });
    const calendar = wrapper.find(".calendar-stub").element as HTMLElement;
    calendar.dataset.pick = "2024-07-05";
    await wrapper.find(".calendar-stub").trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      { start: "2024-07-05", end: null },
    ]);
  });

  it("hovering after start fills preview marker on both calendars", async () => {
    const wrapper = mountRangePicker({
      modelValue: { start: "2024-06-10", end: null },
    });
    const calendar = wrapper.find(".calendar-stub").element as HTMLElement;
    calendar.dataset.hover = "2024-06-20";
    await wrapper.find(".calendar-stub").trigger("mouseenter");

    const calendars = wrapper.findAll(".calendar-stub");
    expect(calendars[0]!.attributes("data-preview-start")).toBe("2024-06-10");
    expect(calendars[0]!.attributes("data-preview-end")).toBe("2024-06-20");
    expect(calendars[1]!.attributes("data-preview-start")).toBe("2024-06-10");
    expect(calendars[1]!.attributes("data-preview-end")).toBe("2024-06-20");
  });

  it("renders two month panels anchored a year apart when month is set", () => {
    const anchors: (string | null)[] = [];
    const MonthCalendarStub = defineComponent({
      name: "MonthCalendarStub",
      props: {
        anchor: { type: String, default: null },
        selected: { type: String, default: null },
        markers: { type: Array, default: () => [] },
        getMarker: { type: Function, default: undefined },
        isDisabled: { type: Function, default: undefined },
      },
      emits: ["select", "monthEnter", "update:anchor"],
      created() {
        anchors.push(this.anchor);
      },
      template: '<div class="month-calendar-stub" />',
    });

    const wrapper = mount(DateRangePicker, {
      props: {
        modelValue: { start: "2015-09-01", end: "2019-06-01" },
        month: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-date-picker-trigger": TriggerStub,
          "orio-date-month-calendar": MonthCalendarStub,
          "orio-calendar": CalendarStub,
        },
      },
    });

    expect(wrapper.findAll(".month-calendar-stub")).toHaveLength(2);
    expect(wrapper.findAll(".calendar-stub")).toHaveLength(0);
    expect(anchors).toEqual(["2015-01-01", "2016-01-01"]);
  });

  it("formats the range as months when month is set", () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        modelValue: { start: "2015-09-01", end: "2019-06-01" },
        month: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-date-picker-trigger": TriggerStub,
          "orio-date-month-calendar": true,
          "orio-calendar": CalendarStub,
        },
      },
    });

    const text = wrapper.find(".trigger-text").text();
    expect(text).toContain("Sep 2015");
    expect(text).toContain("Jun 2019");
    expect(text).toContain("–");
  });

  describe("on a narrow screen", () => {
    afterEach(() => vi.unstubAllGlobals());

    const narrow = () =>
      vi.stubGlobal("matchMedia", () => ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
    const anchorOf = (wrapper: ReturnType<typeof mountRangePicker>) =>
      wrapper.find(".calendar-stub").attributes("data-anchor");
    const navigate = async (
      wrapper: ReturnType<typeof mountRangePicker>,
      anchor: string,
    ) => {
      wrapper
        .find(".calendar-stub")
        .element.dispatchEvent(new CustomEvent("navigate", { detail: anchor }));
      await wrapper.vm.$nextTick();
    };

    it("shows one calendar and switches between start and end month", async () => {
      narrow();
      const wrapper = mountRangePicker({
        modelValue: { start: "2024-06-01", end: null },
      });

      expect(wrapper.findAll(".calendar-stub")).toHaveLength(1);
      expect(wrapper.find(".calendar-stub").attributes("data-anchor")).toBe(
        "2024-06-01",
      );

      const [, endButton] = wrapper.findAll(".side-button");
      expect(endButton!.text()).toBe("End");
      await endButton!.trigger("click");

      expect(wrapper.findAll(".calendar-stub")).toHaveLength(1);
      expect(wrapper.find(".calendar-stub").attributes("data-anchor")).toBe(
        "2024-07-01",
      );
    });

    it("each side keeps its navigated month across switches", async () => {
      narrow();
      const wrapper = mountRangePicker({
        modelValue: { start: "2024-06-01", end: null },
      });
      const [startButton, endButton] = wrapper.findAll(".side-button");

      await navigate(wrapper, "2024-03-01");
      await endButton!.trigger("click");
      await navigate(wrapper, "2024-10-01");
      await startButton!.trigger("click");
      expect(anchorOf(wrapper)).toBe("2024-03-01");
      await endButton!.trigger("click");
      expect(anchorOf(wrapper)).toBe("2024-10-01");
    });

    it("picking a start on the Start view opens End on the same month", async () => {
      narrow();
      const wrapper = mountRangePicker({
        modelValue: { start: "2024-06-10", end: "2024-06-20" },
        "onUpdate:modelValue": (value: unknown) =>
          wrapper.setProps({ modelValue: value }),
      });
      const [startButton, endButton] = wrapper.findAll(".side-button");

      const calendar = wrapper.find(".calendar-stub");
      (calendar.element as HTMLElement).dataset.pick = "2024-06-25";
      await calendar.trigger("click");

      expect(endButton!.attributes("aria-pressed")).toBe("true");
      expect(startButton!.attributes("aria-pressed")).toBe("false");
      expect(anchorOf(wrapper)).toBe("2024-06-01");
    });

    it("a trailing-cell start pick on the End view keeps the End month", async () => {
      narrow();
      const wrapper = mountRangePicker({
        modelValue: { start: "2024-06-10", end: "2024-06-20" },
        "onUpdate:modelValue": (value: unknown) =>
          wrapper.setProps({ modelValue: value }),
      });
      const [startButton, endButton] = wrapper.findAll(".side-button");
      await endButton!.trigger("click");
      expect(anchorOf(wrapper)).toBe("2024-07-01");

      // August 2nd, shown in the trailing row of July
      const calendar = wrapper.find(".calendar-stub");
      (calendar.element as HTMLElement).dataset.pick = "2024-08-02";
      await calendar.trigger("click");

      expect(wrapper.props("modelValue")).toEqual({
        start: "2024-08-02",
        end: null,
      });
      expect(anchorOf(wrapper)).toBe("2024-07-01");
      await startButton!.trigger("click");
      expect(anchorOf(wrapper)).toBe("2024-08-01");
    });
  });
});
