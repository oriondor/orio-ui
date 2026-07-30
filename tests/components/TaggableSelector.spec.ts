import { describe, it, expect, vi, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import TaggableSelector from "../../src/runtime/components/TaggableSelector.vue";
import Selector from "../../src/runtime/components/Selector.vue";
import Tag from "../../src/runtime/components/Tag.vue";
import ListItem from "../../src/runtime/components/ListItem.vue";
import { i18n } from "../../src/runtime/i18n";

const ControlStub = {
  template: '<div class="control-stub"><slot :control="{}" /></div>',
};

const PopoverStub = defineComponent({
  name: "PopoverStub",
  setup(_, { slots }) {
    const toggle = vi.fn();
    return () =>
      h("div", { class: "popover-stub" }, [
        slots.default?.({ toggle, isOpen: true }),
        h("div", { class: "popover-content" }, slots.content?.({ toggle })),
      ]);
  },
});

const globalOptions = {
  plugins: [i18n],
  stubs: {
    "orio-selector": Selector,
    "orio-control-element": ControlStub,
    "orio-popover": PopoverStub,
    "orio-empty-state": {
      props: ["title"],
      template: '<div class="empty-state-stub">{{ title }}</div>',
    },
    "orio-icon": true,
    "orio-list-item": ListItem,
    "orio-check-box": true,
    "orio-tag": Tag,
    "orio-button": {
      template:
        '<button class="button-stub" @click="$emit(\'click\')"><slot /></button>',
    },
  },
};

const objectOptions = [
  { id: 1, name: "Vue" },
  { id: 2, name: "Nuxt" },
];

describe("TaggableSelector", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders chips using field/optionName for arbitrary option shapes", () => {
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [objectOptions[0]],
        field: "id",
        optionName: "name",
      },
      global: globalOptions,
    });

    const chip = wrapper.find(".taggable-trigger .tag");
    expect(chip.exists()).toBe(true);
    expect(chip.text()).toBe("Vue");
  });

  it("renders a single checkbox per option, from the list item", () => {
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
      },
      global: globalOptions,
    });

    const listItems = wrapper.findAll(".popover-content .list-item");
    expect(listItems.length).toBe(objectOptions.length);
    listItems.forEach((listItem) => {
      expect(listItem.findAll("orio-check-box-stub").length).toBe(1);
    });
  });

  it("initializes the dropdown highlight when opened from the search input", async () => {
    const wrapper = mount(TaggableSelector, {
      props: { options: objectOptions, modelValue: [], optionName: "name" },
      global: globalOptions,
    });

    expect(
      wrapper.findAll(".popover-content .list-item.highlighted"),
    ).toHaveLength(0);

    await wrapper.find(".taggable-search").trigger("click");

    expect(
      wrapper.findAll(".popover-content .list-item.highlighted"),
    ).toHaveLength(1);
  });

  it("filters options with the search model", async () => {
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        search: "vu",
        "onUpdate:search": () => {},
      },
      global: globalOptions,
    });

    const optionLabels = wrapper
      .findAll(".popover-content .list-item")
      .map((listItem) => listItem.text());
    expect(optionLabels.join(" ")).toContain("Vue");
    expect(optionLabels.join(" ")).not.toContain("Nuxt");
  });

  it("fires create on Enter when no options match the search and clears the input", async () => {
    const onCreate = vi.fn();
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        onCreate,
      },
      global: globalOptions,
    });

    const searchInput = wrapper.find(".taggable-search");
    await searchInput.setValue("Zzz");
    await searchInput.trigger("keydown", { key: "Enter" });

    expect(onCreate).toHaveBeenCalledWith("Zzz");
    expect(wrapper.emitted("update:search")?.at(-1)).toEqual([""]);
  });

  it("does not fire create on Enter while matching options exist", async () => {
    const onCreate = vi.fn();
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        onCreate,
      },
      global: globalOptions,
    });

    const searchInput = wrapper.find(".taggable-search");
    await searchInput.setValue("Vu");
    await searchInput.trigger("keydown", { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("selects the keyboard-highlighted option on Enter instead of creating", async () => {
    const onCreate = vi.fn();
    const modelValue: object[] = [];
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue,
        optionName: "name",
        onCreate,
      },
      global: globalOptions,
    });

    const searchInput = wrapper.find(".taggable-search");
    await searchInput.setValue("Vu");
    // ArrowDown bubbles from the search input up to the trigger keydown handler
    await searchInput.trigger("keydown", { key: "ArrowDown" });
    await searchInput.trigger("keydown", { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
    expect(modelValue).toEqual([objectOptions[0]]);
    const chip = wrapper.find(".taggable-trigger .tag");
    expect(chip.exists()).toBe(true);
    expect(chip.text()).toBe("Vue");
  });

  it("does not fire create for an exact label match", async () => {
    const onCreate = vi.fn();
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        onCreate,
      },
      global: globalOptions,
    });

    const searchInput = wrapper.find(".taggable-search");
    await searchInput.setValue("Vue");
    await searchInput.trigger("keydown", { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("fires create with the search text when the create button is clicked and clears the input", async () => {
    const onCreate = vi.fn();
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        onCreate,
      },
      global: globalOptions,
    });

    await wrapper.find(".taggable-search").setValue("Design");
    await wrapper.find(".create-option .button-stub").trigger("click");

    expect(onCreate).toHaveBeenCalledWith("Design");
    expect(wrapper.emitted("update:search")?.at(-1)).toEqual([""]);
  });

  it("shows the create button by default and hides it when allowCreate is false", async () => {
    const enabled = mount(TaggableSelector, {
      props: { options: objectOptions, modelValue: [], optionName: "name" },
      global: globalOptions,
    });
    await enabled.find(".taggable-search").setValue("New skill");
    expect(enabled.find(".create-option").exists()).toBe(true);

    const disabled = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        allowCreate: false,
      },
      global: globalOptions,
    });
    await disabled.find(".taggable-search").setValue("New skill");
    expect(disabled.find(".create-option").exists()).toBe(false);
  });

  it("does not fire create on Enter when allowCreate is false", async () => {
    const onCreate = vi.fn();
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
        allowCreate: false,
        onCreate,
      },
      global: globalOptions,
    });

    const searchInput = wrapper.find(".taggable-search");
    await searchInput.setValue("Zzz");
    await searchInput.trigger("keydown", { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("shows the no-matches empty state when the search has no results", async () => {
    const wrapper = mount(TaggableSelector, {
      props: { options: objectOptions, modelValue: [], optionName: "name" },
      global: globalOptions,
    });

    await wrapper.find(".taggable-search").setValue("Zzz");

    expect(wrapper.findAll(".popover-content .list-item")).toHaveLength(0);
    expect(wrapper.find(".empty-state-stub").text()).toBe("No matches found");
  });

  it("leaves typing keys to the search input instead of the trigger keydown handler", () => {
    const wrapper = mount(TaggableSelector, {
      props: {
        options: objectOptions,
        modelValue: [],
        optionName: "name",
      },
      global: globalOptions,
      attachTo: document.body,
    });

    const searchInputElement = wrapper.find(".taggable-search").element;
    ["Home", "End", " ", "ArrowLeft", "ArrowRight"].forEach((key) => {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      searchInputElement.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    wrapper.unmount();
  });

  it("prevents Enter in the search field from submitting a parent form", () => {
    const onSubmit = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h("form", { onSubmit }, [
            h(TaggableSelector, {
              options: objectOptions,
              modelValue: [],
              optionName: "name",
            }),
          ]);
      },
    });

    const wrapper = mount(Host, {
      global: globalOptions,
      attachTo: document.body,
    });

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    wrapper.find(".taggable-search").element.dispatchEvent(event);

    // preventDefault on the keydown is what stops implicit form submission
    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    wrapper.unmount();
  });
});
