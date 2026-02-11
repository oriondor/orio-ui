import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DatePicker from "../../src/runtime/components/DatePicker.vue";

const ControlStub = {
  template:
    '<div class="control-stub"><slot id="test-id" /></div>',
};

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

  it("uses id as name attribute", () => {
    const wrapper = mount(DatePicker, {
      props: { date: "2024-01-01" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
        },
      },
    });

    expect(wrapper.find("input").attributes("name")).toBe("test-id");
    expect(wrapper.find("input").attributes("id")).toBe("test-id");
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
