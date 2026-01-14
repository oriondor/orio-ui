import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import DateRangePicker from "../../src/runtime/components/DateRangePicker.vue";
import type { ResumeDate } from "../../src/runtime/components/view/Dates.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const CheckBoxStub = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<button class="checkbox-stub" @click="$emit(\'update:modelValue\', !modelValue)">present</button>',
});

describe("DateRangePicker", () => {
  const defaultDates: ResumeDate = {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  };

  it("renders with default dates", () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: defaultDates,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-date-picker": true,
          "orio-check-box": CheckBoxStub,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("shows error when start date is after end date", () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        dates: {
          startDate: "2024-12-31",
          endDate: "2024-01-01",
        },
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-date-picker": true,
          "orio-check-box": CheckBoxStub,
        },
      },
    });

    expect(wrapper.find(".error-message").exists()).toBe(true);
  });

  it("sets end date to null when present is toggled on", async () => {
    const dates: ResumeDate = {
      startDate: "2024-01-01",
      endDate: "",
    };

    const wrapper = mount(DateRangePicker, {
      props: {
        dates,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-date-picker": true,
          "orio-check-box": CheckBoxStub,
        },
      },
    });

    await wrapper.find(".checkbox-stub").trigger("click");
    await nextTick();

    expect(dates.endDate).toBeNull();
  });
});
