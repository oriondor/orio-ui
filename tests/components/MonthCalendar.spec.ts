import { describe, it, expect, vi, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import MonthCalendar from "../../src/runtime/components/date/MonthCalendar.vue";
import { i18n } from "../../src/runtime/i18n";

const ButtonStub = {
  template:
    '<button class="button-stub" @click="$emit(\'click\')"><slot /></button>',
};

function mountMonthCalendar(props: Record<string, unknown> = {}) {
  return mount(MonthCalendar, {
    props: { anchor: "2019-01-01", ...props },
    global: {
      plugins: [i18n],
      stubs: { "orio-button": ButtonStub, "orio-badge": true },
    },
  });
}

describe("MonthCalendar", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    // jsdom ships no CSS global; the roving grid uses CSS.escape for focus-key lookups
    if (typeof globalThis.CSS === "undefined") {
      vi.stubGlobal("CSS", { escape: (value: string) => value });
    }
  });

  it("renders 12 month cells for the anchored year", () => {
    const wrapper = mountMonthCalendar();
    const cells = wrapper.findAll(".calendar-cell");
    expect(cells).toHaveLength(12);
    expect(cells[0].text()).toBe(
      new Intl.DateTimeFormat("en", { month: "short" }).format(
        new Date(2019, 0, 1),
      ),
    );
  });

  it("emits first-of-month ISO on cell click", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[8].trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual(["2019-09-01"]);
  });

  it("marks the selected month", () => {
    const wrapper = mountMonthCalendar({ selected: "2019-06-15" });
    const selectedCells = wrapper.findAll(".calendar-cell.selected");
    expect(selectedCells).toHaveLength(1);
    expect(selectedCells[0].attributes("aria-selected")).toBe("true");
  });

  it("shifts the visible year with the nav buttons", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".button-stub")[1].trigger("click");
    expect(wrapper.emitted("update:anchor")?.[0]).toEqual(["2020-01-01"]);
  });

  it("disables months via isDisabled", () => {
    const wrapper = mountMonthCalendar({
      isDisabled: (iso: string) => iso < "2019-06-01",
    });
    const disabledCells = wrapper.findAll(".calendar-cell:disabled");
    expect(disabledCells).toHaveLength(5);
  });

  it("moves into the next year when ArrowRight overflows past December", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[11].trigger("click"); // December 2019
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2020-01-01"]);
    // January 2020 becomes the roving-focus target
    expect(wrapper.findAll(".calendar-cell")[0].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("moves into the previous year when ArrowLeft overflows past January", async () => {
    const wrapper = mountMonthCalendar();
    // January 2019 is the initial active cell for the anchored year
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "ArrowLeft" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2018-01-01"]);
    // December 2018 becomes the roving-focus target
    expect(wrapper.findAll(".calendar-cell")[11].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("crosses the year boundary by three months on vertical arrow overflow", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[10].trigger("click"); // November 2019
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "ArrowDown" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2020-01-01"]);
    // February 2020 becomes the roving-focus target
    expect(wrapper.findAll(".calendar-cell")[1].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("skips disabled months when overflowing across the year boundary", async () => {
    const wrapper = mountMonthCalendar({
      isDisabled: (iso: string) => iso === "2020-01-01",
    });
    await wrapper.findAll(".calendar-cell")[11].trigger("click"); // December 2019
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2020-01-01"]);
    // January 2020 is disabled, so February 2020 becomes the target
    expect(wrapper.findAll(".calendar-cell")[1].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("jumps a full year on PageDown keeping the same month", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[5].trigger("click"); // June 2019
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "PageDown" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2020-01-01"]);
    // June 2020 becomes the roving-focus target
    expect(wrapper.findAll(".calendar-cell")[5].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("jumps back a full year on PageUp keeping the same month", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[5].trigger("click"); // June 2019
    await wrapper.find(".calendar-grid").trigger("keydown", { key: "PageUp" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2018-01-01"]);
    // June 2018 becomes the roving-focus target
    expect(wrapper.findAll(".calendar-cell")[5].attributes("tabindex")).toBe(
      "0",
    );
  });

  it("skips a disabled month when paging into another year", async () => {
    const wrapper = mountMonthCalendar({
      isDisabled: (iso: string) => iso === "2020-06-01",
    });
    await wrapper.findAll(".calendar-cell")[5].trigger("click"); // June 2019
    await wrapper
      .find(".calendar-grid")
      .trigger("keydown", { key: "PageDown" });

    expect(wrapper.emitted("update:anchor")?.at(-1)).toEqual(["2020-01-01"]);

    await wrapper.setProps({ anchor: "2020-01-01" });
    const cells = wrapper.findAll(".calendar-cell");
    // June 2020 is disabled, so July 2020 takes the roving focus instead
    expect(cells[5].attributes("tabindex")).toBe("-1");
    expect(cells[6].attributes("tabindex")).toBe("0");
  });

  it("emits monthEnter on hover for range preview", async () => {
    const wrapper = mountMonthCalendar();
    await wrapper.findAll(".calendar-cell")[3].trigger("mouseenter");
    expect(wrapper.emitted("monthEnter")?.[0]).toEqual(["2019-04-01"]);
  });
});
