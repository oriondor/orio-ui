import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Separator from "../../../src/runtime/components/view/Separator.vue";

describe("view/Separator", () => {
  it("renders without errors", () => {
    const wrapper = mount(Separator);
    expect(wrapper.exists()).toBe(true);
  });

  it("uses default props", () => {
    const wrapper = mount(Separator);

    expect(wrapper.props("style")).toBe("solid");
    expect(wrapper.props("size")).toBe(1);
    expect(wrapper.props("margin")).toBe(1);
  });

  it("accepts custom props", () => {
    const wrapper = mount(Separator, {
      props: { style: "dashed", size: 2, margin: 3 },
    });

    expect(wrapper.props("style")).toBe("dashed");
    expect(wrapper.props("size")).toBe(2);
    expect(wrapper.props("margin")).toBe(3);
  });
});
