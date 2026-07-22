import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import CalendarGrid, {
  type CalendarCell,
  type CalendarGridRoving,
} from "../../src/runtime/components/date/components/CalendarGrid.vue";

const BadgeStub = defineComponent({
  name: "BadgeStub",
  setup(_, { slots }) {
    return () => h("span", { class: "badge-stub" }, slots.default?.());
  },
});

const noopRoving: CalendarGridRoving = {
  getInitialKey: () => "2024-06-01",
  onArrowOverflow: () => null,
  onPage: () => null,
};

function cell(partial: Partial<CalendarCell> & { iso: string }): CalendarCell {
  return {
    label: 1,
    ariaLabel: partial.iso,
    isSelected: false,
    isToday: false,
    isDisabled: false,
    marker: null,
    ...partial,
  };
}

function mountGrid(props: {
  type: "day" | "month";
  cells: CalendarCell[][];
}) {
  return mount(CalendarGrid, {
    props: { labelledBy: "title-id", roving: noopRoving, ...props },
    global: { stubs: { "orio-badge": BadgeStub } },
  });
}

describe("CalendarGrid", () => {
  it("renders a labelled grid of gridcell buttons", () => {
    const wrapper = mountGrid({
      type: "day",
      cells: [[cell({ iso: "2024-06-01" }), cell({ iso: "2024-06-02" })]],
    });
    const grid = wrapper.get('[role="grid"]');
    expect(grid.attributes("aria-labelledby")).toBe("title-id");
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(2);
  });

  it("applies marker classes for a marked cell", () => {
    const wrapper = mountGrid({
      type: "day",
      cells: [
        [
          cell({
            iso: "2024-06-01",
            marker: { variant: "danger", isStart: true, isEnd: false },
          }),
        ],
      ],
    });
    const button = wrapper.get('[role="gridcell"]');
    expect(button.classes()).toContain("has-marker");
    expect(button.classes()).toContain("marker-danger");
    expect(button.classes()).toContain("marker-start");
    expect(button.classes()).not.toContain("marker-end");
  });

  it("wraps the selected day label in a badge", () => {
    const wrapper = mountGrid({
      type: "day",
      cells: [[cell({ iso: "2024-06-01", label: 1, isSelected: true })]],
    });
    expect(wrapper.find(".badge-stub").exists()).toBe(true);
  });

  it("marks the selected month with the selected class (no badge)", () => {
    const wrapper = mountGrid({
      type: "month",
      cells: [[cell({ iso: "2024-06-01", label: "Jun", isSelected: true })]],
    });
    expect(wrapper.get('[role="gridcell"]').classes()).toContain("selected");
    expect(wrapper.find(".badge-stub").exists()).toBe(false);
  });

  it("emits select on click and cellEnter on mouseenter", async () => {
    const wrapper = mountGrid({
      type: "month",
      cells: [[cell({ iso: "2024-06-01", label: "Jun" })]],
    });
    const button = wrapper.get('[role="gridcell"]');
    await button.trigger("click");
    await button.trigger("mouseenter");
    expect(wrapper.emitted("select")?.[0]).toEqual(["2024-06-01"]);
    expect(wrapper.emitted("cellEnter")?.[0]).toEqual(["2024-06-01"]);
  });

  it("does not emit select for a disabled cell", async () => {
    const wrapper = mountGrid({
      type: "day",
      cells: [[cell({ iso: "2024-06-01", isDisabled: true })]],
    });
    await wrapper.get('[role="gridcell"]').trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();
  });
});
