import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Tag from "../../src/runtime/components/Tag.vue";

describe("Tag", () => {
  it("renders text content", () => {
    const wrapper = mount(Tag, {
      props: { text: "New" },
    });

    expect(wrapper.text()).toContain("New");
  });

  it("applies variant class", () => {
    const wrapper = mount(Tag, {
      props: { text: "Hot", variant: "accent" },
    });

    expect(wrapper.find(".tag").classes()).toContain("tag--accent");
  });
});
