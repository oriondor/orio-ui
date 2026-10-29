import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ListItem from "../../src/runtime/components/ListItem.vue";
import CheckBox from "../../src/runtime/components/CheckBox.vue";
import ControlElement from "../../src/runtime/components/ControlElement.vue";

describe("ListItem", () => {
  it("keeps the selectable row's checkbox out of tab order and AT", () => {
    const wrapper = mount(ListItem, {
      props: { selectable: true },
      global: {
        components: {
          OrioCheckBox: CheckBox,
          OrioControlElement: ControlElement,
        },
      },
    });
    expect(wrapper.find("li").attributes("tabindex")).toBe("0");
    const input = wrapper.find("input");
    expect(input.attributes("tabindex")).toBe("-1");
    expect(input.attributes("aria-hidden")).toBe("true");
  });
});
