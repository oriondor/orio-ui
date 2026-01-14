import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LoadingSpinner from "../../src/runtime/components/LoadingSpinner.vue";

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ["name"],
};

describe("LoadingSpinner", () => {
  it("renders without errors", () => {
    const wrapper = mount(LoadingSpinner, {
      global: {
        stubs: {
          "orio-icon": IconStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders the loading-loop icon", () => {
    const wrapper = mount(LoadingSpinner, {
      global: {
        stubs: {
          "orio-icon": IconStub,
        },
      },
    });

    expect(wrapper.find(".icon-stub").attributes("data-name")).toBe(
      "loading-loop",
    );
  });
});
