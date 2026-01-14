import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashedContainer from "../../src/runtime/components/DashedContainer.vue";

const IconStub = {
  template: '<span class="icon-stub" :data-size="size"></span>',
  props: ["size"],
};

describe("DashedContainer", () => {
  it("emits click when container is clicked", async () => {
    const wrapper = mount(DashedContainer, {
      global: {
        stubs: {
          "orio-icon": IconStub,
        },
      },
    });

    await wrapper.find(".dashed-container").trigger("click");

    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("uses icon size based on size prop", () => {
    const wrapper = mount(DashedContainer, {
      props: { icon: "upload", size: "small" },
      global: {
        stubs: {
          "orio-icon": IconStub,
        },
      },
    });

    expect(wrapper.find(".icon-stub").attributes("data-size")).toBe("2rem");
  });
});
