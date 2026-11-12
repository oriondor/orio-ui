import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import ControlElement from "../../src/runtime/components/ControlElement.vue";
import Input from "../../src/runtime/components/Input.vue";
import CheckBox from "../../src/runtime/components/CheckBox.vue";

describe("ControlElement", () => {
  it("renders without errors", () => {
    const wrapper = mount(ControlElement);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders slot content", () => {
    const wrapper = mount(ControlElement, {
      slots: { default: '<input type="text" />' },
    });
    expect(wrapper.html()).toContain("input");
  });

  it("renders label when provided", () => {
    const wrapper = mount(ControlElement, {
      attrs: { label: "Username" },
      slots: { default: '<input type="text" />' },
    });
    expect(wrapper.find(".control-label").text()).toBe("Username");
  });

  it("does not render label when not provided", () => {
    const wrapper = mount(ControlElement, {
      slots: { default: '<input type="text" />' },
    });
    expect(wrapper.find(".control-label").exists()).toBe(false);
  });

  it("applies normal appearance by default", () => {
    const wrapper = mount(ControlElement);
    expect(wrapper.find(".control").classes()).toContain("normal");
  });

  it("applies minimal appearance when specified", () => {
    const wrapper = mount(ControlElement, {
      props: { appearance: "minimal" },
    });
    expect(wrapper.find(".control").classes()).toContain("minimal");
  });

  it("applies vertical layout by default", () => {
    const wrapper = mount(ControlElement);
    expect(wrapper.find(".control").classes()).toContain("vertical");
  });

  it("applies horizontal layout when specified", () => {
    const wrapper = mount(ControlElement, {
      props: { layout: "horizontal" },
    });
    expect(wrapper.find(".control").classes()).toContain("horizontal");
  });
});

describe("control bag through wrappers", () => {
  const global = { components: { OrioControlElement: ControlElement } };

  it("keeps attrs the caller passed when the bag has nothing to say", () => {
    const wrapper = mount(Input, {
      attrs: { "aria-describedby": "hint", "aria-invalid": "true" },
      global,
    });
    const input = wrapper.find("input");
    expect(input.attributes("aria-describedby")).toBe("hint");
    expect(input.attributes("aria-invalid")).toBe("true");
  });

  it("merges a caller description with the error id", () => {
    const wrapper = mount(Input, {
      props: { id: "email", error: "Required" },
      attrs: { "aria-describedby": "hint" },
      global,
    });
    expect(wrapper.find("input").attributes("aria-describedby")).toBe(
      "hint email-error",
    );
  });

  it("follows a reactive aria-describedby", async () => {
    const hint = ref("hint-a");
    const Parent = defineComponent({
      render: () => h(Input, { "aria-describedby": hint.value }),
    });
    const wrapper = mount(Parent, { global });
    hint.value = "hint-b";
    await nextTick();
    expect(wrapper.find("input").attributes("aria-describedby")).toBe("hint-b");
  });

  it("announces the error text", () => {
    const wrapper = mount(Input, { props: { error: "Required" }, global });
    expect(wrapper.find(".control-error").attributes("role")).toBe("alert");
  });

  it("leaves CheckBox in the tab order and honours tabindex", () => {
    const reachable = mount(CheckBox, { global });
    expect(reachable.find("input").attributes("tabindex")).toBeUndefined();

    const custom = mount(CheckBox, { props: { tabindex: 3 }, global });
    expect(custom.find("input").attributes("tabindex")).toBe("3");
  });
});
