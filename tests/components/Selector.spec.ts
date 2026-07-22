import { describe, it, expect, vi, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Selector from "../../src/runtime/components/Selector.vue";
import ListItem from "../../src/runtime/components/ListItem.vue";
import { i18n } from "../../src/runtime/i18n";

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
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

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
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
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
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
    });

    await wrapper.findAll(".list-item")[0].trigger("click");

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
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
    });

    expect(wrapper.findAll(".list-item")[0].text()).toBe("First");
  });

  it("shows empty state when options are empty", () => {
    const wrapper = mount(Selector, {
      props: {
        options: [],
        modelValue: null,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
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
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
    });

    await wrapper.findAll(".list-item")[0].trigger("click");
    await nextTick();

    expect(wrapper.find(".trigger-content").text()).toContain("1 selected");
  });

  it("does not throw in multiple mode when model is null", () => {
    const wrapper = mount(Selector, {
      props: {
        options: stringOptions,
        modelValue: null,
        multiple: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
    });

    const listItems = wrapper.findAll(".list-item");
    expect(listItems).toHaveLength(2);
    listItems.forEach((listItem) => {
      expect(listItem.attributes("aria-selected")).toBe("false");
    });
  });

  function createPopoverStub(toggleSpy: ReturnType<typeof vi.fn>) {
    return defineComponent({
      name: "PopoverSpyStub",
      setup(_, { slots }) {
        return () =>
          h("div", { class: "popover-stub" }, [
            slots.default?.({ toggle: toggleSpy, isOpen: false }),
            h(
              "div",
              { class: "popover-content" },
              slots.content?.({ toggle: toggleSpy }),
            ),
          ]);
      },
    });
  }

  it("exposes selectHighlighted on the trigger slot to select the highlighted option", async () => {
    let didSelect: boolean | undefined;
    const wrapper = mount(Selector, {
      props: { options: stringOptions, modelValue: null },
      slots: {
        trigger: (slotProps) => {
          const { selectHighlighted, triggerKeydown } = slotProps as {
            selectHighlighted: () => boolean;
            triggerKeydown: (event: KeyboardEvent) => void;
          };
          return h("button", {
            class: "custom-trigger",
            onKeydown: triggerKeydown,
            onClick: () => {
              didSelect = selectHighlighted();
            },
          });
        },
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": PopoverStub,
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
    });

    const customTrigger = wrapper.find(".custom-trigger");

    // No highlight yet: selection must be refused
    await customTrigger.trigger("click");
    expect(didSelect).toBe(false);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    // ArrowDown opens the list and highlights the first option
    await customTrigger.trigger("keydown", { key: "ArrowDown" });
    await customTrigger.trigger("click");
    expect(didSelect).toBe(true);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["Option 1"]);
  });

  it("leaves typing keys to editable elements slotted into the trigger", () => {
    const toggleSpy = vi.fn();
    const wrapper = mount(Selector, {
      props: { options: stringOptions, modelValue: [], multiple: true },
      slots: { "trigger-label": '<input class="inner-input" />' },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": createPopoverStub(toggleSpy),
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
      attachTo: document.body,
    });

    const inputElement = wrapper.find(".inner-input").element;
    ["Home", "End", " ", "ArrowLeft", "ArrowRight", "Enter"].forEach((key) => {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      inputElement.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    wrapper.unmount();
  });

  it("leaves typing keys to descendants of a contenteditable trigger element", () => {
    const toggleSpy = vi.fn();
    const wrapper = mount(Selector, {
      props: { options: stringOptions, modelValue: [], multiple: true },
      slots: {
        "trigger-label":
          '<div class="inner-editable" contenteditable="true"><span class="editable-child">text</span></div>',
      },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": createPopoverStub(toggleSpy),
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
      attachTo: document.body,
    });

    const childElement = wrapper.find(".editable-child").element;
    ["Home", "End", " ", "Enter"].forEach((key) => {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      childElement.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    childElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(toggleSpy).toHaveBeenCalledWith(true);

    wrapper.unmount();
  });

  it("still opens the list on ArrowDown from a slotted input", () => {
    const toggleSpy = vi.fn();
    const wrapper = mount(Selector, {
      props: { options: stringOptions, modelValue: [], multiple: true },
      slots: { "trigger-label": '<input class="inner-input" />' },
      global: {
        plugins: [i18n],
        stubs: {
          "orio-control-element": ControlStub,
          "orio-popover": createPopoverStub(toggleSpy),
          "orio-empty-state": EmptyStateStub,
          "orio-icon": true,
          "orio-list-item": ListItem,
          "orio-check-box": true,
        },
      },
      attachTo: document.body,
    });

    const inputElement = wrapper.find(".inner-input").element;
    inputElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(toggleSpy).toHaveBeenCalledWith(true);

    wrapper.unmount();
  });
});
