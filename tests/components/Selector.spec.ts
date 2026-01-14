import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Selector from "../../src/runtime/components/Selector.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const PopoverStub = defineComponent({
  name: "PopoverStub",
  setup(_, { slots }) {
    const toggle = vi.fn();
    return () =>
      h("div", { class: "popover-stub" }, [
        slots.default?.({ toggle }),
        h("div", { class: "popover-content" }, slots.content?.({ toggle })),
      ]);
  },
});

const EmptyStateStub = {
  template: '<div class="empty-state-stub">empty</div>',
};

describe("Selector", () => {
  const stringOptions = ["Option 1", "Option 2"];
  const objectOptions = [
    { id: 1, name: "First" },
    { id: 2, name: "Second" },
  ];

  it("shows default placeholder when no option selected", () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
        },
      },
    });

    expect(wrapper.find(".trigger-content").text()).toContain(
      "Select an option",
    );
  });

  it("emits update when selecting a string option", async () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
        },
      },
    });

    await wrapper.findAll("li")[0].trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Option 1"]);
  });

  it("renders object option labels using optionName", () => {
    const wrapper = mount(Selector, {
      props: {
        options: objectOptions,
        modelValue: null,
        optionName: "name",
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
        },
      },
    });

    expect(wrapper.findAll("li")[0].text()).toBe("First");
  });

  it("shows empty state when options are empty", () => {
    const wrapper = mount(Selector, {
      props: {
        options: [],
        modelValue: null,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
        },
      },
    });

    expect(wrapper.find(".empty-state-stub").exists()).toBe(true);
  });

  it("updates selected count in multiple mode", async () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: [],
        multiple: true,
      },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
        },
      },
    });

    await wrapper.findAll("li")[0].trigger("click");
    await nextTick();

    expect(wrapper.find(".trigger-content").text()).toContain("1 selected");
  });
});
