import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Dates from "../../../src/runtime/components/view/Dates.vue";
import { i18n } from "../../../src/runtime/i18n";

const ViewTextStub = {
  template:
    '<span class="view-text" :data-type="type" :data-size="size">{{ modelValue }}</span>',
  props: ["modelValue", "type", "size"],
};

describe("view/Dates", () => {
  it("renders only the start when end is undefined", () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { start: "2024-01-01" },
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-view-text": ViewTextStub,
        },
      },
    });

    const items = wrapper.findAll(".view-text");
    expect(items).toHaveLength(1);
    expect(items[0].text()).toContain("2024");
  });

  it("renders both start and end when both are set", () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { start: "2024-01-01", end: "2024-12-31" },
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-view-text": ViewTextStub,
        },
      },
    });

    expect(wrapper.findAll(".view-text")).toHaveLength(2);
  });

  it("passes type and size to view text", () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { start: "2024-01-01", end: "2024-02-01" },
        type: "title",
        size: "large",
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-view-text": ViewTextStub,
        },
      },
    });

    const items = wrapper.findAll(".view-text");
    expect(items[0].attributes("data-type")).toBe("title");
    expect(items[0].attributes("data-size")).toBe("large");
  });

  it("formats month and year when month is true", () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { start: "2024-01-15" },
        month: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-view-text": ViewTextStub,
        },
      },
    });

    expect(wrapper.text()).toContain("2024");
    expect(wrapper.text()).not.toContain(",");
  });

  it("renders the present label when end is null", () => {
    const wrapper = mount(Dates, {
      props: { dates: { start: "2015-09-01", end: null } },
      global: { plugins: [i18n], stubs: { "orio-view-text": ViewTextStub } },
    });

    expect(wrapper.text()).toContain("Present");
    expect(wrapper.text()).toContain("-");
  });

  it("renders a single date when end is undefined", () => {
    const wrapper = mount(Dates, {
      props: { dates: { start: "2015-09-01" } },
      global: { plugins: [i18n], stubs: { "orio-view-text": ViewTextStub } },
    });

    expect(wrapper.text()).not.toContain("Present");
    expect(wrapper.text()).not.toContain("-");
  });

  it("honours the presentText override", () => {
    const wrapper = mount(Dates, {
      props: {
        dates: { start: "2015-09-01", end: null },
        presentText: "Ongoing",
      },
      global: { plugins: [i18n], stubs: { "orio-view-text": ViewTextStub } },
    });

    expect(wrapper.text()).toContain("Ongoing");
  });
});
