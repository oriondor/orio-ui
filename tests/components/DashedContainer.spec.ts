import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
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

  it("renders custom icon content via the #icon slot", () => {
    const wrapper = mount(DashedContainer, {
      props: { icon: "upload" },
      slots: { icon: '<span class="custom-icon">iconify-here</span>' },
      global: { stubs: { "orio-icon": true } },
    });

    expect(wrapper.find(".custom-icon").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "orio-icon" }).exists()).toBe(false);
  });

  it("exposes iconSize to the #icon slot", () => {
    const wrapper = mount(DashedContainer, {
      props: { size: "large" },
      slots: { icon: ({ iconSize }) => h("i", { class: "sized" }, iconSize) },
      global: { stubs: { "orio-icon": true } },
    });

    expect(wrapper.find(".sized").text()).toBe("5rem");
  });

  it("renders custom text content via the default slot", () => {
    const wrapper = mount(DashedContainer, {
      props: { text: "fallback text" },
      slots: { default: '<em class="custom-text">rich text</em>' },
      global: { stubs: { "orio-icon": true } },
    });

    expect(wrapper.find(".custom-text").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("fallback text");
  });
});
