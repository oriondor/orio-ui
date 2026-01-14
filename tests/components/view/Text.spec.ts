import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Text from "../../../src/runtime/components/view/Text.vue";

describe("view/Text", () => {
  const globalStubs = {
    stubs: {
      "orio-icon": true,
    },
  };

  it("renders without errors", () => {
    const wrapper = mount(Text, { global: globalStubs });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders slot content", () => {
    const wrapper = mount(Text, {
      slots: { default: "Hello World" },
      global: globalStubs,
    });
    expect(wrapper.text()).toContain("Hello World");
  });

  it("renders modelValue when no slot provided", () => {
    const wrapper = mount(Text, {
      props: { modelValue: "Test Value" },
      global: globalStubs,
    });
    expect(wrapper.text()).toContain("Test Value");
  });

  it("applies text type by default", () => {
    const wrapper = mount(Text, { global: globalStubs });
    expect(wrapper.find("div").classes()).toContain("text");
  });

  it("applies title type when specified", () => {
    const wrapper = mount(Text, {
      props: { type: "title" },
      global: globalStubs,
    });
    expect(wrapper.find("div").classes()).toContain("title");
  });

  it("applies medium size by default", () => {
    const wrapper = mount(Text, { global: globalStubs });
    expect(wrapper.find("div").classes()).toContain("medium");
  });

  it("applies large size when specified", () => {
    const wrapper = mount(Text, {
      props: { size: "large" },
      global: globalStubs,
    });
    expect(wrapper.find("div").classes()).toContain("large");
  });

  it("applies uppercase class when specified", () => {
    const wrapper = mount(Text, {
      props: { uppercase: true },
      global: globalStubs,
    });
    expect(wrapper.find("div").classes()).toContain("uppercase");
  });

  it("renders icon when provided", () => {
    const wrapper = mount(Text, {
      props: { icon: "check" },
      global: {
        stubs: {
          "orio-icon": {
            template: '<span class="icon">icon</span>',
            props: ["name"],
          },
        },
      },
    });
    expect(wrapper.html()).toContain("icon");
  });

  it("applies line clamp class when lineClamp provided", () => {
    const wrapper = mount(Text, {
      props: { lineClamp: 3 },
      global: globalStubs,
    });
    expect(wrapper.find("div").classes()).toContain("clamp");
  });

  it("passes attributes to wrapper div", () => {
    const wrapper = mount(Text, {
      attrs: { "data-test": "custom" },
      global: globalStubs,
    });
    expect(wrapper.find("div").attributes("data-test")).toBe("custom");
  });
});
