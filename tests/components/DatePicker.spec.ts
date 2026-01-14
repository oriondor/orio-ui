import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DatePicker from "../../src/runtime/components/DatePicker.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

vi.mock("nanoid", () => ({
  nanoid: () => "fixedid",
}));

describe("DatePicker", () => {
  it("uses date input by default", () => {
    const wrapper = mount(DatePicker, {
      props: { date: "2024-01-01" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("type")).toBe("date");
  });

  it("uses month input when month prop is true", () => {
    const wrapper = mount(DatePicker, {
      props: { date: "2024-01", month: true },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("type")).toBe("month");
  });

  it("generates a stable name attribute", () => {
    const wrapper = mount(DatePicker, {
      props: { date: "2024-01-01" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("name")).toBe("date-fixedid");
  });

  it("emits update when date changes", async () => {
    const wrapper = mount(DatePicker, {
      props: { date: "2024-01-01" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    await wrapper.find("input").setValue("2024-02-02");

    expect(wrapper.emitted("update:date")?.[0]).toEqual(["2024-02-02"]);
  });
});
